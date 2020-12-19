#!/usr/bin/env python3
"""
Apply database patches.

Database patches are found by default in the 'schema/patches' directory of the
project. They are recorded in the schema_patch table of the database.

The dsn to connect to defaults to a local one (empty connection string). It can
be chosen using the command line or an environment variable. Patches
application is interactive by default.

A script may be associated with a .pre and .post script, that may be written
in any script language, they should just have a shebang (e.g. NAME.sql is
associated with NAME.pre.py and/or NAME.post.sh).
"""

import os
import re
import sys
import shutil
import socket
import psycopg2
from psycopg2.extras import NamedTupleCursor
from glob import glob
import subprocess as sp

import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

logger = logging.getLogger()


class ScriptException(Exception):
    pass


class UserInterrupt(Exception):
    pass


opt = None


def main():
    global opt
    opt = parse_cmdline()
    grab_lock()
    patches = find_patches()
    verify_patch_table(patches)
    patches = remove_applied_patches(patches)
    if not patches:
        return

    logger.info("applying patches to the database '%s'" % opt.dsn)
    try:
        for patch in patches:
            apply_patch(patch)
    finally:
        patches = remove_applied_patches(patches)
        if patches:
            logger.warning("The following patches remain unapplied:")
            for patch in patches:
                logger.warning("* %s" % patch)


def parse_cmdline():
    from optparse import OptionParser

    parser = OptionParser(usage="%prog [options] [patch [...]]", description="Apply patches to a database.",)
    parser.add_option(
        "--dsn",
        metavar="STRING",
        default=os.environ.get("PATCH_DSN", ""),
        help="the database to connect to. Read from env var PATCH_DSN if set" " [default: '%default']",
    )
    patchdir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../schema/patches"))
    parser.add_option(
        "--patches-dir", default=patchdir, help="directory containing the database patches [default: %default]",
    )
    parser.add_option(
        "--yes", "-y", action="store_true", help="assume affermative answer to all the questions",
    )
    parser.add_option("--dry-run", "-n", action="store_true", help="just pretend")

    opt, args = parser.parse_args()
    opt.patches = args

    return opt


def get_connection():
    # to be found in pg_stat_activity
    os.environ["PGAPPNAME"] = "patch_db on %s" % socket.gethostname()
    if opt.dry_run:
        # will work for both psql and psycopg
        os.environ["PGOPTIONS"] = "-c default_transaction_read_only=on"
    try:
        conn = psycopg2.connect(opt.dsn)
        conn.autocommit = True
        return conn
    except psycopg2.OperationalError as e:
        raise ScriptException(
            "failed to connect to dev database: "
            "you should probably set the PATCH_DSN variable.\n"
            "Error was: %s" % e
        )


def grab_lock(_cnn=[]):
    """Grab the lock and keep it until the end of the world (the process)
    """
    logger.debug("trying to grab an advisory lock")

    cid, oid = divmod(3733496049986286126, 2 ** 32)

    if _cnn:
        raise ValueError("attempted to grab the lock more than once")
    cnn = get_connection()

    # keep this connection alive after return
    _cnn.append(cnn)

    # Try and grab the lock
    cur = cnn.cursor()
    cur.execute("select pg_try_advisory_lock(%s, %s)", (cid, oid))
    if cur.fetchone()[0]:
        # lock acquired
        return

    # Lock failed, let's see who is in
    cur.execute(
        """
        select s.application_name
        from pg_locks l
        join pg_stat_activity s on s.pid = l.pid
        where (l.classid, l.objid, l.objsubid) = (%s, %s, 2)
        and l.locktype = 'advisory'
        and s.datname = current_database();
        """,
        (cid, oid),
    )
    r = cur.fetchone()
    if not r:
        msg = "they may have finished by now"
    else:
        msg = r[0]
        if not msg:
            msg = "don't know who"

    raise ScriptException("couldn't lock the database: somebody else is patching it (%s)" % msg)


def with_connection(f):
    def with_connection_(*args, **kwargs):
        if args and hasattr(args[0], "cursor"):
            return f(*args, **kwargs)

        cnn = get_connection()

        # extra paranoia
        if opt.dry_run:
            cur = cnn.cursor()
            cur.execute("set default_transaction_read_only=on")
            os.environ["PGOPTIONS"] = "-c default_transaction_read_only=on"

        try:
            return f(cnn, *args, **kwargs)
        finally:
            cnn.close()

    return with_connection_


def find_patches():
    if opt.patches:
        files = list(opt.patches)
        for patch in files:
            if not os.path.exists(patch):
                raise ScriptException("file not found: '%s'" % patch)

    else:
        if not os.path.isdir(opt.patches_dir):
            raise ScriptException("patch directory not found: '%s'" % opt.patches_dir)
        pattern = os.path.join(opt.patches_dir, "*.sql")
        files = glob(pattern)
        files.sort(key=os.path.basename)

    return files


@with_connection
def table_columns(cnn, name):
    cur = cnn.cursor()
    cur.execute(
        """
        select array_agg(attname)
        from (
            select attname
            from pg_attribute
            where attrelid = %s::regclass
            and not attisdropped
            and attnum > 0
            order by attnum
        ) x
        """,
        (name,),
    )
    return cur.fetchone()[0]


@with_connection
def verify_patch_table(cnn, patches):
    cols = table_columns(cnn, "schema_patch")

    if not cols:
        version = 0
    elif "stage" not in cols:
        version = 1
    else:
        version = 2

    if version == 2:
        return

    patches = {
        1: """
begin;
alter table schema_patch add stage text check (stage = any('{pre,patch,post}'));
alter table schema_patch drop constraint schema_patch_status_check;
alter table schema_patch add check (status = any('{applying,applied,skipped,failed,assumed}'));
commit;
"""
    }

    if version == 0:
        logger.warning(
            "Patches table not found at dsn '%s': assuming all the patches in input have already been applied.",
            opt.dsn,
        )
        confirm("Do you want to continue?")
        if opt.dry_run:
            return

        cur = cnn.cursor()
        cur.execute(
            """
            create table schema_patch (
                name text primary key,
                status text not null check (
                    status = any('{applying,applied,skipped,failed,assumed}')),
                stage text check (stage = any('{pre,patch,post}'))
                status_date timestamp not null)
            """
        )

        for patch in patches:
            register_patch(cnn, patch, status="assumed")

    # Migrate from old schema of the table
    else:
        cur = cnn.cursor()
        while version in patches:
            confirm("Upgrade patch table from version %s to version %s?" % (version, version + 1))
            logger.info("upgrading to patch version %s", version + 1)
            if not opt.dry_run:
                cur.execute(patches[version])
            version += 1


@with_connection
def remove_applied_patches(cnn, patches):
    if not table_columns(cnn, "schema_patch"):
        # assume --dry-run with non existing table
        return []

    cur = cnn.cursor()
    cur.execute(
        """
        select name from schema_patch
        where status in ('applied', 'skipped')"""
    )
    applied = set(r[0] for r in cur.fetchall())

    rv = []
    for patch in patches:
        if os.path.basename(patch) not in applied:
            rv.append(patch)

    return rv


@with_connection
def apply_patch(cnn, filename):
    ans = confirm_patch(filename)
    if ans is SKIP:
        register_patch(cnn, filename, status="skipped")
        return

    elif not ans:
        return

    verify_transaction(filename)

    run_script(cnn, filename, "pre")

    if not opt.dry_run:
        logger.info("applying patch '%s'", filename)
        register_patch(cnn, filename, "applying", stage="patch")
        run_psql(cnn, filename)
    else:
        logger.info("would apply patch '%s'", filename)

    run_script(cnn, filename, "post")
    register_patch(cnn, filename)


@with_connection
def run_script(cnn, filename, suffix):
    """
    Execute a script associated to a db patch.

    The db patch /some/path/foo.sql may have a script called
    /some/path/foo.pre.py.
    """
    name, ext = os.path.splitext(filename)
    script = glob(name + "." + suffix + ".*")
    if script:
        # assume there's at most one
        script = script[0]
    else:
        return

    if not confirm_script(script):
        return

    if opt.dry_run:
        logger.info("would run script '%s'", script)
        return

    register_patch(cnn, filename, "applying", stage=suffix)

    logger.info("running script '%s'", script)

    # propagate the db dsn to the environment
    os.environ["PATCH_DSN"] = opt.dsn

    # execute the script
    script = os.path.abspath(script)
    path = os.path.split(script)[0]
    try:
        sp.check_call(script, cwd=path)
    except sp.CalledProcessError as e:
        try:
            register_patch(cnn, filename, "failed", stage=suffix)
        except Exception as e:
            logger.error("failed to register the patch as failed: %s", e)
        raise ScriptException(e)


@with_connection
def run_psql(cnn, filename):
    psql = shutil.which("psql")
    dirname, basename = os.path.split(filename)
    cmdline = ["psql", "-X", "-e", "--set", "ON_ERROR_STOP=1", "-f", basename, opt.dsn]
    try:
        if not psql:
            raise ScriptException("psql executable not found")
        try:
            sp.check_call(cmdline, cwd=dirname)
        except Exception:
            raise ScriptException("patch failed to apply: %s" % basename)
    except Exception:
        # try to record the failed state and reraise
        try:
            register_patch(cnn, filename, "failed", stage="patch")
        except Exception as e:
            logger.error("failed to register the patch as failed: %s", e)
        raise


@with_connection
def get_patch(cnn, filename):
    name = os.path.basename(filename)
    cur = cnn.cursor(cursor_factory=NamedTupleCursor)
    cur.execute(
        """
        select name, status, stage, status_date
        from schema_patch
        where name = %s
        """,
        (name,),
    )
    rec = cur.fetchone()
    return rec


@with_connection
def register_patch(cnn, filename, status="applied", stage=None):
    logger.debug("registering patch '%s' as %s", filename, status + ("(%s)" % stage if stage else ""))
    if opt.dry_run:
        return

    name = os.path.basename(filename)
    patch = get_patch(cnn, filename)
    if patch:
        if patch.status in ("applied", "skipped"):
            raise ScriptException("unexpected patch to apply in status %s" % patch.status)

        cur = cnn.cursor()
        cur.execute(
            """
            update schema_patch
            set (status, stage, status_date) = (%s, %s, now())
            where name = %s
            """,
            (status, stage, name),
        )
    else:
        cur = cnn.cursor()
        cur.execute(
            """
            insert into schema_patch (name, status, stage, status_date)
            values (%s, %s, %s, now())""",
            (name, status, stage),
        )


def verify_transaction(filename):
    """Make sure that the script contains a BEGIN

    We cannot run psql in single transaction mode or it becomes impossible to
    run certain operations.

    Make sure a BEGIN is used "for real", but the patch may span outside the
    single transaction if needed.
    """
    with open(filename) as f:
        script = f.read()

    if not re.search(r"\bbegin\b", script, re.I):
        raise ScriptException("'BEGIN' not found in the patch %s" % filename)
    if not re.search(r"\bcommit\b", script, re.I):
        raise ScriptException("'COMMIT' not found in the patch %s" % filename)


def confirm(prompt):
    if opt.yes:
        return

    while 1:
        logger.info("%s [Y/n]" % prompt)
        ans = input()
        ans = (ans or "y")[0].lower()
        if ans == "n":
            raise UserInterrupt
        if ans == "y":
            break


SKIP = object()


def confirm_patch(filename, _all=[], _warned=[]):
    if opt.yes or _all:
        return True

    while 1:
        logger.info("Do you want to apply '%s'? " "(Y)es, (n)o, (v)iew, (s)kip forever, (a)ll, (q)uit" % filename)
        ans = input()
        ans = (ans or "y")[0].lower()
        if ans == "q":
            raise UserInterrupt
        if ans == "n":
            logger.warning("skipping patch '%s'", filename)
            if not _warned:
                logger.warning("following patches may fail to apply")
                _warned.append(True)
            return False
        if ans == "v":
            print("Content of the patch '%s':" % filename, file=sys.stderr)
            with open(filename) as f:
                print(f.read(), file=sys.stderr)
        if ans == "y":
            return True
        if ans == "s":
            return SKIP
        if ans == "a":
            _all.append(True)
            return True


def confirm_script(filename):
    if opt.yes:
        return True

    while 1:
        logger.info("Do you want to run the script '%s'? (Y)es, (n)o, (v)iew, (q)uit" % filename)
        ans = input()
        ans = (ans or "y")[0].lower()
        if ans == "q":
            raise UserInterrupt
        if ans == "n":
            logger.warning("skipping script '%s'", filename)
            return False
        if ans == "v":
            print("Content of the script '%s':" % filename, file=sys.stderr)
            with open(filename) as f:
                print(f.read(), file=sys.stderr)
        if ans == "y":
            return True


if __name__ == "__main__":
    try:
        sys.exit(main())

    except UserInterrupt:
        logger.info("user interrupt")
        sys.exit(1)

    except ScriptException as e:
        logger.error("%s", e)
        sys.exit(1)

    except Exception as e:
        logger.exception("Unexpected error: %s - %s", e.__class__.__name__, e)
        sys.exit(1)

    except KeyboardInterrupt:
        logger.info("user interrupt")
        sys.exit(1)
