-- order of import matters
\copy phenopolis.variant (chrom,pos,ref,alt,id,dbsnp,variant_class,dann,cadd_phred,revel,fathmm_score) FROM '/app/schema/seed/phenopolis.variant.csv' delimiter ',' CSV HEADER;
\copy phenopolis.transcript_consequence FROM '/app/schema/seed/phenopolis.transcript_consequence.csv' delimiter ',' CSV HEADER;
\copy phenopolis.variant_gene FROM '/app/schema/seed/phenopolis.variant_gene.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene FROM '/app/schema/seed/ensembl.gene.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene_synonym FROM '/app/schema/seed/ensembl.gene_synonym.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript FROM '/app/schema/seed/ensembl.transcript.csv' delimiter ',' CSV HEADER;
\copy ensembl.transcript_uniprot FROM '/app/schema/seed/ensembl.transcript_uniprot.csv' delimiter ',' CSV HEADER;
\copy hpo.term FROM '/app/schema/seed/hpo.term.csv' delimiter ',' CSV HEADER;
\copy hpo.is_a FROM '/app/schema/seed/hpo.is_a.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual FROM '/app/schema/seed/phenopolis.individual.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_feature FROM '/app/schema/seed/phenopolis.individual_feature.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_gene FROM program 'sed "s/#.*//g" /app/schema/seed/phenopolis.individual_gene.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_variant (individual_id,variant_id,chrom,pos,ref,alt,zygosity,status,clinvar_id,pubmed_id,comment,user_id,timestamp,dp,fs,mq,qd,filter) FROM '/app/schema/seed/phenopolis.individual_variant.csv' delimiter ',' CSV HEADER;
REFRESH MATERIALIZED VIEW hpo.is_a_path;
