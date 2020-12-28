#!/usr/bin/env python
"""Import an individual's VAR.tsv file"""

import os
import re
import sys
import atexit
import logging
import tempfile
from argparse import ArgumentParser, RawDescriptionHelpFormatter
from urllib.parse import urlparse

import boto3
import psycopg2  # type: ignore
from psycopg2 import sql
from botocore.exceptions import ClientError

logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")

IMPORT_TABLE = sql.Identifier("iv_import")


class ScriptError(Exception):
    """Controlled exception raised by the script."""


def main():
    opt = parse_cmdline()
    logger.setLevel(opt.loglevel)

    if opt.resource.startswith("s3://"):
        download_from_aws(opt)
    else:
        opt.file = opt.resource

    with psycopg2.connect(opt.dsn) as conn:
        create_temp_table(opt, conn)
        import_temp_table(opt, conn)
        # upsert_individual(opt, conn)  # if we will need it
        import_variant(opt, conn)
        import_variant_gene(opt, conn)
        import_individual_variant(opt, conn)


def download_from_aws(opt):
    """
    Download opt.resource from aws into a temp file.

    After download store the file name in `opt.file`.
    """
    check_aws_config(opt)

    # s3://phenopolis-individuals/PH00009704/VAR.tsv
    #      ^                      ^
    #      bucket                 filename

    parts = urlparse(opt.resource)
    path = parts.path.lstrip("/")
    indid = path.split("/", 1)[0]
    if not indid.startswith("PH"):
        raise ScriptError(f"cannot see an individual id in the {opt.resource} url")
    if not opt.individual:
        opt.individual = indid

    # Download the s3 file into the temporary file
    s3 = boto3.resource("s3", endpoint_url="https://s3.eu-central-1.wasabisys.com")
    bucket = s3.Bucket(parts.netloc)
    with tempfile.NamedTemporaryFile(delete=False) as f:
        opt.file = f.name
        atexit.register(drop_temp_file, f.name)
        logger.info("downloading %s into temp file %s", opt.resource, f.name)
        try:
            bucket.download_fileobj(path, f)
        except ClientError as exc:
            raise ScriptError(f"error downloading file: {exc}")


def drop_temp_file(filename):
    if os.path.exists(filename):
        logger.info("dropping temp file %s", filename)
        os.remove(filename)
    else:
        logger.warn("file name %s not found", filename)


def check_aws_config(opt):
    """Bail out if there's something obviously broken in aws."""
    for varname in ("AWS_SECRET_ACCESS_KEY", "AWS_ACCESS_KEY_ID"):
        if not os.environ.get(varname):
            raise ScriptError(f"env var {varname} not set: this is not gonna work")


def create_temp_table(opt, conn):
    temp = sql.SQL("temp " if not opt.keep_temp else "")
    logger.info("creating %stable %s", temp.as_string(conn), IMPORT_TABLE.as_string(conn))

    titles = get_tsv_titles(opt)
    parts = []

    parts.append(sql.SQL("create {}table {} (").format(temp, IMPORT_TABLE))
    types = {
        "pos": "bigint",
        "dann": "float4",
        "cadd_phred": "float4",
        "revel": "float4",
        "fathmm_score": "text",
        "canonical": "int",
        "dp": "smallint",
        "fs": "float4",
        "mq": "float4",
        "qd": "float4",
        "het": "bool",
        "hom": "bool",
        "strand": "smallint",
    }

    for title in titles:
        parts.append(sql.Identifier(title))
        parts.append(sql.SQL(types.get(title, "text")))
        parts.append(sql.SQL(","))

    parts[-1] = sql.SQL(")")

    cur = conn.cursor()
    try:
        cur.execute(sql.SQL(" ").join(parts))
    except psycopg2.errors.DuplicateTable:
        raise ScriptError(
            f"table {IMPORT_TABLE.strings[0]} already exists: if you used '--keep-temp' you should remove it"
        )

    if opt.keep_temp:
        conn.commit()


def import_temp_table(opt, conn):
    logger.info("importing %s into %s", opt.file, IMPORT_TABLE.as_string(conn))

    cur = conn.cursor()
    with open(opt.file) as f:
        stmt = sql.SQL("copy {} from stdin (format csv, header true, delimiter '\t')").format(IMPORT_TABLE)
        cur.copy_expert(stmt, f)

    cur.execute(sql.SQL("analyze {}").format(IMPORT_TABLE))

    if opt.keep_temp:
        conn.commit()


# def upsert_individual(opt, conn):
#     indid = get_individual_id(opt)
#     cur = conn.cursor()
#     cur.execute(
#         "select id from phenopolis.individual where phenopolis_id = %s", (indid,),
#     )
#     rec = cur.fetchone()
#     if not rec:
#         # TODO: insert new?
#         raise ScriptError(f"individual not found: {indid}")

#     return rec[0]


def import_variant(opt, conn):
    cur = conn.cursor()
    cur.execute(
        sql.SQL(
            """
insert into phenopolis.variant (
    chrom, pos, ref, alt, dbsnp, variant_class, dann, cadd_phred, revel, fathmm_score)
select
    iv.chrom, iv.pos, iv.ref, iv.alt, iv.dbsnp, iv.variant_class,
    iv.dann, iv.cadd_phred, iv.revel,
    string_to_array(iv.fathmm_score, ',', '.')::float4[]
from {} iv
on conflict on constraint variant_key do nothing
"""
        ).format(IMPORT_TABLE)
    )
    logger.info("variant records imported: %s", cur.rowcount)


def import_individual_variant(opt, conn):
    cur = conn.cursor()
    indid = get_individual_id(opt)

    cur.execute(
        sql.SQL(
            """
insert into phenopolis.individual_variant (
    individual_id, variant_id, chrom, pos, ref, alt,
    dp, fs, mq, qd, filter, zygosity
    )
select
    %s, v.id, iv.chrom, iv.pos, iv.ref, iv.alt,
    iv.dp, iv.fs, iv.mq, iv.qd, iv.filter,
    case when iv.het then 'HET' when iv.hom then 'HOM' end
from {} iv
join phenopolis.variant v
    on (v.chrom, v.pos, v.ref, v.alt) = (iv.chrom, iv.pos, iv.ref, iv.alt)
on conflict on constraint individual_variant_pkey do nothing
"""
        ).format(IMPORT_TABLE),
        (indid,),
    )
    logger.info("individual/variant records imported: %s", cur.rowcount)


def import_variant_gene(opt, conn):
    cur = conn.cursor()

    cur.execute(
        sql.SQL(
            """
insert into phenopolis.variant_gene (
    variant_id, gene_id, transcript_id, strand, exon, most_severe_consequence,
    impact, hgvs_c, hgvs_p, canonical)
select
    v.id, iv.gene_id, iv.transcript_id, iv.strand, iv.exon, iv.most_severe_consequence,
    lower(iv.impact), iv.hgvsc, iv.hgvsp, iv.canonical != 0
from {} iv
join phenopolis.variant v
    on (v.chrom, v.pos, v.ref, v.alt) = (iv.chrom, iv.pos, iv.ref, iv.alt)
on conflict on constraint variant_gene_pkey do nothing
"""
        ).format(IMPORT_TABLE)
    )
    logger.info("variant/gene records imported: %s", cur.rowcount)


def get_tsv_titles(opt, __cache=[]):
    if __cache:
        return __cache[0]

    with open(opt.file) as f:
        line = f.readline()

    titles = line.lower().split()
    __cache.append(titles)
    return titles


def get_individual_id(opt, __cache=[]):
    if __cache:
        return __cache[0]

    if opt.individual:
        rv = int(opt.individual.replace("PH", ""))

    else:
        m = re.search(r"PH(\d+)", opt.file)
        if m:
            rv = int(m.group(1))

    if rv:
        __cache.append(rv)
        logger.info("importing data for individual %s", rv)
        return rv
    else:
        raise ScriptError("no individual found in the resource or --individual")


def parse_cmdline():
    parser = ArgumentParser(description=__doc__, formatter_class=RawDescriptionHelpFormatter)

    parser.add_argument("resource", metavar="RES", help="the resource to import (file, s3:// url)")
    parser.add_argument("--dsn", default="", help="connection string to import into [default: %(default)r]")
    parser.add_argument("--keep-temp", action="store_true", help="keep the temp table after import (for debugging)")
    parser.add_argument("--individual", help="individual id to import (otherwise try from the filename)")

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
