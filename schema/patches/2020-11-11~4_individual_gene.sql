begin;

set local search_path to phenopolis, public;

create table individual_gene (
    individual_id int not null,
    gene_id bigint not null references ensembl.gene (identifier),
    primary key (gene_id, individual_id),

    status text,
    clinvar_id text,
    pubmed_id text,
    comment text,
    user_id text,
    timestamp timestamptz not null
);

create index on individual_gene (individual_id);
create index on individual_gene (clinvar_id);
create index on individual_gene (pubmed_id);

create trigger timestamp_update
before insert or update on individual_gene
for each row execute procedure timestamp_update();

commit;
