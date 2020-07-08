-- Export Demo DATA
-- \copy users TO 'db/seed/users.csv' delimiter ';' CSV HEADER;
-- \copy variants TO 'variants.csv' delimiter ',' CSV HEADER;
-- \copy het_variants TO 'het_variants.csv' delimiter ',' CSV HEADER;
-- \copy hom_variants TO 'hom_variants.csv' delimiter ',' CSV HEADER;
-- \copy genes TO 'genes.csv' delimiter ',' CSV HEADER;
-- \copy individuals TO 'individuals.csv' delimiter ',' CSV HEADER;
-- \copy hpo TO 'hpo.csv' delimiter ',' CSV HEADER;
-- \copy users_individuals TO 'users_individuals.csv' delimiter ',' CSV HEADER;
-- \copy user_config TO 'user_configs.csv' delimiter ',' CSV HEADER;

-- Load Demo DATA
\copy public.users FROM '/app/db/seed/users.csv' delimiter ';' CSV HEADER;
\copy public.variants FROM '/app/db/seed/variants.csv' delimiter ',' CSV HEADER;
\copy public.het_variants FROM '/app/db/seed/het_variants.csv' delimiter ',' CSV HEADER;
\copy public.hom_variants FROM '/app/db/seed/hom_variants.csv' delimiter ',' CSV HEADER;
\copy public.genes FROM '/app/db/seed/genes.csv' delimiter ',' CSV HEADER;
\copy public.individuals FROM '/app/db/seed/individuals.csv' delimiter ',' CSV HEADER;
\copy public.hpo FROM '/app/db/seed/hpo.csv' delimiter ',' CSV HEADER;
\copy public.users_individuals FROM '/app/db/seed/users_individuals.csv' delimiter ',' CSV HEADER;
\copy public.user_config FROM '/app/db/seed/user_configs.csv' delimiter ',' CSV HEADER;
