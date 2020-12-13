begin;

-- Extension for trigram search over text fields
CREATE EXTENSION pg_trgm WITH SCHEMA PUBLIC;

-- adds GIST index
CREATE INDEX ON public.genes USING GIST (gene_name public.gist_trgm_ops);
CREATE INDEX ON public.genes USING GIST (other_names public.gist_trgm_ops);
CREATE INDEX ON public.hpo USING GIST (hpo_name public.gist_trgm_ops);

-- add unique constraint to hpo
ALTER TABLE ONLY public.hpo
    ADD CONSTRAINT hpo_pkey PRIMARY KEY (hpo_id);

-- set default value for enabled field in users
ALTER TABLE public.users ALTER COLUMN enabled SET DEFAULT true;

commit;
