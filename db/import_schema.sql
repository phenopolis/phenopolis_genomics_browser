--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extension for trigram search over text fields
CREATE EXTENSION pg_trgm WITH SCHEMA PUBLIC;

--
-- Name: colname_class_type; Type: TYPE; Schema: public; Owner: phenopolis_api
--

CREATE TYPE public.colname_class_type AS ENUM (
    'preview_onhover'
);


ALTER TYPE public.colname_class_type OWNER TO phenopolis_api;

--
-- Name: colname_types; Type: TYPE; Schema: public; Owner: phenopolis_api
--

CREATE TYPE public.colname_types AS ENUM (
    'links'
);


ALTER TYPE public.colname_types OWNER TO phenopolis_api;

--
-- Name: page_name_types; Type: TYPE; Schema: public; Owner: phenopolis_api
--

CREATE TYPE public.page_name_types AS ENUM (
    'gene',
    'hpo',
    'individual',
    'variant'
);


ALTER TYPE public.page_name_types OWNER TO phenopolis_api;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gene_hpo; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.gene_hpo (
    gene_symbol text,
    hpo_id text
);


ALTER TABLE public.gene_hpo OWNER TO phenopolis_api;

--
-- Name: genes; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.genes (
    stop text,
    gene_id text,
    chrom text,
    strand text,
    full_gene_name text,
    gene_name_upper text,
    other_names text,
    canonical_transcript text,
    start text,
    xstop text,
    xstart text,
    gene_name text
);


ALTER TABLE public.genes OWNER TO phenopolis_api;

--
-- Name: het_variants; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.het_variants (
    "CHROM" text,
    "POS" integer,
    "REF" text,
    "ALT" text,
    individual text
);


ALTER TABLE public.het_variants OWNER TO phenopolis_api;

--
-- Name: hom_variants; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.hom_variants (
    "CHROM" text,
    "POS" integer,
    "REF" text,
    "ALT" text,
    individual text
);


ALTER TABLE public.hom_variants OWNER TO phenopolis_api;

--
-- Name: hpo; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.hpo (
    hpo_id text,
    hpo_name text,
    hpo_ancestor_ids text,
    hpo_ancestor_names text
);


ALTER TABLE public.hpo OWNER TO phenopolis_api;

--
-- Name: individuals; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.individuals (
    external_id text,
    internal_id text,
    sex text,
    observed_features text,
    unobserved_features text,
    genes text,
    ethnicity text,
    consanguinity text,
    pi text,
    observed_features_names text,
    simplified_observed_features text,
    simplified_observed_features_names text,
    ancestor_observed_features text,
    ancestor_observed_features_names text
);


ALTER TABLE public.individuals OWNER TO phenopolis_api;

--
-- Name: pagetable_colname; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.pagetable_colname (
    id integer NOT NULL,
    page_name public.page_name_types,
    page_table text,
    colname_key text,
    colname_type public.colname_types,
    colname_class public.colname_class_type,
    colname_base_href text
);


ALTER TABLE public.pagetable_colname OWNER TO phenopolis_api;

--
-- Name: pagetable_colname_id_seq; Type: SEQUENCE; Schema: public; Owner: phenopolis_api
--

CREATE SEQUENCE public.pagetable_colname_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagetable_colname_id_seq OWNER TO phenopolis_api;

--
-- Name: pagetable_colname_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phenopolis_api
--

ALTER SEQUENCE public.pagetable_colname_id_seq OWNED BY public.pagetable_colname.id;


--
-- Name: phenogenon; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.phenogenon (
    gene_id text,
    hpo_id text,
    hgf text,
    moi_score text
);


ALTER TABLE public.phenogenon OWNER TO phenopolis_api;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    session_id character varying(255),
    data text,
    expiry timestamp without time zone
);


ALTER TABLE public.sessions OWNER TO phenopolis_api;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: phenopolis_api
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO phenopolis_api;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phenopolis_api
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: skat; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.skat (
    chr text,
    start text,
    "end" text,
    hpo text,
    symbol text,
    ensembl text,
    fisherpvalue text,
    skato text,
    variants text,
    compoundhetpvalue text,
    hwep text,
    min_depth text,
    nb_alleles_cases text,
    case_maf text,
    nb_ctrl_homs text,
    nb_case_homs text,
    maxmissrate text,
    nb_alleles_ctrls text,
    nb_snps text,
    nb_cases text,
    mincadd text,
    meancallratectrls text,
    meancallratecases text,
    oddsratio text,
    minsnps text,
    nb_ctrl_hets text,
    total_maf text,
    maxctrlmaf text,
    ctrl_maf text,
    nb_ctrls text,
    nb_case_hets text,
    maxexac text
);


ALTER TABLE public.skat OWNER TO phenopolis_api;

--
-- Name: test_sessions; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.test_sessions (
    id integer NOT NULL,
    session_id character varying(255),
    data text,
    expiry timestamp without time zone
);


ALTER TABLE public.test_sessions OWNER TO phenopolis_api;

--
-- Name: test_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: phenopolis_api
--

CREATE SEQUENCE public.test_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_sessions_id_seq OWNER TO phenopolis_api;

--
-- Name: test_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phenopolis_api
--

ALTER SEQUENCE public.test_sessions_id_seq OWNED BY public.test_sessions.id;


--
-- Name: user_config; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.user_config (
    user_name text,
    language text,
    page text,
    config jsonb
);


ALTER TABLE public.user_config OWNER TO phenopolis_api;

--
-- Name: user_pagetable_colname; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.user_pagetable_colname (
    id integer NOT NULL,
    "user" text,
    pagetable_colname integer,
    display boolean
);


ALTER TABLE public.user_pagetable_colname OWNER TO phenopolis_api;

--
-- Name: user_pagetable_colname_id_seq; Type: SEQUENCE; Schema: public; Owner: phenopolis_api
--

CREATE SEQUENCE public.user_pagetable_colname_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_pagetable_colname_id_seq OWNER TO phenopolis_api;

--
-- Name: user_pagetable_colname_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phenopolis_api
--

ALTER SEQUENCE public.user_pagetable_colname_id_seq OWNED BY public.user_pagetable_colname.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.users (
    "user" text NOT NULL UNIQUE,
    argon_password text,
    enabled boolean default false,
    registered_on timestamp with time zone,
    confirmed boolean default false,
    confirmed_on timestamp with time zone,
    email text UNIQUE,     -- should be NOT NULL but in order to maintain legacy users we will add this constraint on the API only at user creation
    full_name text
);


ALTER TABLE public.users OWNER TO phenopolis_api;


--
-- Name: users_individuals; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.users_individuals (
    "user" text,
    internal_id text
);


ALTER TABLE public.users_individuals OWNER TO phenopolis_api;

--
-- Name: variants; Type: TABLE; Schema: public; Owner: phenopolis_api
--

CREATE TABLE public.variants (
    "CHROM" text,
    "POS" integer,
    "ID" text,
    "REF" text,
    "ALT" text,
    "AF" real,
    "AC" integer,
    "AN" integer,
    "HET_COUNT" integer,
    "HOM_COUNT" integer,
    "DP" integer,
    "FS" text,
    "MLEAC" text,
    "MLEAF" text,
    "MQ" text,
    "FILTER" text,
    "HET" text,
    "HOM" text,
    most_severe_consequence text,
    af_kaviar text,
    af_gnomad_genomes text,
    af_jirdc text,
    af_tommo text,
    af_krgdb text,
    af_converge text,
    af_hgvd text,
    gene_symbol text,
    hgvsc text,
    hgvsp text,
    dann text,
    cadd_phred text,
    gene_id character varying,
    variant_id integer NOT NULL
);


ALTER TABLE public.variants OWNER TO phenopolis_api;

--
-- Name: variants_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: phenopolis_api
--

CREATE SEQUENCE public.variants_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.variants_variant_id_seq OWNER TO phenopolis_api;

--
-- Name: variants_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phenopolis_api
--

ALTER SEQUENCE public.variants_variant_id_seq OWNED BY public.variants.variant_id;


--
-- Name: pagetable_colname id; Type: DEFAULT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.pagetable_colname ALTER COLUMN id SET DEFAULT nextval('public.pagetable_colname_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: test_sessions id; Type: DEFAULT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.test_sessions ALTER COLUMN id SET DEFAULT nextval('public.test_sessions_id_seq'::regclass);


--
-- Name: user_pagetable_colname id; Type: DEFAULT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.user_pagetable_colname ALTER COLUMN id SET DEFAULT nextval('public.user_pagetable_colname_id_seq'::regclass);


--
-- Name: variants variant_id; Type: DEFAULT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.variants ALTER COLUMN variant_id SET DEFAULT nextval('public.variants_variant_id_seq'::regclass);


--
-- Name: pagetable_colname pagetable_colname_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.pagetable_colname
    ADD CONSTRAINT pagetable_colname_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_session_id_key UNIQUE (session_id);


--
-- Name: test_sessions test_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.hpo
    ADD CONSTRAINT hpo_pkey PRIMARY KEY (hpo_id);


--
-- Name: test_sessions test_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_session_id_key UNIQUE (session_id);


--
-- Name: user_pagetable_colname user_pagetable_colname_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.user_pagetable_colname
    ADD CONSTRAINT user_pagetable_colname_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY ("user");


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (variant_id);


--
-- Name: genes_gene_id_idx; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX genes_gene_id_idx ON public.genes USING btree (gene_id);



--
-- Name: hpo_ancestor_names; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX hpo_ancestor_names ON public.hpo USING btree (hpo_ancestor_names);


--
-- Name: i_full_gene_name; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_full_gene_name ON public.genes USING btree (full_gene_name);


--
-- Name: i_gene_id; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_gene_id ON public.genes USING btree (gene_id);


--
-- Name: i_gene_name; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_gene_name ON public.genes USING btree (gene_name);


--
-- Name: i_gene_name_upper; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_gene_name_upper ON public.genes USING btree (gene_name_upper);

-- adds GIST index
CREATE INDEX ON public.genes USING GIST (gene_name public.gist_trgm_ops);
CREATE INDEX ON public.genes USING GIST (other_names public.gist_trgm_ops);


--
-- Name: i_internal_id2; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_internal_id2 ON public.users_individuals USING btree (internal_id);


--
-- Name: i_language; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_language ON public.user_config USING btree (language);


--
-- Name: i_other_names; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_other_names ON public.genes USING btree (other_names);


--
-- Name: i_user2; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_user2 ON public.users_individuals USING btree ("user");


--
-- Name: i_user_name; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX i_user_name ON public.user_config USING btree (user_name);


--
-- Name: idx_16548_i_hpo_id; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX idx_16548_i_hpo_id ON public.hpo USING btree (hpo_id);


--
-- Name: idx_16548_i_hpo_name; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX idx_16548_i_hpo_name ON public.hpo USING btree (hpo_name);

-- adds GIST index
CREATE INDEX ON public.hpo USING GIST (hpo_name public.gist_trgm_ops);


--
-- Name: p_af_converge_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_converge_variants ON public.variants USING btree (af_converge);


--
-- Name: p_af_gnomad_genomes_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_gnomad_genomes_variants ON public.variants USING btree (af_gnomad_genomes);


--
-- Name: p_af_hgvd_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_hgvd_variants ON public.variants USING btree (af_hgvd);


--
-- Name: p_af_jirdc_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_jirdc_variants ON public.variants USING btree (af_jirdc);


--
-- Name: p_af_kaviar_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_kaviar_variants ON public.variants USING btree (af_kaviar);


--
-- Name: p_af_krgdb_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_krgdb_variants ON public.variants USING btree (af_krgdb);


--
-- Name: p_af_tommo_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_af_tommo_variants ON public.variants USING btree (af_tommo);


--
-- Name: p_ancestor_observed_features; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_ancestor_observed_features ON public.individuals USING btree (ancestor_observed_features);


--
-- Name: p_external_id; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_external_id ON public.individuals USING btree (external_id);


--
-- Name: p_gene_symbol_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_gene_symbol_variants ON public.variants USING btree (gene_symbol);


--
-- Name: p_genes; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_genes ON public.individuals USING btree (genes);


--
-- Name: p_hpo_id; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_hpo_id ON public.hpo USING btree (hpo_id);


--
-- Name: p_hpo_name; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_hpo_name ON public.hpo USING btree (hpo_ancestor_ids);


--
-- Name: p_individual_het_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_individual_het_variants ON public.het_variants USING btree (individual);


--
-- Name: p_individual_hom_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_individual_hom_variants ON public.hom_variants USING btree (individual);


--
-- Name: p_observed_features; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_observed_features ON public.individuals USING btree (observed_features);


--
-- Name: p_observed_features_names; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_observed_features_names ON public.individuals USING btree (observed_features_names);


--
-- Name: p_sex; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_sex ON public.individuals USING btree (sex);


--
-- Name: p_simplified_observed_features; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_simplified_observed_features ON public.individuals USING btree (simplified_observed_features);


--
-- Name: p_simplified_observed_features_names; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_simplified_observed_features_names ON public.individuals USING btree (simplified_observed_features_names);


--
-- Name: p_unobserved_features; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_unobserved_features ON public.individuals USING btree (unobserved_features);


--
-- Name: p_vid_het_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_vid_het_variants ON public.het_variants USING btree ("CHROM", "POS", "REF", "ALT");


--
-- Name: p_vid_hom_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_vid_hom_variants ON public.hom_variants USING btree ("CHROM", "POS", "REF", "ALT");


--
-- Name: p_vid_variants; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX p_vid_variants ON public.variants USING btree ("CHROM", "POS", "REF", "ALT");


--
-- Name: page; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX page ON public.user_config USING btree (page);


--
-- Name: variants_gene_id_idx; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX variants_gene_id_idx ON public.variants USING btree (gene_id);


--
-- Name: variants_gene_id_idx1; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX variants_gene_id_idx1 ON public.variants USING btree (gene_id);


--
-- Name: variants_gene_symbol; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX variants_gene_symbol ON public.variants USING btree (gene_symbol);


--
-- Name: variant_pos_text_pattern_idx; Type: INDEX; Schema: public; Owner: phenopolis_api
--

CREATE INDEX variant_pos_text_pattern_idx ON public.variants (("POS"::text) text_pattern_ops);

--
-- Name: user_pagetable_colname user_pagetable_colname_pagetable_colname_fkey; Type: FK CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.user_pagetable_colname
    ADD CONSTRAINT user_pagetable_colname_pagetable_colname_fkey FOREIGN KEY (pagetable_colname) REFERENCES public.pagetable_colname(id);


--
-- Name: user_pagetable_colname user_pagetable_colname_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: phenopolis_api
--

ALTER TABLE ONLY public.user_pagetable_colname
    ADD CONSTRAINT user_pagetable_colname_user_fkey FOREIGN KEY ("user") REFERENCES public.users("user");


--
-- PostgreSQL database dump complete
--
