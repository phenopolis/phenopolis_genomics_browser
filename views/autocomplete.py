"""
Autocomplete view
"""
import re
from typing import List

from flask import jsonify, session, request
from sqlalchemy import and_, asc, func, or_, Text, cast
from db.model import Individual, UserIndividual, HPO, Gene, Variant
from views import application
from views.auth import requires_auth, USER
from views.postgres import get_db_session

CHROMOSOME_POS_REGEX = re.compile(r"^(\w+)[-:](\d+)$")
CHROMOSOME_POS_REF_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)$", re.IGNORECASE)
CHROMOSOME_POS_REF_ALT_REGEX = re.compile(r"^(\w+)[-:](\d+)[-:]([ACGT\*]+)[-:>]([ACGT\*]+)$", re.IGNORECASE)
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
            jsonify(success=False, message="Please, specify a numeric limit value, {}".format(arguments.get("limit"))),
            400,
        )

    if limit > MAXIMUM_SEARCH_RESULTS_LIMIT:
        return (
            jsonify(
                success=False, message="Please, specify a limit lower than {}".format(MAXIMUM_SEARCH_RESULTS_LIMIT)
            ),
            400,
        )
    application.logger.debug("Autocomplete query '%s' and query type '%s'", query, query_type)

    if query_type == "gene":
        suggestions = _search_genes(query, limit)

    elif query_type == "phenotype":
        suggestions = _search_phenotypes(query, limit)

    elif query_type == "patient":
        suggestions = _search_patients(query, limit)

    elif query_type == "variant":
        suggestions = _search_variants(query, limit)

    elif query_type is None or query_type == "":
        suggestions = (
            _search_genes(query, limit)
            + _search_phenotypes(query, limit)
            + _search_patients(query, limit)
            + _search_variants(query, limit)
        )
    else:
        message = "Autocomplete request with unsupported query type '{}'".format(query_type)
        application.logger.error(message)
        # raise PhenopolisException(message)
        return (
            jsonify(success=False, message=message),
            400,
        )

    return jsonify(suggestions), 200


def _search_patients(query, limit):
    r"""'
    Patient (internal_id) format: PH (PH\d{8}) e.g. 'PH00005862' and are restricted to a particular user
    'demo', for example, can only access ['PH00008256', 'PH00008258', 'PH00008267', 'PH00008268']
    so, a search for 'PH000082', for user 'demo', should return only the 4 cases above
    """
    individuals = (
        get_db_session()
        .query(Individual, UserIndividual)
        .filter(
            and_(
                UserIndividual.internal_id == Individual.internal_id,
                UserIndividual.user == session[USER],
                Individual.internal_id.ilike("%{}%".format(query)),
            )
        )
        .with_entities(Individual)
        .order_by(Individual.internal_id.asc())
        .limit(limit)
        .all()
    )

    return ["individual::" + x.internal_id + "::" + x.internal_id for x in individuals]


def _search_phenotypes(query, limit):
    r"""
    A user may search for things like 'Abnormality of body height' or for an HPO id as HP:1234567 (ie: HP:\d{7})
    """
    if HPO_REGEX.match(query) or NUMERIC_REGEX.match(query):
        phenotypes = (
            get_db_session()
            .query(HPO)
            .filter(HPO.hpo_id.ilike("%{}%".format(query)))
            .order_by(HPO.hpo_id.asc())
            .limit(limit)
            .all()
        )
    else:
        # TODO: search also over synonyms
        # TODO: return the distance so the frontend have greater flexibility
        # NOTE: order results by similarity and then by hpo_name (case insensitive)
        phenotypes_and_distances = (
            get_db_session()
            .query(HPO, HPO.hpo_name.op("<->")(query).label("distance"))
            .filter(HPO.hpo_name.op("%%")(query))
            .order_by("distance", asc(func.lower(HPO.hpo_name)))
            .limit(limit)
            .all()
        )
        phenotypes = [p for p, _ in phenotypes_and_distances]

    return ["hpo::" + x.hpo_name + "::" + x.hpo_id for x in phenotypes]


def _search_genes(query, limit):
    """
    Either search for:
    - a gene id like 'ENSG000...'
    - a transcript id like 'ENST000...'
    - a numeric id without any qualifier like '12345'
    - a gene name like 'TTLL...'
    - a gene synonym like 'asd...'

    The order of results is sorted by gene identifier for the 3 searches by identifier; and it is sorted by similarity
    for gene name and gene synonym searches
    """
    # TODO: add search by all Ensembl transcipts (ie: not only canonical) if we add those to the genes table
    # TODO: add search by Ensembl protein if we add a column to the genes table
    is_identifier_query = (
        ENSEMBL_GENE_REGEX.match(query) or ENSEMBL_TRANSCRIPT_REGEX.match(query) or NUMERIC_REGEX.match(query)
    )
    if is_identifier_query:
        genes = (
            get_db_session()
            .query(Gene)
            .filter(
                or_(Gene.gene_id.ilike("%{}%".format(query)), Gene.canonical_transcript.ilike("%{}%".format(query)))
            )
            .order_by(Gene.gene_id.asc())
            .limit(limit)
            .all()
        )
    else:
        # NOTE: makes two queries by gene name and by other names and returns only the closest results
        genes_by_gene_name = (
            get_db_session()
            .query(Gene, Gene.gene_name.op("<->")(query).label("distance"))
            .filter(Gene.gene_name.op("%%")(query))
            .order_by("distance", asc(func.lower(Gene.gene_name)))
            .limit(limit)
            .all()
        )
        genes_by_other_names = (
            get_db_session()
            .query(Gene, Gene.other_names.op("<->")(query).label("distance"))
            .filter(Gene.other_names.op("%%")(query))
            .order_by("distance", asc(func.lower(Gene.gene_name)))
            .limit(limit)
            .all()
        )
        genes = [g for g, _ in sorted(genes_by_gene_name + genes_by_other_names, key=lambda x: x[1])[0:limit]]
    # while the search is performed on the upper cased gene name, it returns the original gene name
    return ["gene::" + x.gene_name + "::" + x.gene_id for x in genes]


def _search_variants(query, limit):
    chrom, pos, ref, alt = _parse_variant_from_query(query.upper())
    hgvs_type, entity, hgvs = _parse_hgvs_from_query(query)
    variants = []
    if chrom is not None:
        variants = _search_variants_by_coordinates(chrom, pos, ref, alt, limit)
    elif hgvs_type is not None:
        variants = _search_variants_by_hgvs(hgvs_type, entity, hgvs, limit)

    return [
        "variant::"
        + "{CHROM}-{POS}-{REF}-{ALT}::{CHROM}-{POS}-{REF}-{ALT}".format(CHROM=v.CHROM, POS=v.POS, REF=v.REF, ALT=v.ALT)
        for v in variants
    ]


def _search_variants_by_coordinates(chrom, pos, ref, alt, limit) -> List[Variant]:
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
            get_db_session()
            .query(Variant)
            .filter(
                and_(
                    Variant.CHROM == chrom,
                    cast(Variant.POS, Text).like("{}%".format(pos)),
                    Variant.REF == ref,
                    Variant.ALT == alt,
                )
            )
            .order_by(Variant.CHROM.asc(), Variant.POS.asc())
            .limit(limit)
            .all()
        )
    elif chrom is not None and ref is not None and alt is None:
        variants = (
            get_db_session()
            .query(Variant)
            .filter(and_(Variant.CHROM == chrom, cast(Variant.POS, Text).like("{}%".format(pos)), Variant.REF == ref))
            .order_by(Variant.CHROM.asc(), Variant.POS.asc())
            .limit(limit)
            .all()
        )
    elif chrom is not None and ref is None:
        variants = (
            get_db_session()
            .query(Variant)
            .filter(and_(Variant.CHROM == chrom, cast(Variant.POS, Text).like("{}%".format(pos))))
            .order_by(Variant.CHROM.asc(), Variant.POS.asc())
            .limit(limit)
            .all()
        )
    else:
        # no variant pattern, we perform no search
        variants = []

    return variants


def _search_variants_by_hgvs(hgvs_type, entity, hgvs, limit) -> List[Variant]:
    """
    Assuming a user is searching for ENSP00000451572.1:p.His383Tyr, ENST00000355467.4:c.30C>T or
    ENST00000505973.1:n.97C>T
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
                get_db_session()
                .query(Variant)
                .filter(Variant.hgvsc.ilike("%{}%:{}%".format(entity, hgvs)))
                .order_by(Variant.CHROM.asc(), Variant.POS.asc())
                .limit(limit)
                .all()
            )
        elif ENSEMBL_GENE_REGEX.match(entity):
            # search for HGVS on the variants for the given gene id
            ensembl_gene_id_without_version = re.sub(r"\..*", "", entity)
            variants = (
                get_db_session()
                    .query(Variant)
                    .filter(and_(Variant.gene_id == ensembl_gene_id_without_version,
                                 Variant.hgvsc.ilike("%{}%".format(hgvs))))
                    .order_by(Variant.CHROM.asc(), Variant.POS.asc())
                    .limit(limit)
                    .all()
            )
        else:
            # search for HGVS on the variants for the given gene symbol
            variants = (
                get_db_session()
                    .query(Variant)
                    .filter(and_(Variant.gene_symbol == entity, Variant.hgvsc.ilike("%{}%".format(hgvs))))
                    .order_by(Variant.CHROM.asc(), Variant.POS.asc())
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
                get_db_session()
                .query(Variant)
                .filter(Variant.hgvsp.ilike("%{}%:{}%".format(entity, hgvs)))
                .order_by(Variant.CHROM.asc(), Variant.POS.asc())
                .limit(limit)
                .all()
            )
        elif ENSEMBL_GENE_REGEX.match(entity):
            # search for HGVS on the variants for the given gene id
            ensembl_protein_id_without_version = re.sub(r"\..*", "", entity)
            variants = (
                get_db_session()
                .query(Variant)
                .filter(and_(Variant.gene_id == ensembl_protein_id_without_version,
                             Variant.hgvsp.ilike("%{}%".format(hgvs))))
                .order_by(Variant.CHROM.asc(), Variant.POS.asc())
                .limit(limit)
                .all()
            )
        else:
            # search for HGVS on the variants for the given gene symbol
            variants = (
                get_db_session()
                .query(Variant)
                .filter(and_(Variant.gene_symbol == entity, Variant.hgvsp.ilike("%{}%".format(hgvs))))
                .order_by(Variant.CHROM.asc(), Variant.POS.asc())
                .limit(limit)
                .all()
            )
    else:
        # no variant pattern, we perform no search
        variants = []

    return variants


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
