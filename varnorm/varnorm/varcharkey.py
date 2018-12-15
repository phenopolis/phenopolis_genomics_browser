"""
Convert variants to bits then to a unique, reversible key

  -s, --sample          Keep sample information. WARNING: not implemented yet!
Wei-Yi Cheng
"""

import sys
import os
from pygr.seqdb import SequenceFileDB

baseMap = {'A':0, 'T':1, 'C':2, 'G':3}
bit2BaseMap = {0:'A', 1:'T', 2:'C', 3:'G'}
chromMap = {'X':23, 'Y':24, 'M':25}
invChromMap = {'23':'X', '24':'Y', '25':'M'}
codeMap = '0123456789@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
revCodeMap = dict(zip(list(codeMap), range(64)))

def int2VarChar(i, strLength = None):
    #transform integer to characters based on its bit presentation
    chars = ''
    while i > 0:
        chars += codeMap[(i & 63)]
        i >>= 6
    if strLength and strLength > len(chars):
        chars += '0'*(strLength-len(chars))
    return chars[::-1]

def varChar2Int(s):
    i = 0
    for c in s:
        i <<= 6
        i += revCodeMap[c]
    return i

def seq2VarChar(seq):
    seqLen = len(seq)
    seqInt = 0
    for bp in seq:
        seqInt <<= 2
        if bp not in baseMap:
            return None
        seqInt += baseMap[bp]
    return int2VarChar(seqLen, 2) + int2VarChar(seqInt)

def varChar2Seq(s):
    seqLen = varChar2Int(s[:2])
    seqInt = varChar2Int(s[2:])
    seq = ''
    while seqLen > 0:
        seq += bit2BaseMap[seqInt & 3]
        seqInt >>= 2
        seqLen -= 1
    return seq[::-1]

class NoGenomeFileError(Exception):
    def __init__(self,value):
        self.value=value
    def __str__(self):
        return repr(self.value)

class VarCharKey(object):
    refSeqVer = 'HG19'
    genome = None if refSeqVer not in os.environ else SequenceFileDB(os.environ[refSeqVer])
    def __init__(self, chrom, start, end, ref, alt, version=refSeqVer, log=sys.stderr):
        self.chrom = chrom
        self.start = start
        self.end = end
        self.ref = ref
        self.alt = alt
        self.key = VarCharKey.v2k(chrom, start, end, alt)
        self.version=version
        self.log = log
        self.infoHeader = "[" + self.__class__.__name__ + "]"

    def info(self, message):
        if self.verbose:
            print >> self.log, self.infoHeader + message
    
    @staticmethod
    def v2k(chrom, start, end, alt=None, refgenome=37):
        #########
        #
        # Key's bit array (all length in byte)
        # refgenome(1)
        # chrom(1)
        # start(5)
        # end(5)
        # alt(variate length) : first 2 bytes as sequence length, then each base is two bits, A:00, T:01, G:10, C:11
        #                   this setting can contain up to 968 base pairs with fully indexed key
        #########
        
        rgChar = codeMap[refgenome]
        
        if chrom in chromMap:
            chrom = chromMap[chrom]
        chromChar = codeMap[int(chrom)]

        startChar = int2VarChar(start, 5)

        endChar = int2VarChar(end, 5)
        
        altChar = ''
        
        if alt != None:
            altChar = seq2VarChar(alt)
            if altChar == None:
                return None
            altLength = len(altChar)
            keyLength = 13 + altLength
            # check for maximum key length
            if keyLength > 1000:
                print >> sys.stderr,  "Warning: " + repr([chrom, start, end, ref, alt]) 
                print >> sys.stderr, "`alt` length exceeding maximum length! The generated key will not be able to be indexed as a whole through MySQL." 

        return unicode(rgChar + chromChar + startChar + endChar + altChar)

    @staticmethod
    def k2v(k):
        chrom = k[1]
        if VarCharKey.genome == None:
            print >> sys.stderr, "Warning: `HG19` environment variable is not set, cannot obtain reference sequence."
        chrom = str(codeMap.index(k[1]))
        if chrom in invChromMap:
            chrom = invChromMap[chrom]
        k = k[2:]
        start = varChar2Int(k[:5])
        k = k[5:]
        end = varChar2Int(k[:5])
        k = k[5:]
        ref = None
        if VarCharKey.genome != None:
            ref = str(VarCharKey.genome['chr'+chrom][(start-1):end]).upper()
        alt = varChar2Seq(k)
        return (chrom, start, end, ref, alt)

    def __eq__(self, other):
        if isinstance(other, VarCharKey):
            return self.version == other.version and self.key==other.key
        else: 
            return False
    
    def __ne__(self, other):
        return not self.__eq__(other)
