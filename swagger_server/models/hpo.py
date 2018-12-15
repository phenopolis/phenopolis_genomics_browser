# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server.models.gene_basic import GeneBasic  # noqa: F401,E501
from swagger_server.models.patient_basic import PatientBasic  # noqa: F401,E501
from swagger_server import util


class HPO(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """

    def __init__(self, id: str=None, name: str=None, patients: PatientBasic=None, genes: GeneBasic=None, prevalence: float=None):  # noqa: E501
        """HPO - a model defined in Swagger

        :param id: The id of this HPO.  # noqa: E501
        :type id: str
        :param name: The name of this HPO.  # noqa: E501
        :type name: str
        :param patients: The patients of this HPO.  # noqa: E501
        :type patients: PatientBasic
        :param genes: The genes of this HPO.  # noqa: E501
        :type genes: GeneBasic
        :param prevalence: The prevalence of this HPO.  # noqa: E501
        :type prevalence: float
        """
        self.swagger_types = {
            'id': str,
            'name': str,
            'patients': PatientBasic,
            'genes': GeneBasic,
            'prevalence': float
        }

        self.attribute_map = {
            'id': 'id',
            'name': 'name',
            'patients': 'patients',
            'genes': 'genes',
            'prevalence': 'prevalence'
        }

        self._id = id
        self._name = name
        self._patients = patients
        self._genes = genes
        self._prevalence = prevalence

    @classmethod
    def from_dict(cls, dikt) -> 'HPO':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The HPO of this HPO.  # noqa: E501
        :rtype: HPO
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> str:
        """Gets the id of this HPO.


        :return: The id of this HPO.
        :rtype: str
        """
        return self._id

    @id.setter
    def id(self, id: str):
        """Sets the id of this HPO.


        :param id: The id of this HPO.
        :type id: str
        """

        self._id = id

    @property
    def name(self) -> str:
        """Gets the name of this HPO.


        :return: The name of this HPO.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name: str):
        """Sets the name of this HPO.


        :param name: The name of this HPO.
        :type name: str
        """

        self._name = name

    @property
    def patients(self) -> PatientBasic:
        """Gets the patients of this HPO.


        :return: The patients of this HPO.
        :rtype: PatientBasic
        """
        return self._patients

    @patients.setter
    def patients(self, patients: PatientBasic):
        """Sets the patients of this HPO.


        :param patients: The patients of this HPO.
        :type patients: PatientBasic
        """

        self._patients = patients

    @property
    def genes(self) -> GeneBasic:
        """Gets the genes of this HPO.


        :return: The genes of this HPO.
        :rtype: GeneBasic
        """
        return self._genes

    @genes.setter
    def genes(self, genes: GeneBasic):
        """Sets the genes of this HPO.


        :param genes: The genes of this HPO.
        :type genes: GeneBasic
        """

        self._genes = genes

    @property
    def prevalence(self) -> float:
        """Gets the prevalence of this HPO.


        :return: The prevalence of this HPO.
        :rtype: float
        """
        return self._prevalence

    @prevalence.setter
    def prevalence(self, prevalence: float):
        """Sets the prevalence of this HPO.


        :param prevalence: The prevalence of this HPO.
        :type prevalence: float
        """

        self._prevalence = prevalence
