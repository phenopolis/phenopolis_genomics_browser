import sys
import copy
import gzip
from varcharkey import VarCharKey
from pyhgvs import *
from pygr.seqdb import SequenceFileDB

class VCFNormalization(object):
    
    def __init__(self, inFile, genome, vkey = False, verbose=False, log=sys.stderr):
        self.inFile = inFile
        self.verbose = verbose
        self.log = log
        self.vkey=vkey
        self.genome = SequenceFileDB(genome)
        self.infoHeader = "[" + self.__class__.__name__ + "]"

    def info(self, message):
        if self.verbose:
            print >> self.log, self.infoHeader + message

    def normAVar(self, chrom, start, end, ref, alt):
        if len(ref) == 1 and len(alt) == 1 and alt != "-" and ref != "-":
            return chrom, start, end, ref, alt
        if not ref:
            ref = str(self.genome['chr'+chrom][(start-1):end]).upper()
        if ref == '.' or ref == '-':
            start -= 1
            ref = str(self.genome['chr'+chrom][start-1]).upper()
            alt = ref + alt
        elif alt == '.' or alt == '<DEL>' or alt == '-':
            start -= 1
            prefix = str(self.genome['chr'+chrom][start-1]).upper()
            ref = prefix+ref
            alt = prefix

        nv = normalize_variant('chr' + chrom, start, ref, [alt], self.genome)
        ref_norm = nv.ref_allele
        alt_norm = nv.alt_alleles[0]
        start_norm = nv.position.chrom_start
        end_norm = start_norm + len(ref_norm) - 1
        return chrom, start_norm, end_norm, ref_norm, alt_norm

    def normAVkey(self, vkey):
        if VarCharKey.genome == None:
            print >> sys.stderr, "ERROR: `HG19` environment variable is not set, cannot normalize variant."
            raise
        (chrom, start, end, ref, alt) = VarCharKey.k2v(vkey)
        if ref == alt:
            return None
        if len(ref) > 1 or len(alt) > 1:
            chrom, start, end, ref, alt = self.normAVar(chrom, start, end, ref, alt)
            return VarCharKey.v2k(chrom, start, end, alt)
        return vkey


    def parse_line_nosample(self, line):
        if line.startswith('#'):
            return [line.strip()]
        tokens = line.strip().split('\t')

        chrom = tokens[0].replace('chr', '')
        pos = int(tokens[1])
        varID = tokens[2]
        ref = tokens[3]
        alts = tokens[4].split(',')
        nalts = len(alts)

        out = []

        for a in range(nalts):
            alt = alts[a]
            
            tk = copy.deepcopy(tokens)

            if ref == '.':
                pos -= 1
                ref = str(self.genome['chr'+chrom][pos-1]).upper()
                alt = ref + alt
            elif alt == '.' or alt == '<DEL>':
                pos -= 1
                prefix = str(self.genome['chr'+chrom][pos-1]).upper()
                ref = prefix+ref
                alt = prefix

            nv = normalize_variant('chr'+chrom, pos, ref, [alt], self.genome)
            ref_norm = nv.ref_allele
            alt_norm = nv.alt_alleles[0]
            start_norm = nv.position.chrom_start
            end_norm = start_norm + len(ref_norm) - 1
            
            if self.vkey:
                vk = VarCharKey.v2k(chrom, start_norm, end_norm, alt_norm)
                if vk != None:
                    info = tk[7]
                    if info == '.':
                        info = "VKEY=" + vk
                    else:
                        info = "VKEY=" + vk + ";" + info
                    tk[7] = info

            tk[:5] = [chrom, str(start_norm), varID, ref_norm, alt_norm]

            out.append("\t".join(tk[:8]))

        return out

    def parse_line(self, line):
        if line.startswith('#'):
            return [line.strip()]
        tokens = line.strip().split('\t')

        chrom = tokens[0].replace('chr', '')
        pos = int(tokens[1])
        varID = tokens[2]
        ref = tokens[3]
        alts = tokens[4].split(',')
        nalts = len(alts)
        
        out = []
        rawfields = tokens[8].split(':')
        fieldmap = dict(zip(rawfields, range(len(rawfields)) ) )

        for a in range(nalts):
            alt = alts[a]
            
            tk = copy.deepcopy(tokens)

            if ref == '.':
                pos -= 1
                ref = str(self.genome['chr'+chrom][pos-1]).upper()
                alt = ref + alt
            elif alt == '.' or alt == '<DEL>':
                pos -= 1
                prefix = str(self.genome['chr'+chrom][pos-1]).upper()
                ref = prefix+ref
                alt = prefix

            nv = normalize_variant('chr'+chrom, pos, ref, [alt], self.genome)
            ref_norm = nv.ref_allele
            alt_norm = nv.alt_alleles[0]
            start_norm = nv.position.chrom_start
            end_norm = start_norm + len(ref_norm) - 1
            
            if self.vkey:
                vk = VarCharKey.v2k(chrom, start_norm, end_norm, alt_norm)
                if vk != None:
                    info = tk[7]
                    if info == '.':
                        info = "VKEY=" + vk
                    else:
                        info = "VKEY=" + vk + ";" + info
                    tk[7] = info

            tk[:5] = [chrom, str(start_norm), varID, ref_norm, alt_norm]
            if nalts > 1:
                for j in range(9, len(tk)):
                    ttkk = tk[j].split(':')
                    aac = ttkk[fieldmap['GT']].count(str(a+1))
                    if aac == 0:
                        ttkk[fieldmap['GT']] = '0/0'
                    elif aac == 1:
                        ttkk[fieldmap['GT']] = '0/1'
                    elif aac == 2:
                        ttkk[fieldmap['GT']] = '1/1'
                    tk[j] = ':'.join(ttkk)


            out.append("\t".join(tk))

        return out

    def run(self, out=sys.stdout, keepSample=True):
        parse_line = self.parse_line_nosample
        if keepSample:
            parse_line = self.parse_line
        fi = gzip.open(self.inFile, 'rb') if self.inFile.endswith('gz') else open(self.inFile, 'rb')
        for line in fi:
            too = parse_line(line)
            for t in too:
                print >> out, t
                    
        

