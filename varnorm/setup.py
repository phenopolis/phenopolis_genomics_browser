from distutils.core import setup

setup(
    name='varnorm',
    version='0.2',
    author='Wei-Yi Cheng',
    author_email='wei-yi.cheng@mssm.edu',
    packages=['varnorm', 'varnorm.test'],
    include_package_data = True,
    scripts=['bin/normVCF', 
            'bin/reinstallPkg', 
            'bin/elementizeCGFormat', 
            'bin/normVEL',
            'bin/normBIM'],
    url='http://hidysabc.com/blog',
    license='LICENSE.txt',
    description='Variant normalization tool kit',
    long_description=open('README.md').read(),
    install_requires=[
        "hgvs >= 0.8",
        "pygr >= 0.8.2",
        "argparse >= 1.2.1"
    ]
)

