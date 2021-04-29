"""
variant view
"""
import requests
from db.model import Variant
from psycopg2 import sql
from views import application, variant_file, phenoid_mapping
from views.auth import requires_auth
from views.autocomplete import CHROMOSOME_POS_REF_ALT_REGEX, ENSEMBL_GENE_REGEX, PATIENT_REGEX
from views.postgres import get_db, session_scope
from views.general import cache_on_browser, process_for_display
from sqlalchemy import and_
from flask import jsonify, Response
from db.helpers import cursor2dict, query_user_config


@application.route("/<language>/variant/<variant_id>")
@application.route("/variant/<variant_id>")
@requires_auth
@cache_on_browser()
def variant(variant_id, language="en") -> Response:

    # parse variant id
    chrom, pos, ref, alt = _parse_variant_id(variant_id)
    variant_id = f"{chrom}-{pos}-{ref}-{alt}"
    if chrom is None:
        response = jsonify(
            message="Wrong variant id. The variant id must follow the format " "chromosome-position-reference-alternate"
        )
        response.status_code = 400
        return response
    # return _get_variant(chrom, pos, ref, alt, language)
    vlist = _get_variants(variant_id)
    if vlist:
        variant = vlist[0]
    else:
        response = jsonify(message="Missing variant")
        response.status_code = 404
        return response

    resp_variant = _config_variant(variant, language)
    return resp_variant


@application.route("/variant/preview/<variant_id>")
@requires_auth
@cache_on_browser()
def variant_preview(variant_id) -> Response:

    # parse variant id
    chrom, pos, ref, alt = _parse_variant_id(variant_id)
    if chrom is None:
        response = jsonify(
            message="Wrong variant id. The variant id must follow the format " "chromosome-position-reference-alternate"
        )
        response.status_code = 400
        return response

    return _get_preview(chrom, pos, ref, alt)


def _get_variants(target: str):
    """Returns a list of dict variants
    Args:
        target (str):
            * variant_id (e.g '14-76156575-A-G') - and it will return the variant(s) dict for it
                '12-7241974-C-T', e.g., returns 2 dicts because of 'phenopolis.individual_variant'
            * gene_id (e.g. 'ENSG00000144285') - and it will return all variants linked to that gene
            * phenopolis_id (e.g. 'PH00008256') - aand it will return all variants linked to that patient
        input 'target' must obey its respective string format.
    Returns:
        List[dict variant]: empty ([]), one or more variants depending on input target
    """
    if CHROMOSOME_POS_REF_ALT_REGEX.match(target):
        c, p, r, a = target.split("-")
        filter = sql.SQL(f"""where v.chrom = '{c}' and v.pos = {p} and v."ref" = '{r}' and v.alt = '{a}'""")
    elif ENSEMBL_GENE_REGEX.match(target):
        filter = sql.SQL(f"where vg.gene_id = '{target}'")
    elif PATIENT_REGEX.match(target):
        filter = sql.SQL(f"where i2.phenopolis_id = '{target}'")
    else:
        return []

    sqlq_main = sql.SQL(
        """
        select
            array_agg(distinct iv.zygosity order by iv.zygosity) as zigosity,
            array_agg(distinct concat(g.hgnc_symbol,'@',g.ensembl_gene_id)) as genes, -- to split
            v.chrom as "CHROM", v.pos as "POS", v."ref" as "REF", v.alt as "ALT", v.cadd_phred, v.dann,
            v.fathmm_score, v.revel, -- new added
            -- removed: v.id
            vg.most_severe_consequence, string_agg(distinct vg.hgvs_c,',' order by vg.hgvs_c) as hgvsc,
            string_agg(distinct vg.hgvs_p,',' order by vg.hgvs_p) as hgvsp, -- via variant_gene
            iv.dp as "DP", iv."fs" as "FS", iv.mq as "MQ", iv."filter" as "FILTER", -- via individual_variant
        (
            select array_agg(i.phenopolis_id order by i.id)
            from phenopolis.individual i
            join phenopolis.individual_variant iv2 on iv2.individual_id = i.id and iv2.zygosity = 'HOM'
            where v.id = iv2.variant_id
        ) as "HOM",
        (
            select array_agg(i.phenopolis_id order by i.id)
            from phenopolis.individual i
            join phenopolis.individual_variant iv2 on iv2.individual_id = i.id and iv2.zygosity = 'HET'
            where v.id = iv2.variant_id
        ) as "HET",
        (
            select distinct on (ah.chrom,ah.pos,ah."ref",ah.alt) ah.af from kaviar.annotation_hg19 ah
            where ah.chrom = v.chrom and ah.pos = v.pos and ah."ref" = v."ref" and ah.alt = v.alt
            order by ah.chrom,ah.pos,ah."ref",ah.alt,ah.ac desc
        ) as af_kaviar,
        av.af as af_gnomad_genomes -- gnomad # NOTE: missing strand?
        -- deprecated: MLEAF, MLEAC
        -- need to be added (by Daniele): af_converge, af_hgvd, af_jirdc, af_krgdb, af_tommo,
        from phenopolis.variant v
        join phenopolis.individual_variant iv on iv.variant_id = v.id
        join phenopolis.individual i2 on i2.id = iv.individual_id
        left outer join phenopolis.variant_gene vg on vg.variant_id = v.id -- variant_gene not complete?
        left outer join ensembl.gene g on vg.gene_id = g.ensembl_gene_id
            and g.assembly = 'GRCh37' and g.chromosome ~ '^X|^Y|^[0-9]{1,2}'
        left outer join gnomad.annotation_v3 av
            on av.chrom = v.chrom and av.pos = v.pos and av."ref" = v."ref" and av.alt = v.alt
        --where v.chrom = '12' and v.pos = 7241974 and v."ref" = 'C' and v.alt = 'T' -- 2 rows
        --where v.chrom = '7' and v.pos = 2303057 and v."ref" = 'G' and v.alt = 'A' -- 1 row
        --where i2.phenopolis_id = 'PH00008256'
        --where vg.gene_id = 'ENSG00000144285'
        """
    )

    sqlq_end = sql.SQL(
        """
        group by "CHROM","POS","REF","ALT",cadd_phred,dann,fathmm_score,revel,most_severe_consequence,
            "DP","FS","MQ","FILTER", -- need for array_agg but disambiguates depending on individual_variant
            "HOM","HET",af_kaviar,af_gnomad_genomes
        order by
            substring(v.chrom FROM '([0-9]+)')::int,
            v.pos, v."ref", v.alt, iv.dp desc
        """
    )

    sqlq = sqlq_main + filter + sqlq_end
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sqlq)
            variants = cursor2dict(cur)
    for v in variants:
        # v["variant_id"] = [{"display": f'{v["CHROM"]}-{v["POS"]}-{v["REF"]}-{v["ALT"]}'}]
        gs, gi = zip(*[x.split("@") for x in sorted(v["genes"])])
        v["gene_symbol"] = ",".join(gs)
        v["gene_id"] = ",".join(gi)
        if not v["HET"]:
            v["HET"] = []
        if not v["HOM"]:
            v["HOM"] = []
        v["HET_COUNT"] = len(v["HET"])
        v["HOM_COUNT"] = len(v["HOM"])
        v["AC"] = v["HET_COUNT"] + 2 * v["HOM_COUNT"]
        v["AN"] = (v["HET_COUNT"] + v["HOM_COUNT"]) * 2
        v["AF"] = v["AC"] / v["AN"]
        v["af_hgvd"] = ""  # to be added
        v["af_converge"] = ""  # to be added
        v["af_jirdc"] = ""  # to be added
        v["af_krgdb"] = ""  # to be added
        v["af_tommo"] = ""  # to be added
        # -------
        v["ID"] = ""  # to be removed
        v["MLEAC"] = ""  # to be removed
        v["MLEAF"] = ""  # to be removed
    return variants


def _config_variant(variant, language):
    with session_scope() as db_session:
        # get the genotype information for this variant from the VCF
        genotypes = _get_genotypes(variant["CHROM"], variant["POS"])
        process_for_display(db_session, [variant])
        config = query_user_config(db_session=db_session, language=language, entity="variant")
        config[0]["metadata"]["data"] = [variant]
        config[0]["individuals"]["data"] = [variant]
        config[0]["frequency"]["data"] = [variant]
        config[0]["consequence"]["data"] = [variant]
        config[0]["genotypes"]["data"] = genotypes
    return jsonify(config)


def _get_variant(chrom, pos, ref, alt, language):

    with session_scope() as db_session:

        variant = (
            db_session.query(Variant)
            .filter(and_(Variant.CHROM == chrom, Variant.POS == pos, Variant.REF == ref, Variant.ALT == alt))
            .first()
        )

        if variant is None:
            response = jsonify(message="Missing variant")
            response.status_code = 404
            return response

        # get the genotype information for this variant from the VCF
        genotypes = _get_genotypes(chrom, pos)

        variant_dict = variant.as_dict()
        process_for_display(db_session, [variant_dict])
        config = query_user_config(db_session=db_session, language=language, entity="variant")
        config[0]["metadata"]["data"] = [variant_dict]
        config[0]["individuals"]["data"] = [variant_dict]
        config[0]["frequency"]["data"] = [variant_dict]
        config[0]["consequence"]["data"] = [variant_dict]
        config[0]["genotypes"]["data"] = genotypes
        return jsonify(config)


def _get_preview(chrom, pos, ref, alt):
    # queries for Clinvar clinical significance
    clinical_significance = _fetch_clinvar_clinical_significance(chrom, pos, ref, alt)
    preview = {"Clinvar": clinical_significance}
    # TODO: add more things here eg: GnomAD frequency, SO effect
    return jsonify(preview)


def _get_genotypes(chrom, pos):
    genotypes = []
    # reads the variant file from S3
    try:
        v = next(variant_file(f"{chrom}:{pos}-{pos}"))
        lookup = {s: i for i, s in enumerate(variant_file.samples)}
        gts = [tuple([item if item >= 0 else None for item in alist[:2]]) for alist in v.genotypes]
        rds = [x.item() if x >= 0 else None for x in v.gt_ref_depths]
        ads = [x.item() if x >= 0 else None for x in v.gt_alt_depths]
        dps = [x.item() if x >= 0 else None for x in v.gt_depths]
        genotypes = [
            {
                # NOTE: samples didn't use to care about which samples were authorized to view, now variants
                # belonging to non authorized are shown but the sample id is not
                "sample": [{"display": phenoid_mapping.get(s)}],
                "GT": gts[lookup[s]][:2],
                "AD": (rds[lookup[s]], ads[lookup[s]]),
                "DP": dps[lookup[s]],
            }
            for s in variant_file.samples
            if phenoid_mapping.get(s) is not None
        ]
    except Exception as e:
        print(e)
    return genotypes


def _fetch_clinvar_clinical_significance(chrom, pos, ref, alt):
    # TODO: replace this by a query to our database once we have this dataset loaded
    clinical_significance = None
    url = "https://myvariant.info/v1/variant/chr%s:g.%d%s>%s?fields=clinvar.rcv.clinical_significance&dotfield=true" % (
        chrom,
        pos,
        ref,
        alt,
    )
    x = requests.get(url).json()
    if x:
        clinical_significance = str(x.get("clinvar.rcv.clinical_significance", ""))
    return clinical_significance


def _parse_variant_id(variant_id):
    chrom, pos, ref, alt = None, None, None, None
    match = CHROMOSOME_POS_REF_ALT_REGEX.match(variant_id)
    if match:
        chrom = match.group(1)
        pos = int(match.group(2))
        ref = match.group(3)
        alt = match.group(4)
    return chrom, pos, ref, alt
