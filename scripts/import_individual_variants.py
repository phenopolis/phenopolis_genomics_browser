#!/usr/bin/env python
"""Import an individual's VAR.tsv file"""

import sys
import logging
from argparse import ArgumentParser, RawDescriptionHelpFormatter

import psycopg2  # type: ignore
from psycopg2 import sql

logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")

IMPORT_TABLE = sql.Identifier("iv_csv")


class ScriptError(Exception):
    """Controlled exception raised by the script."""


def main():
    opt = parse_cmdline()
    logger.setLevel(opt.loglevel)

    with psycopg2.connect(opt.dsn) as conn:
        create_temp_table(opt, conn)
        import_temp_table(opt, conn)


def create_temp_table(opt, conn):
    temp = sql.SQL("temp " if not opt.keep_temp else "")
    logger.info("creating %stable %s", temp.as_string(conn), IMPORT_TABLE.as_string(conn))

    titles = get_tsv_titles(opt)
    parts = []

    parts.append(sql.SQL("create {}table {} (").format(temp, IMPORT_TABLE))

    for title in titles:
        parts.append(sql.Identifier(title))
        parts.append(sql.SQL("text"))
        parts.append(sql.SQL(","))

    parts[-1] = sql.SQL(")")

    cur = conn.cursor()
    try:
        cur.execute(sql.SQL(" ").join(parts))
    except psycopg2.errors.DuplicateTable:
        raise ScriptError(
            f"table {IMPORT_TABLE.strings[0]} already exists: if you used '--keep-temp' you should remove it"
        )


def import_temp_table(opt, conn):
    logger.info("importing %s into %s", opt.file, IMPORT_TABLE.as_string(conn))

    cur = conn.cursor()
    with open(opt.file) as f:
        stmt = sql.SQL("copy {} from stdin (format csv, header true, delimiter '\t')").format(IMPORT_TABLE)
        cur.copy_expert(stmt, f)

    cur.execute(sql.SQL("analyze {}").format(IMPORT_TABLE))


def get_tsv_titles(opt, __cache=[]):
    if __cache:
        return __cache[0]

    with open(opt.file) as f:
        line = f.readline()

    titles = line.split()
    __cache.append(titles)
    return titles


def parse_cmdline():
    parser = ArgumentParser(description=__doc__, formatter_class=RawDescriptionHelpFormatter)

    parser.add_argument("file", metavar="FILE", help="the file to import")
    parser.add_argument("--dsn", default="", help="connection string to import into [default: %(default)r]")
    parser.add_argument("--keep-temp", action="store_true", help="keep the temp table after import (for debugging)")

    g = parser.add_mutually_exclusive_group()
    g.add_argument(
        "-q",
        "--quiet",
        help="talk less",
        dest="loglevel",
        action="store_const",
        const=logging.WARN,
        default=logging.INFO,
    )
    g.add_argument(
        "-v",
        "--verbose",
        help="talk more",
        dest="loglevel",
        action="store_const",
        const=logging.DEBUG,
        default=logging.INFO,
    )

    opt = parser.parse_args()

    return opt


if __name__ == "__main__":
    try:
        sys.exit(main())

    except ScriptError as e:
        logger.error("%s", e)
        sys.exit(1)

    except Exception:
        logger.exception("unexpected error")
        sys.exit(1)

    except KeyboardInterrupt:
        logger.info("user interrupt")
        sys.exit(1)
