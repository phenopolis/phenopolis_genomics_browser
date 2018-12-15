variant normalization toolkit
=============

Normalize variants in VCF file using left-aligned normalization. Basically a wrapper around Counsyl's hgvs package.

Prerequisite
-------------

Setup $HG19 environment variable.

python packages:
- hgvs from [Counsyl](https://github.com/counsyl/hgvs)
- pygr

normVCF
-------

Normalize variants in a VCF file.

```shell
$ normVCF -h
usage: normVCF [-h] [-o OUTPUT_FILE] [--reference REF_GENOME] [-v] [--novkey]
               [-s]
               INPUT_FILE

positional arguments:
  INPUT_FILE            Input vcf file for normalization.

optional arguments:
  -h, --help            show this help message and exit
  -o OUTPUT_FILE, --output OUTPUT_FILE
                        Output file. Default: stdout
  --reference REF_GENOME
                        Path to reference genome .fa file. Default: $HG19
                        environmental variable.
  -v, --verbose         Run in verbose mode.
  --novkey              Do not generate vkey.
  -s, --sample          Keep sample information.

```

###Usage example:

```shell

#check for packages installed
(env) $ pip freeze
argparse==1.2.1
hgvs==0.8
pygr==0.8.2
varnorm==0.2
wsgiref==0.1.2

#check for environment variable $HG19
#can also be passed by --reference argument
(env) $ echo $HG19
/path/to/your/hg19.fa

#run simple test
(env) $ normVCF data/test.vcf -o testout.vcf

```

###Generate variant key

Given the version of reference genome build, `chromosome`, `start` position, `end` position and `alt` (alternate allele), a variant key can be computed by the `staticmethod` of class VarCharKey:

```python
>>> from varnorm.varcharkey import VarCharKey
# get the functional arguments of v2k function
>>> help(VarCharKey.v2k)
Help on function v2k in module varnorm.varcharkey:

v2k(chrom, start, end, alt, refgenome=37)
>>> VarCharKey.v2k('1', 565433, 565433, 'T')
u'_102@2t02@2t011'
```

The class output the vkey `\_102@2t02@2t011`. The parameters of the `v2k` function are:

In the case where `alt` was not given to `v2k`, the function will generate vkey only based on the positional information:

```python
>>> VarCharKey.v2k('1', 565433, 565433)
u'_102@2t02@2t'
``` 
The generated vkey can be used as prefix for genomic range qauery. 


###Reverse vkey back into variant

Similar to `v2k` function, the `VarCharKey` class also contains a `staticmethod` to convert vkey back into `(chrom, start, end, ref, alt)` format, the function is called `k2v`:

```python
>>> from varnorm.varcharkey import VarCharKey
>>> VarCharKey.k2v('_102@2t02@2t011')
('1', 565433, 565433, 'C', 'T')

```

which returns the variant. Note that if the `HG19` environment variable was not set, it cannot return `ref` and will give a warning:

```python
# 'HG19' environment variable is not set
>>> 'HG19' in os.environ
False
>>> VarCharKey.k2v('_102@2t02@2t011')
Warning: `HG19` environment variable is not set, cannot obtain reference sequence.
('1', 565433, 565433, None, 'T')

```
