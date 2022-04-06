#!/usr/bin/env python
r"""Import a kaviar file.

Read a resource (file, url) and print on stdout a stream of data suitable
for COPY. We'll see later what to do with it...

Example usage:

   import_kaviar.py -v http://s3-us-west-2.amazonaws.com/kaviar-160204-public/Kaviar-160204-Public-hg19.vcf.tar
        | psql -c "copy kaviar.annotation_hg19 (chrom, pos, ref, alt, ac, af, an, ds) from stdin" \
            "host=$(dchost db) dbname=phenopolis_db user=phenopolis_api"
"""

import logging
import os
import re
import shlex
import subprocess as sp
import sys
from argparse import ArgumentParser, RawDescriptionHelpFormatter
from contextlib import contextmanager
from shutil import which

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
        return
        yield

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

    seen: set = set()

    def convert_line_data(self, line):
        fields = line.split(b"\t")
        fields[-1] = fields[-1].rstrip()

        chrom = fields[self.CHROM]
        pos = fields[self.POS]
        ref = fields[self.REF]
        alts = fields[self.ALT].split(b",")

        info = self.parse_info_field(fields[self.INFO])
        afs = info["AF"].split(b",")
        acs = info["AC"].split(b",")
        if info["DS"]:
            dss = info["DS"].split(b",")
        else:
            dss = [None] * len(alts)

        for i in range(len(alts)):
            out = [chrom, pos, ref, alts[i], acs[i], afs[i], info["AN"], dss[i] or b"\\N"]
            yield b"\t".join(out) + b"\n"

    def parse_info_field(self, data):
        rv = {}
        for field, rex in zip(self.fields, self._field_regexps):
            m = rex.search(data)
            rv[field] = m.group(1) if m is not None else None
        return rv


def main():
    opt = parse_cmdline()
    logger.setLevel(opt.loglevel)

    tx = VCFTransform(fields=["AC", "AF", "AN", "DS"])

    with open_stream(opt.spec) as f:
        nr = nw = 0
        for line in f:
            nr += 1
            if nr % 1_000_000 == 0:
                logger.debug("%s lines read", nr)
            for L in tx.convert_line(line):
                nw += 1
                sys.stdout.buffer.write(L)

    logger.info("%s lines written", nw)


@contextmanager
def open_stream(spec):
    """
    Open a stream of vcf data to parse from a file spec.

    - if it's an url, download it
    - if it's a tar file, extract the vcf file contained within
    - if the stream is compressed, expand it.

    A file such as:

       http://s3-us-west-2.amazonaws.com/kaviar-160204-public/Kaviar-160204-Public-hg19.vcf.tar

    Is an archive containing a file called:

        Kaviar-160204-Public/vcfs/Kaviar-160204-Public-hg19.vcf.gz

    which contains the data to import.
    """
    is_remote = "://" in spec

    if not is_remote:
        if not os.path.exists(spec):
            raise ScriptError(f"not a valid file: {spec}")

    is_tar = ".tar" in spec

    is_gzip = False
    if not is_tar:
        if spec.endswith(".vcf.gz"):
            is_gzip = True
        elif spec.endswith(".vcs"):
            pass
        else:
            raise ScriptError(f"can't understand spec: {spec}")
    else:
        # tar contains gzip
        is_gzip = True

    cmdline = []

    if is_remote:
        if which("curl"):
            cmdline.append("curl --silent")
        elif which("wget"):
            cmdline.append("wget --quiet -O")
        else:
            raise ScriptError("couldn't find curl or wget")
        cmdline.append(shlex.quote(spec))
        cmdline.append("|")

    if is_tar:
        cmdline.append("tar -xOf")
        if is_remote:
            cmdline.append("-")
        else:
            cmdline.append(shlex.quote(spec))

        m = re.search(r"/Kaviar-(\d+)-Public-([^\./]+)", spec)
        if not m:
            raise ScriptError(f"can't find release number from {spec}")
        cmdline.append(f"Kaviar-{m.group(1)}-Public/vcfs/Kaviar-{m.group(1)}-Public-{m.group(2)}.vcf.gz")
        cmdline.append("|")

    if is_gzip:
        cmdline.append("gzip -cd")
        if not (is_tar or is_remote):
            cmdline.append(shlex.quote(spec))

    cmdline = " ".join(cmdline)
    logger.debug("reading data from command line: %s", cmdline)

    with sp.Popen(cmdline, shell=True, stdout=sp.PIPE) as p:
        yield p.stdout


def parse_cmdline():
    parser = ArgumentParser(description=__doc__, formatter_class=RawDescriptionHelpFormatter)
    parser.add_argument("spec", metavar="FILE_OR_URL", help="the resource to parse")

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
