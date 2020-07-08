'''
To test pysam in docker
docker run --rm -p 5432:5432 -p 8000:8000 -w /app -v ${PWD}:/app --name pheonopolis_api --env-file=env_vars.sh phenopolis_api python test_pysam_S3.py
'''

import os
import boto3
import pysam
import psycopg2

variant_id = '22-38212762-A-G'
# variant_id = '14-76156575-A-G'

# need to enable ports in docker-compose.yml
# db = psycopg2.connect(host='host.docker.internal', database='phenopolis_db', user='phenopolis_api', password='phenopolis_api')
db = psycopg2.connect(host=os.environ['DB_HOST'], database=os.environ['DB_DATABASE'], user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'])
c = db.cursor()
c.execute("select external_id, internal_id from individuals")
pheno_ids = [dict(zip([h[0] for h in c.description], r)) for r in c.fetchall()]
phenoid_mapping = {ind['external_id']: ind['internal_id'] for ind in pheno_ids}

chrom, pos, ref, alt, = variant_id.split('-')

pos = int(pos)

s3 = boto3.client('s3', aws_secret_access_key=os.environ['VCF_S3_SECRET'],
                  aws_access_key_id=os.environ['VCF_S3_KEY'],
                  region_name="eu-west-2",
                  config=boto3.session.Config(signature_version='s3v4'))
vcf_index = s3.generate_presigned_url('get_object', Params={'Bucket': 'phenopolis-vcf', 'Key': 'August2019/merged2.vcf.gz.tbi'}, ExpiresIn=5000)
vcf_file = s3.generate_presigned_url('get_object', Params={'Bucket': 'phenopolis-vcf', 'Key': 'August2019/merged2.vcf.gz'}, ExpiresIn=5000)
variant_file = pysam.VariantFile(vcf_file, index_filename=vcf_index)
vsam = variant_file.fetch(chrom, pos - 1, pos)
v = next(vsam)
print(dict(v.info))
