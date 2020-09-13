from flask import request

from views import application
from views.exceptions import PhenopolisException


def _get_json_payload(clazz):
    if not request.is_json:
        raise PhenopolisException("Only mimetype application/json is accepted")
    payload = request.get_json(silent=True)
    if payload is None:
        raise PhenopolisException("Empty payload or wrong formatting")
    application.logger.debug(payload)
    return _parse_payload(payload, clazz)


def _parse_payload(payload, model_class):
    if isinstance(payload, dict):
        objects = [model_class(**payload)]
    elif isinstance(payload, list):
        objects = [model_class(**p) for p in payload]
    else:
        raise PhenopolisException("Payload of unexpected type: {}".format(type(payload)))
    return objects
