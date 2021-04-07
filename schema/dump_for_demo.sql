-- Script to be run from "ec2-user@ip-10-0-1-173 (ssh phenopolis_api)", accessed only via "neuromancer".
-- this script need to be copied in the server referred above.
-- run: psql -f dump_for_demo.sql "service=dev_root"

\! cd ; mkdir -p for_demo

-- get variants
\copy (select v.* from phenopolis.variant v join phenopolis.individual_variant iv on iv.variant_id = v.id join phenopolis.individual i on iv.individual_id = i.id  where i.id = any('{8258,8256,8268,8267}')) to 'for_demo/phenopolis.variant.csv' csv header;
-- COPY 4104

-- get individual_variant
\copy (select iv.* from phenopolis.individual_variant iv join phenopolis.individual i on iv.individual_id = i.id where i.id = any('{8258,8256,8268,8267}')) to 'for_demo/phenopolis.individual_variant.csv' csv header;
-- COPY 4104

-- get individual_gene
-- WARN: empty in phenopolis_dev_db
-- built manually elsewhere

-- get individual
\copy (select * from phenopolis.individual i where i.id = any('{8258,8256,8268,8267}')) to 'for_demo/phenopolis.individual.csv' csv header;
-- COPY 4

-- get genes
\copy (select * from ensembl.gene g where g.hgnc_symbol = any('{TTLL5,DRAM2,GAST}')) to 'for_demo/ensembl.gene.csv' csv header;
-- COPY 7

-- get variant_gene
\copy (select vg.* from phenopolis.variant_gene vg join ensembl.gene g on vg.gene_id = g.ensembl_gene_id where g.hgnc_symbol = any('{TTLL5,DRAM2,GAST}')) to 'for_demo/phenopolis.variant_gene.csv' csv header;
-- COPY 242