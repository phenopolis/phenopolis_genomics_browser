import connexion
import six

from swagger_server.models.variant import Variant  # noqa: E501
from swagger_server import util


def get_variant_by_id(variantId):  # noqa: E501
    """Find variant by ID

    Returns a single variant # noqa: E501

    :param variantId: ID of variant to return
    :type variantId: int

    :rtype: Variant
    """
    return 'do some magic!'
