#!/usr/bin/env python
"""Import an Human Phenotype Ontology data .obo file into the database

See https://hpo.jax.org/app/download/ontology
"""

import logging
import re
import sys

import obonet
import psycopg2

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

DEFAULT_URL = "https://raw.githubusercontent.com/obophenotype/human-phenotype-ontology/master/hp.obo"


def main():
    opt = parse_cmdline()

    logger.info("reading %s", opt.input)
    net = obonet.read_obo(opt.input)

    logger.info("connecting to %s", opt.dsn)
    with psycopg2.connect(opt.dsn) as conn:
        cur = conn.cursor()

        logger.info("importing terms")
        for k, node in net.nodes.items():
            import_term(cur, k, node)

        logger.info("importing other details")
        for k, node in net.nodes.items():
            import_is_a(cur, k, node)
            import_xref(cur, k, node)
            import_synonym(cur, k, node)
            import_alt(cur, k, node)

        logger.info("refreshing path matview")
        cur.execute("refresh materialized view hpo.is_a_path")


def import_term(cur, k, node):
    descr = node.get("def")
    if descr is not None:
        descr = dequote(descr)

    args = [id_to_int(k), k, node["name"], descr, node.get("comment")]

    cur.execute(
        """
insert into hpo.term (id, hpo_id, name, description, comment)
values (%s, %s, %s, %s, %s)
on conflict on constraint term_pkey do update set
    name = excluded.name,
    description = excluded.description,
    comment = excluded.comment
""",
        args,
    )


def import_is_a(cur, k, node):
    isas = node.get("is_a")
    if not isas:
        return

    for isa in isas:
        if "!" in isa:
            isa = isa.split("!")[0].strip()

        cur.execute(
            """
insert into hpo.is_a (term_id, is_a_id) values (%s, %s)
on conflict on constraint is_a_pkey do nothing
""",
            [id_to_int(k), id_to_int(isa)],
        )


def import_xref(cur, k, node):
    xrefs = node.get("xref")
    if not xrefs:
        return

    for xref in xrefs:
        if " " in xref:
            xref, descr = xref.split(" ", 1)
            descr = dequote(descr)
        else:
            descr = None

        cur.execute(
            """
insert into hpo.xref (term_id, xref, description) values (%s, %s, %s)
on conflict on constraint xref_pkey do update
    set description = excluded.description
""",
            [id_to_int(k), xref, descr],
        )


def import_synonym(cur, k, node):
    syns = node.get("synonym")
    if not syns:
        return

    for syn in syns:
        syn = dequote(syn)

        cur.execute(
            """
insert into hpo.synonym (term_id, description) values (%s, %s)
on conflict on constraint synonym_term_id_description_key do nothing
""",
            [id_to_int(k), syn],
        )


def import_alt(cur, k, node):
    alts = node.get("alt_id")
    if not alts:
        return

    for alt in alts:
        cur.execute(
            """
insert into hpo.alt (id, alt_id, term_id) values (%s, %s, %s)
on conflict on constraint alt_pkey do nothing
""",
            [id_to_int(alt), alt, id_to_int(k)],
        )


def id_to_int(s):
    assert s.startswith("HP:")
    return int(s.split(":")[1])


def dequote(s):
    assert s.startswith('"')
    rv = re.sub(r'^"([^"]+)".*$', r"\1", s)
    assert '"' not in rv
    return rv


def parse_cmdline():
    from argparse import ArgumentParser

    parser = ArgumentParser(description=__doc__)
    parser.add_argument(
        "input", nargs="?", default=DEFAULT_URL, help="file name or url to import from [default: %(default)s]",
    )
    parser.add_argument(
        "--dsn", default="", help="connection string to import into [default: %(default)r]",
    )

    opt = parser.parse_args()

    return opt


if __name__ == "__main__":
    sys.exit(main())
