"""
General modules
"""
import traceback
import ujson as json
from time import strftime
from flask import jsonify, request, Response, session
from flask_mail import Message
from sqlalchemy.orm import Session
from werkzeug.exceptions import HTTPException
from db.model import UserIndividual
from views import application, mail
from views.auth import USER
from views.exceptions import PhenopolisException
from datetime import datetime, timedelta
from functools import wraps


@application.route("/check_health")
def check_health():
    return jsonify(health="ok"), 200


@application.after_request
def after_request(response):
    application.logger.info(
        "{} {} {} {} {}".format(
            request.remote_addr, request.method, request.scheme, request.full_path, response.status,
        )
    )
    # avoids rewriting the cache config if it has been set previously
    if "Cache-control" not in response.headers:
        response.headers["Cache-Control"] = "no-cache"
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    # prevent click-jacking vulnerability identified by BITs
    # response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@application.errorhandler(Exception)
def exceptions(e):
    application.logger.error(
        "{} {} {} {} 5xx INTERNAL SERVER ERROR".format(
            request.remote_addr, request.method, request.scheme, request.full_path,
        )
    )
    application.logger.exception(e)
    code = 500
    response = Response()
    if isinstance(e, HTTPException):
        code = e.code
        # start with the correct headers and status code from the error
        response = e.get_response()
    if code != 404:
        _send_error_mail(code)
    return _build_response_from_exception(response)


def _build_response_from_exception(response):
    # replace the body with JSON
    response.data = json.dumps(
        {
            "remote_addr": application.config["SERVED_URL"],
            "full_path": request.full_path,
            "method": request.method,
            "scheme": request.scheme,
            "timestamp": strftime("[%Y-%b-%d %H:%M]"),
        }
    )
    response.content_type = "application/json"
    return response


def _send_error_mail(code):
    msg = Message(
        "{code}: {method} {url}{path}".format(
            code=code, method=request.method, url=application.config["SERVED_URL"], path=request.full_path,
        ),
        sender="no-reply@phenopolis.org",
        recipients=["no-reply@phenopolis.org"],
    )
    msg.body = traceback.format_exc()
    mail.send(msg)


# TODO: who will review this?
# this should not be done live but offline
# need to figure out how to encode json data type in postgres import
# rather do the conversion on the fly
def process_for_display(db_session: Session, data):
    my_patients = list(
        db_session.query(UserIndividual)
        .filter(UserIndividual.user == session[USER])
        .with_entities(UserIndividual.internal_id)
    )
    # TODO: avoid this trnasformation to dict and use the objects themselves
    for x2 in data:
        if "CHROM" in x2 and "POS" in x2 and "REF" in x2 and "ALT" in x2:
            variant_id = "%s-%s-%s-%s" % (x2["CHROM"], x2["POS"], x2["REF"], x2["ALT"],)
            x2["variant_id"] = [{"end_href": variant_id, "display": variant_id[:60]}]
        if "gene_symbol" in x2:
            x2["gene_symbol"] = [{"display": x3} for x3 in x2["gene_symbol"].split(",") if x3]
        if "HET" in x2:
            x2["HET"] = [
                {"display": "my:" + x3, "end_href": x3} if x3 in my_patients else {"display": x3, "end_href": x3}
                for x3 in json.loads(x2["HET"])
            ]
        if "HOM" in x2:
            x2["HOM"] = [
                {"display": "my:" + x3, "end_href": x3} if x3 in my_patients else {"display": x3, "end_href": x3}
                for x3 in json.loads(x2["HOM"])
            ]
        # TODO: how to test these 2 cases below? Any example of entries containing these features?
        if "hpo_ancestors" in x2:
            x2["hpo_ancestors"] = [{"display": x3} for x3 in x2["hpo_ancestors"].split(";") if x3]
        if "genes" in x2 and x2["genes"] == "":
            x2["genes"] = []


def _parse_boolean_parameter(val):
    """Convert a string representation of truth to true (1) or false (0).
        True values are 'y', 'yes', 't', 'true', 'on', and '1'; false values
        are 'n', 'no', 'f', 'false', 'off', and '0'.  Raises ValueError if
        'val' is anything else.
        """
    # NOTE: this code was adapted from https://github.com/python/cpython/blob/master/Lib/distutils/util.py#L307
    val = val.lower()
    if val in ("y", "yes", "t", "true", "on", "1"):
        return 1
    elif val in ("n", "no", "f", "false", "off", "0"):
        return 0
    else:
        raise PhenopolisException("invalid truth value %r" % (val,), 400)


def cache_on_browser(minutes=5):
    """ Flask decorator that allow to set Expire and Cache headers. """

    def fwrap(f):
        @wraps(f)
        def wrapped_f(*args, **kwargs):
            response = f(*args, **kwargs)
            then = datetime.now() + timedelta(minutes=minutes)
            response.headers.add("Expires", then.strftime("%a, %d %b %Y %H:%M:%S GMT"))
            response.headers.add("Cache-Control", "public,max-age=%d" % int(60 * minutes))
            return response

        return wrapped_f

    return fwrap
