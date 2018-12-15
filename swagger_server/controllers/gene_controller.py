import connexion
import six

from swagger_server.models.gene import Gene  # noqa: E501
from swagger_server import util


def get_gene_by_id(id):  # noqa: E501
    """

     # noqa: E501

    :param id: Gene ENSEMBL id
    :type id: List[str]

    :rtype: List[Gene]
    """
    return 'do some magic!'
