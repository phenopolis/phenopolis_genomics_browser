-- order of import matters
\copy phenopolis.variant (id,chrom,pos,ref,alt) FROM '/app/schema/seed/phenopolis.variant.csv' delimiter ',' CSV HEADER;
\copy phenopolis.transcript_consequence FROM '/app/schema/seed/phenopolis.transcript_consequence.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_variant (individual_id,variant_id,chrom,pos,ref,alt,zygosity) FROM '/app/schema/seed/phenopolis.individual_variant.csv' delimiter ',' CSV HEADER;
\copy ensembl.gene FROM '/app/schema/seed/ensembl.gene.csv' delimiter ',' CSV HEADER;
\copy hpo.term FROM '/app/schema/seed/hpo.term.csv' delimiter ',' CSV HEADER;
\copy hpo.is_a FROM '/app/schema/seed/hpo.is_a.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual FROM '/app/schema/seed/phenopolis.individual.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_feature FROM '/app/schema/seed/phenopolis.individual_feature.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_gene FROM '/app/schema/seed/phenopolis.individual_gene.csv' delimiter ',' CSV HEADER;
refresh materialized view hpo.is_a_path;
