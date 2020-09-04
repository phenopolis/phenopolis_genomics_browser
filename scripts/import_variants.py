#!/usr/bin/env python
"""Import a variants csv file into the database.
"""

import sys
import logging
from argparse import ArgumentParser, RawDescriptionHelpFormatter

import psycopg2  # type: ignore
from psycopg2 import sql

logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")


class ScriptError(Exception):
    """Controlled exception raised by the script."""


IMPORT_TABLE = sql.Identifier("variant_csv")


def main():
    opt = parse_cmdline()
    logger.setLevel(opt.loglevel)

    with psycopg2.connect(opt.dsn) as conn:
        create_temp_table(opt, conn)
        import_temp_table(opt, conn)
        insert_variants(opt, conn)


def create_temp_table(opt, conn):
    titles = get_csv_titles(opt)
    parts = []

    temp = sql.SQL("temp" if not opt.keep_temp else "")
    parts.append(sql.SQL("create {} table {} (").format(temp, IMPORT_TABLE))

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
            f"table {IMPORT_TABLE.strings[0]} already exista: if you used '--keep-temp' you should remove it"
        )


def import_temp_table(opt, conn):
    cur = conn.cursor()
    with open(opt.file) as f:
        stmt = sql.SQL("copy {} from stdin (format csv, header true)").format(IMPORT_TABLE)
        cur.copy_expert(stmt, f)


def insert_variants(opt, conn):
    cur = conn.cursor()

    # use more memory, less disk
    cur.execute("set local work_mem to '1 GB'")

    cur.execute(
        sql.SQL(
            """
            insert into phenopolis.variant (chrom, pos, ref, alt)
            select chrom, pos::bigint, ref, alt
            from {}
            where (hgvsc, hgvsp) != ('', '')
            group by 1, 2, 3, 4
            on conflict on constraint variant_pkey do nothing
            """
        ).format(IMPORT_TABLE)
    )
    logger.info("imported %s new variant records", cur.rowcount)

    # TODO: do we have to update existing values too?

    cur.execute(
        sql.SQL(
            """
            insert into phenopolis.transcript_consequence
                (chrom, pos, ref, alt, hgvs_c, hgvs_p, consequence, gene_id)
            select *
            from (
                select
                    chrom, pos::bigint, ref, alt,
                    nullif(hgvsc, '') as hgvs_c,
                    nullif(hgvsp, '') as hgvs_p,
                    nullif(most_severe_consequence, '') as consequence,
                    nullif(gene_id, '') as gene_id
                from {}
                where (hgvsc, hgvsp) != ('', '')
            ) s
            where not exists (
                select 1
                from phenopolis.transcript_consequence t
                where (t.chrom, t.pos, t.ref, t.alt) = (s.chrom, s.pos, s.ref, s.alt)
                and (t.hgvs_c, t.hgvs_p, t.consequence)
                    is not distinct from (s.hgvs_c, s.hgvs_p, s.consequence)
            )
            """
        ).format(IMPORT_TABLE)
    )
    logger.info("imported %s new transcript consequence records", cur.rowcount)


def get_csv_titles(opt, __cache=[]):
    if __cache:
        return __cache[0]

    with open(opt.file) as f:
        line = f.readline()

    titles = line.strip().replace('"', "").lower().split(",")
    for t in "chrom pos ref alt hgvsc hgvsp most_severe_consequence gene_id".split():
        if t not in titles:
            raise ScriptError(f"column {t} not found in the csv (available: {', '.join(titles)})")

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
