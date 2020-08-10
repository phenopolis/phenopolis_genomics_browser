#!/usr/bin/env python
r"""Import a gnomad file.

Read a resource (file, url) and print on stdout a stream of data suitable
for COPY. We'll see later what to do with it...

Example usage:

   import_gnomad.py -v https://example.com/gnomad.genomes.r3.0.sites.chr22.vcf.bgz \
        | psql -c "copy gnomad.annotation_v3 from stdin" \
            "host=$(dchost db) dbname=phenopolis_db user=phenopolis_api"
"""

import re
import os
import sys
import gzip
import logging
from urllib.parse import quote
from urllib.request import urlopen

from argparse import ArgumentParser

logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")


class ScriptError(Exception):
    """Controlled exception raised by the script."""


class VCFTransform:
    """
    Transform a stream of VCF data into data suitable for PostgreSQL COPY.
    """

    def __init__(self, fields):
        self.fields = fields
        self._field_regexps = [re.compile(rf"\b{re.escape(f)}=([^;]*)".encode("ascii")) for f in fields]
        self.convert_line = self.convert_line_start
        self.headers = {}  # map title -> col idx

    def convert_line_start(self, line):
        if line.startswith(b"##INFO"):
            self.parse_info(line)
        elif line.startswith(b"##"):
            pass
        elif line.startswith(b"#CHROM"):
            self.parse_header(line)
            self.convert_line = self.convert_line_data
        return None

    def parse_info(self, line):
        # TODO, in case we need other types than int and float
        pass

    CHROM = 0
    POS = 1
    REF = 3
    ALT = 4
    INFO = 7

    def parse_header(self, line):
        headers = line.decode("ascii").lstrip("#").rstrip().split("\t")
        self.headers = {col: i for i, col in enumerate(headers)}

        # If these fail the converter must become more generic
        assert self.headers["CHROM"] == self.CHROM
        assert self.headers["POS"] == self.POS
        assert self.headers["REF"] == self.REF
        assert self.headers["ALT"] == self.ALT
        assert self.headers["INFO"] == self.INFO

    def convert_line_data(self, line):
        fields = line.split(b"\t")
        fields[-1] = fields[-1].rstrip()
        out = [fields[self.CHROM][3:], fields[self.POS], fields[self.REF], fields[self.ALT]]
        out.extend(self.parse_info_field(fields[self.INFO]))
        return b"\t".join(out) + b"\n"

    def parse_info_field(self, data):
        rv = []
        for rex in self._field_regexps:
            m = rex.search(data)
            rv.append(m.group(1) if m is not None else b"\\N")
        return rv


def main():
    opt = parse_cmdline()
    logger.setLevel(opt.loglevel)
    url = as_url(opt.file)
    # TODO: make it configurable
    tx = VCFTransform(fields=["AC", "AF"])
    logger.info("reading from %s", url)
    with urlopen(url) as f:
        if os.path.splitext(url)[-1] in (".bgz", ".gz"):
            f = gzip.GzipFile(fileobj=f)
        nr = nw = 0
        for line in f:
            nr += 1
            if nr % 100_000 == 0:
                logger.debug("%s lines read", nr)
            line = tx.convert_line(line)
            if line is not None:
                nw += 1
                sys.stdout.buffer.write(line)

    logger.info("%s lines written", nw)


def as_url(name):
    if "://" in name:
        # looks like an url to me
        return name

    # if it's a file, does it even exist?
    if not os.path.isfile(name):
        raise ScriptError(f"not a valid file: {name}")

    name = quote(os.path.abspath(name))
    return f"file://{name}"


def parse_cmdline():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("file", help="file (or url) to parse")

    g = parser.add_mutually_exclusive_group()
    g.add_argument(
        "-q",
        "--quiet",
        help="Talk less",
        dest="loglevel",
        action="store_const",
        const=logging.WARN,
        default=logging.INFO,
    )
    g.add_argument(
        "-v",
        "--verbose",
        help="Talk more",
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
