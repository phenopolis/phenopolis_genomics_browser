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
import sys
import socket
import psycopg2
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
            logger.info("The following patches remain unapplied:")
            for patch in patches:
                logger.info("* %s" % patch)


def parse_cmdline():
    from optparse import OptionParser

    parser = OptionParser(
        usage="%prog [options] [patch [...]]",
        description="Apply patches to a database.",
    )
    parser.add_option(
        "--dsn",
        metavar="STRING",
        default=os.environ.get("PATCH_DSN", ""),
        help="the database to connect to. Read from env var PATCH_DSN if set"
        " [default: '%default']",
    )
    patchdir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../schema/patches")
    )
    parser.add_option(
        "--patches-dir",
        default=patchdir,
        help="directory containing the database patches [default: %default]",
    )
    parser.add_option(
        "--yes",
        "-y",
        action="store_true",
        help="assume affermative answer to all the questions",
    )
    parser.add_option(
        "--dry-run", "-n", action="store_true", help="just pretend"
    )

    opt, args = parser.parse_args()
    opt.patches = args

    return opt


def get_connection():
    # to be found in pg_stat_activity
    os.environ["PGAPPNAME"] = "patch_db on %s" % socket.gethostname()
    try:
        return psycopg2.connect(opt.dsn)
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
    cnn.set_isolation_level(0)

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

    raise ScriptException(
        "couldn't lock the database: somebody else is patching it (%s)" % msg
    )


def with_connection(f):
    def with_connection_(*args, **kwargs):
        if args and hasattr(args[0], "cursor"):
            return f(*args, **kwargs)

        cnn = get_connection()

        # extra paranoia
        if opt.dry_run:
            cur = cnn.cursor()
            cur.execute("set default_transaction_read_only=on")
            cnn.commit()

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
            raise ScriptException(
                "patch directory not found: '%s'" % opt.patches_dir
            )
        pattern = os.path.join(opt.patches_dir, "*.sql")
        files = glob(pattern)
        files.sort(key=os.path.basename)

    return files


@with_connection
def table_exists(cnn, name):
    cur = cnn.cursor()
    cur.execute("select 1 from pg_class where relname = %s", (name,))
    return bool(cur.fetchone())


@with_connection
def verify_patch_table(cnn, patches):
    if table_exists(cnn, "schema_patch"):
        return

    cnn.rollback()

    logger.warning(
        "Patches table not found at dsn '%s': "
        "assuming all the patches in input have already been applied.",
        opt.dsn,
    )
    confirm("Do you want to continue?")

    cur = cnn.cursor()
    if not opt.dry_run:
        cur.execute(
            """
            create table schema_patch (
                name text primary key,
                status text not null
                    check (status in ('applied', 'skipped', 'failed')),
                status_date timestamp not null)
            """
        )

    for patch in patches:
        register_patch(cnn, patch)

    cnn.commit()


@with_connection
def remove_applied_patches(cnn, patches):
    if not table_exists(cnn, "schema_patch"):
        # assume --dry-run with non existing table
        return []

    cur = cnn.cursor()
    cur.execute(
        """
        select name from schema_patch
        where status in ('applied', 'skipped')"""
    )
    applied = set(r[0] for r in cur.fetchall())
    cnn.rollback()

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
        cnn.commit()
        return

    elif not ans:
        return

    run_script(filename, "pre")

    # log the patch application now: if application fails it will be rolled
    # back we can't log it later because the script will probably commit
    register_patch(cnn, filename)

    with open(filename) as f:
        script = f.read()
    cur = cnn.cursor()
    try:
        if not opt.dry_run:
            cur.execute(script)
    except Exception as e:
        raise ScriptException("patch '%s' failed:\n%s" % (filename, e))
    else:
        cnn.commit()

    run_script(filename, "post")


def run_script(filename, suffix):
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

    # propagate the db dsn to the environment
    os.environ["PATCH_DSN"] = opt.dsn

    # execute the script
    script = os.path.abspath(script)
    path = os.path.split(script)[0]
    try:
        sp.check_call(script, cwd=path)
    except sp.CalledProcessError as e:
        raise ScriptException(e)


@with_connection
def register_patch(cnn, filename, status="applied"):
    logger.info("registering patch '%s' as %s", filename, status)
    if opt.dry_run:
        return

    cur = cnn.cursor()
    cur.execute(
        """
        insert into schema_patch (name, status, status_date)
        values (%s, %s, now())""",
        (os.path.basename(filename), status),
    )


def confirm(prompt):
    if opt.yes:
        return

    while 1:
        logger.info("%s [y/N]" % prompt)
        ans = input()
        ans = (ans or "n")[0].lower()
        if ans == "n":
            raise UserInterrupt
        if ans == "y":
            break


SKIP = object()


def confirm_patch(filename, _all=[], _warned=[]):
    if opt.yes or _all:
        return True

    while 1:
        logger.info(
            "Do you want to apply '%s'? "
            "(Y)es, (n)o, (v)iew, (s)kip forever, (a)ll, (q)uit" % filename
        )
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
        logger.info(
            "Do you want to run the script '%s'? (Y)es, (n)o, (v)iew, (q)uit"
            % filename
        )
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
