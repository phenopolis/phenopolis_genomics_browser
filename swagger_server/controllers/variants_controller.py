import connexion
import six

from swagger_server.models.inline_response200 import InlineResponse200  # noqa: E501
from swagger_server.models.variant_filters import VariantFilters  # noqa: E501
from swagger_server import util


def find_variants_by_patient_or_gene_or_range(variantFilters=None):  # noqa: E501
    """Finds Variants by patient or gene or chrom:range

     # noqa: E501

    :param variantFilters: 
    :type variantFilters: dict | bytes

    :rtype: InlineResponse200
    """
    if connexion.request.is_json:
        variantFilters = VariantFilters.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
