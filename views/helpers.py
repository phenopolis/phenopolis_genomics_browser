from flask import request

from views import application
from views.exceptions import PhenopolisException


def _get_json_payload(clazz=None):
    if not request.is_json:
        raise PhenopolisException("Only mimetype application/json is accepted", 400)
    payload = request.get_json(silent=True)
    if not payload:
        raise PhenopolisException("Empty payload or wrong formatting", 400)
    application.logger.debug(payload)
    if clazz is not None:
        return _parse_payload(payload, clazz)
    return payload


def _parse_payload(payload, model_class):
    if isinstance(payload, dict):
        objects = [model_class(**payload)]
    elif isinstance(payload, list):
        objects = [model_class(**p) for p in payload]
    else:
        raise PhenopolisException("Payload of unexpected type: {}".format(type(payload)), 400)
    return objects
