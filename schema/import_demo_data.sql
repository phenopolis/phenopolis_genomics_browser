
\copy phenopolis.variant FROM '/app/schema/seed/phenopolis.variant.csv' delimiter ',' CSV HEADER;
\copy phenopolis.transcript_consequence FROM '/app/schema/seed/phenopolis.transcript_consequence.csv' delimiter ',' CSV HEADER;
\copy phenopolis.individual_variant (individual_id,variant_id,chrom,pos,ref,alt,zygosity) FROM '/app/schema/seed/phenopolis.individual_variant.csv' delimiter ',' CSV HEADER;
