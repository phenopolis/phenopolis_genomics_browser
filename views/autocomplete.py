"""
Autocomplete view
"""
from db.helpers import cursor2dict
import re
from typing import List

from flask import jsonify, session, request
from sqlalchemy import and_, Text, cast
from sqlalchemy.orm import Session

from db.model import Individual, NewGene, NewVariant, TranscriptConsequence, UserIndividual
from views import application, HG_ASSEMBLY
from views.auth import requires_auth, USER
from views.postgres import get_db, session_scope
from psycopg2 import sql

CHROMOSOME_POS_REGEX = re.compile(r"^(\w+)[-:](\d+)$")
CHROMOSOME_POS_REF_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)$", re.IGNORECASE)
CHROMOSOME_POS_REF_ALT_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)[-:>]([ACGT\*]+)$", re.IGNORECASE)
GENOMIC_REGION_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:](\d+)$", re.IGNORECASE)
ENSEMBL_TRANSCRIPT_REGEX = re.compile(r"^ENST(\d{0,12})(\.\d{1,2})?", re.IGNORECASE)
ENSEMBL_PROTEIN_REGEX = re.compile(r"^ENSP(\d{0,12})(\.\d{1,2})?", re.IGNORECASE)
ENSEMBL_GENE_REGEX = re.compile(r"^^ENSG(\d{0,12})(\.\d{1,2})?", re.IGNORECASE)
HPO_REGEX = re.compile(r"^HP:(\d{0,7})", re.IGNORECASE)
PATIENT_REGEX = re.compile(r"^PH(\d{0,8})", re.IGNORECASE)
NUMERIC_REGEX = re.compile(r"^\d+$", re.IGNORECASE)
HGVS_C_REGEX = re.compile(r"(.+):(c.*)")
HGVS_P_REGEX = re.compile(r"(.+):(p.*)")
HGVSP = "hgvsp"
HGVSC = "hgvsc"

DEFAULT_SEARCH_RESULTS_LIMIT = 20
MAXIMUM_SEARCH_RESULTS_LIMIT = 1000


@application.route("/autocomplete/<query>")
@requires_auth
def autocomplete(query):
    arguments = request.args.to_dict()
    query_type = arguments.get("query_type")
    try:
        limit = int(arguments.get("limit", DEFAULT_SEARCH_RESULTS_LIMIT))
    except ValueError:
        return (
            jsonify(success=False, message=f"Please, specify a numeric limit value, {arguments.get('limit')}"),
            400,
        )

    if limit > MAXIMUM_SEARCH_RESULTS_LIMIT:
        return (
            jsonify(success=False, message=f"Please, specify a limit lower than {MAXIMUM_SEARCH_RESULTS_LIMIT}"),
            400,
        )
    application.logger.debug("Autocomplete query '%s' and query type '%s'", query, query_type)

    with session_scope() as db_session:
        if query_type == "gene":
            suggestions = _search_genes(db_session, query, limit)

        elif query_type == "phenotype":
            suggestions = _search_phenotypes(db_session, query, limit)

        elif query_type == "patient":
            suggestions = _search_patients(db_session, query, limit)

        elif query_type == "variant":
            suggestions = _search_variants(db_session, query, limit)

        elif query_type is None or query_type == "":
            suggestions = (
                _search_genes(db_session, query, limit)
                + _search_phenotypes(db_session, query, limit)
                + _search_patients(db_session, query, limit)
                + _search_variants(db_session, query, limit)
            )
        else:
            message = f"Autocomplete request with unsupported query type '{query_type}'"
            application.logger.error(message)
            # raise PhenopolisException(message)
            return (
                jsonify(success=False, message=message),
                400,
            )

    return jsonify(suggestions), 200


def _search_patients(db_session: Session, query, limit):
    r"""'
    Patient (phenopolis_id) format: PH (PH\d{8}) e.g. 'PH00005862' and are restricted to a particular user
    'demo', for example, can only access ['PH00008256', 'PH00008258', 'PH00008267', 'PH00008268']
    so, a search for 'PH000082', for user 'demo', should return only the 4 cases above
    """
    individuals = (
        db_session.query(Individual, UserIndividual)
        .filter(
            and_(
                UserIndividual.internal_id == Individual.phenopolis_id,
                UserIndividual.user == session[USER],
                Individual.phenopolis_id.ilike(f"%{query}%"),
            )
        )
        .with_entities(Individual)
        .order_by(Individual.phenopolis_id.asc())
        .limit(limit)
        .all()
    )
    return [f"individual::{x.phenopolis_id}::{x.phenopolis_id}" for x in individuals]


def _search_phenotypes(db_session: Session, query, limit):
    r"""
    A user may search for things like 'Abnormality of body height' or for an HPO id as HP:1234567 (ie: HP:\d{7})
    or just a seq of numbers like '1234'
    """
    if HPO_REGEX.match(query) or NUMERIC_REGEX.match(query):
        sqlq = sql.SQL(
            """
            select t.hpo_id, t."name" from hpo.term t where t.hpo_id ~ %(query)s order by t.id limit %(limit)s
            """
        )
    else:
        # TODO: search also over synonyms
        # TODO: return the distance so the frontend have greater flexibility
        # NOTE: order results by similarity and then by hpo_name (case insensitive)
        sqlq = sql.SQL(
            """
            select
                t.hpo_id,
                t."name" ,
                t."name" <-> %(query)s as distance
            from
                hpo.term t
            where
                t."name" %% %(query)s
            order by
                distance,
                lower(t."name")
            limit %(limit)s
        """
        )
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq, {"query": query, "limit": limit})
            phenotypes = cursor2dict(cur)
    return [f"hpo::{x.get('name')}::{x.get('hpo_id')}" for x in phenotypes]


def _search_genes(db_session: Session, query, limit):
    """
    Either search for:
    - a gene id like 'ENSG000...'
    - a transcript id like 'ENST000...' not only canonical
    - a protein id like 'ENSP000...' not only canonical
    - a numeric id without any qualifier like '12345'
    - a gene name like 'TTLL...'
    - a gene synonym like 'asd...'

    The order of results is sorted by gene identifier for the 3 searches by identifier; and it is sorted by similarity
    for gene name and gene synonym searches
    """
    is_identifier_query = (
        ENSEMBL_GENE_REGEX.match(query)
        or ENSEMBL_TRANSCRIPT_REGEX.match(query)
        or NUMERIC_REGEX.match(query)
        or ENSEMBL_PROTEIN_REGEX.match(query)
    )
    if is_identifier_query:
        query = remove_version_from_id(query)
        sqlq = sql.SQL(
            """
            select distinct g.hgnc_symbol, g.ensembl_gene_id
            from ensembl.gene g
            left outer join ensembl.transcript t on g.ensembl_gene_id = t.ensembl_gene_id
            where g.assembly = %(hga)s
            and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
            and (
                g.ensembl_gene_id ~* %(query)s or
                t.ensembl_transcript_id ~* %(query)s or
                t.ensembl_peptide_id ~* %(query)s
                )
            order by g.ensembl_gene_id
            limit %(limit)s
            """
        )
    else:
        sqlq = sql.SQL(
            """
            select
                g.hgnc_symbol,
                g.ensembl_gene_id ,
                g.hgnc_symbol <-> %(query)s as distance
            from
                ensembl.gene g
            where g.assembly = %(hga)s
            and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
            and g.hgnc_symbol %% %(query)s
            order by
                distance,
                lower(g.hgnc_symbol)
            limit %(limit)s
            """
        )
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq, {"query": query, "limit": limit, "hga": HG_ASSEMBLY})
            genes = cursor2dict(cur)
            if not genes:
                sqlq = sql.SQL(
                    """
                    select
                        g.hgnc_symbol,
                        g.ensembl_gene_id ,
                        gs.external_synonym <-> %(query)s as distance
                    from
                        ensembl.gene g
                    join ensembl.gene_synonym gs on gs.gene = g.identifier
                    where g.assembly = %(hga)s
                    and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
                    and gs.external_synonym %% %(query)s
                    order by
                        distance,
                        lower(gs.external_synonym)
                    limit %(limit)s
                    """
                )
                cur.execute(sqlq, {"query": query, "limit": limit, "hga": HG_ASSEMBLY})
                genes = cursor2dict(cur)

    return [f"gene::{x.get('hgnc_symbol')}::{x.get('ensembl_gene_id')}" for x in genes]


def _search_variants(db_session: Session, query, limit):
    chromosome_from_region, start, end = _parse_genomic_region_from_query(query)
    chromosome_from_variant, pos, ref, alt = _parse_variant_from_query(query.upper())
    hgvs_type, entity, hgvs = _parse_hgvs_from_query(query)
    variants = []
    if chromosome_from_region is not None:
        variants = _search_variants_by_region(db_session, chromosome_from_region, start, end, limit)
    elif chromosome_from_variant is not None:
        variants = _search_variants_by_coordinates(db_session, chromosome_from_variant, pos, ref, alt, limit)
    elif hgvs_type is not None:
        variants = _search_variants_by_hgvs(db_session, hgvs_type, entity, hgvs, limit)

    return [f"variant::{v.chrom}-{v.pos}-{v.ref}-{v.alt}::{v.chrom}-{v.pos}-{v.ref}-{v.alt}" for v in variants]


def _search_variants_by_coordinates(db_session: Session, chrom, pos, ref, alt, limit) -> List[NewVariant]:
    """
    Assuming a user is searching for 22-38212762-A-G or 22-16269829-T-*
    22-382
    22-382-A
    22-16269-T-*
    22:162
    22-38212:a>g
    """
    if chrom is not None and ref is not None and alt is not None:
        variants = (
            db_session.query(NewVariant)
            .filter(
                and_(
                    NewVariant.chrom == chrom,
                    cast(NewVariant.pos, Text).like(f"{pos}%"),
                    NewVariant.ref == ref,
                    NewVariant.alt == alt,
                )
            )
            .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
            .limit(limit)
            .all()
        )
    elif chrom is not None and ref is not None and alt is None:
        variants = (
            db_session.query(NewVariant)
            .filter(and_(NewVariant.chrom == chrom, cast(NewVariant.pos, Text).like(f"{pos}%"), NewVariant.ref == ref))
            .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
            .limit(limit)
            .all()
        )
    elif chrom is not None and ref is None:
        variants = (
            db_session.query(NewVariant)
            .filter(and_(NewVariant.chrom == chrom, cast(NewVariant.pos, Text).like(f"{pos}%")))
            .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
            .limit(limit)
            .all()
        )
    return variants


def _search_variants_by_region(db_session: Session, chrom, start, end, limit) -> List[NewVariant]:
    """
    Assuming a user is searching for 22:10000-20000 it will return all variants within that region
    """
    variants = (
        db_session.query(NewVariant)
        .filter(and_(NewVariant.chrom == chrom, NewVariant.pos >= start, NewVariant.pos <= end,))
        .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
        .limit(limit)
        .all()
    )
    return variants


def _search_variants_by_hgvs(db_session: Session, hgvs_type, entity, hgvs, limit) -> List[NewVariant]:
    """
    Assuming a user is searching for ENSP00000451572.1:p.His383Tyr, ENST00000355467.4:c.30C>T,
    ENSG00000119685.1:c.412A>G, ENSG00000119685.1:p.Ile138Val or ENST00000505973.1:n.97C>T
    The queries need to do something like HGVSC like %query%, because the HGVS codes are a comma separated list in the
    corresponding text column. The query must start with either ENST or ENSP to be performed
    """
    if hgvs_type == HGVSC:
        if ENSEMBL_TRANSCRIPT_REGEX.match(entity):
            # search for HGVS including the transcript id over all variants table
            # TODO: when we have a transcript in the variants table, improve this query to avoid whole table scan
            # NOTE: the % after transcript deals with missing transcript version, as a positive side effect this allow
            # for partial ids
            variants = (
                db_session.query(NewVariant, TranscriptConsequence)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.hgvs_c.ilike(f"%{entity}%:{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
        elif ENSEMBL_GENE_REGEX.match(entity):
            # search for HGVS on the variants for the given gene id
            ensembl_gene_id_without_version = remove_version_from_id(entity)
            variants = (
                db_session.query(NewVariant, TranscriptConsequence)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.gene_id == ensembl_gene_id_without_version,
                        TranscriptConsequence.hgvs_c.ilike(f"%{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
        else:
            # search for HGVS on the variants for the given gene symbol
            variants = (
                db_session.query(NewVariant, TranscriptConsequence, NewGene)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.gene_id == NewGene.ensembl_gene_id,
                        NewGene.assembly == HG_ASSEMBLY,
                        NewGene.hgnc_symbol == entity,
                        TranscriptConsequence.hgvs_c.ilike(f"%{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
    elif hgvs_type == HGVSP:
        if ENSEMBL_PROTEIN_REGEX.match(entity):
            # search for HGVS including the transcript id over all variants table
            # TODO: when we have a transcript in the variants table, improve this query to avoid whole table scan
            # NOTE: the % after transcript deals with missing transcript version, as a positive side effect this allow
            # for partial ids
            variants = (
                db_session.query(NewVariant, TranscriptConsequence)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.hgvs_p.ilike(f"%{entity}%:{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
        elif ENSEMBL_GENE_REGEX.match(entity):
            # search for HGVS on the variants for the given gene id
            ensembl_protein_id_without_version = remove_version_from_id(entity)
            variants = (
                db_session.query(NewVariant, TranscriptConsequence)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.gene_id == ensembl_protein_id_without_version,
                        TranscriptConsequence.hgvs_p.ilike(f"%{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
        else:
            # search for HGVS on the variants for the given gene symbol
            variants = (
                db_session.query(NewVariant, TranscriptConsequence, NewGene)
                .filter(
                    and_(
                        NewVariant.chrom == TranscriptConsequence.chrom,
                        NewVariant.pos == TranscriptConsequence.pos,
                        NewVariant.ref == TranscriptConsequence.ref,
                        NewVariant.alt == TranscriptConsequence.alt,
                        TranscriptConsequence.gene_id == NewGene.ensembl_gene_id,
                        NewGene.assembly == HG_ASSEMBLY,
                        NewGene.hgnc_symbol == entity,
                        TranscriptConsequence.hgvs_p.ilike(f"%{hgvs}%"),
                    )
                )
                .with_entities(NewVariant)
                .order_by(NewVariant.chrom.asc(), NewVariant.pos.asc())
                .limit(limit)
                .all()
            )
    return variants


def remove_version_from_id(entity):
    ensembl_gene_id_without_version = re.sub(r"\..*", "", entity)
    return ensembl_gene_id_without_version


def _parse_hgvs_from_query(query):
    match = HGVS_C_REGEX.match(query)
    hgvs_type, entity, hgvs = None, None, None
    if match:
        hgvs_type = HGVSC
        entity = match.group(1)
        hgvs = match.group(2)
    match = HGVS_P_REGEX.match(query)
    if match:
        hgvs_type = HGVSP
        entity = match.group(1)
        hgvs = match.group(2)
    return hgvs_type, entity, hgvs


def _parse_variant_from_query(query):
    """
    Extract chromosome, position, reference and alternate from something looking like a variant
    It can extract only chromosome and position, chromosome, position and reference or chromosome, position, reference
    and alternate.
    It expects fields in the variant to be separated by -, : or >. This last one only for separation between reference
    and alternate.
    """
    # TODO: remove the * from the accepted queries if we normalize indels to VCF-like format
    match = CHROMOSOME_POS_REF_ALT_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), match.group(4)
    match = CHROMOSOME_POS_REF_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), match.group(3), None
    match = CHROMOSOME_POS_REGEX.match(query)
    if match:
        return match.group(1), match.group(2), None, None
    return None, None, None, None


def _parse_genomic_region_from_query(query):
    """
    Extract chromosome, start position and end position
    It expects fields to be separated by - or :
    """
    match = GENOMIC_REGION_REGEX.match(query)
    chromosome = None
    start = None
    end = None
    if match:
        chromosome = match.group(1)
        start = int(match.group(2))
        end = int(match.group(3))
    return chromosome, start, end
