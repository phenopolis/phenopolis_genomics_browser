"""
General modules
"""
import traceback
from datetime import datetime, timedelta
from functools import wraps
from time import strftime

import ujson as json
from flask import Response, jsonify, request, session
from flask_mail import Message
from sqlalchemy.orm import Session
from werkzeug.exceptions import HTTPException

from views import APP_ENV, MAIL_USERNAME, VERSION, application, mail
from views.auth import DEMO_USER, USER
from views.exceptions import PhenopolisException
from views.postgres import get_db


@application.route("/check_health")
def check_health():
    return jsonify(health="ok"), 200


@application.route("/version")
def get_version():
    return jsonify(version=VERSION), 200


@application.after_request
def after_request(response):
    application.logger.info(
        f"{request.remote_addr} {request.method} {request.scheme} {request.full_path} {response.status}"
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
        f"""{VERSION} {request.remote_addr} {request.method} {request.scheme} {request.full_path}
 5xx INTERNAL SERVER ERROR"""
    )
    application.logger.exception(e)
    response = Response()
    response.status_code = 500  # this is the default
    if isinstance(e, HTTPException):
        # start with the correct headers and status code from the error
        response = e.get_response()
    if response.status_code != 404:
        _send_error_mail(response.status_code)
    return _build_response_from_exception(response, e)


def _build_response_from_exception(response, exception):
    message = [str(x) for x in exception.args]
    success = False
    response.data = json.dumps(
        {
            "success": success,
            "error": {"type": exception.__class__.__name__, "message": message},
            "remote_addr": application.config["SERVED_URL"],
            "full_path": request.full_path,
            "method": request.method,
            "scheme": request.scheme,
            "timestamp": strftime("[%Y-%b-%d %H:%M]"),
            "version": VERSION,
        }
    )
    response.content_type = "application/json"
    return response


def _send_error_mail(code):
    msg = Message(
        f"{code}: {request.method} {application.config['SERVED_URL']}{request.full_path}",
        sender=MAIL_USERNAME,
        recipients=[MAIL_USERNAME],
    )
    msg.body = f"Version: {VERSION}\n{traceback.format_exc()}"
    mail.send(msg)


# TODO: who will review this?
# this should not be done live but offline
# need to figure out how to encode json data type in postgres import
# rather do the conversion on the fly
def process_for_display(db_session: Session, data):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('select ui.internal_id from public.users_individuals ui where ui."user" = %s', [session[USER]])
            my_patients = [x[0] for x in cur.fetchall()]
    # TODO: avoid this transformation to dict and use the objects themselves
    for x2 in data:
        if "CHROM" in x2 and "POS" in x2 and "REF" in x2 and "ALT" in x2:
            variant_id = f'{x2["CHROM"]}-{x2["POS"]}-{x2["REF"]}-{x2["ALT"]}'
            x2["variant_id"] = [{"end_href": variant_id, "display": variant_id[:60]}]
        if "gene_symbol" in x2:
            x2["gene_symbol"] = [{"display": x3} for x3 in x2["gene_symbol"].split(",") if x3]
        if x2.get("HET"):
            x2["HET"] = [
                {"display": "my:" + x3, "end_href": x3}
                if x3 in my_patients
                else {}
                if session[USER] == DEMO_USER
                else {"display": x3, "end_href": x3}
                for x3 in x2["HET"]
            ]
        if x2.get("HOM"):
            x2["HOM"] = [
                {"display": "my:" + x3, "end_href": x3}
                if x3 in my_patients
                else {}
                if session[USER] == DEMO_USER
                else {"display": x3, "end_href": x3}
                for x3 in x2["HOM"]
            ]
        # NOTE: nowhere in the project is using the lines below, I'm commenting them out @alan
        # NOTE: gene.py has commented lines about 'related_hpo' @alan
        # if "hpo_ancestors" in x2:
        #     x2["hpo_ancestors"] = [{"display": x3} for x3 in x2["hpo_ancestors"].split(";") if x3]
        # if "genes" in x2 and x2["genes"] == "":
        #     x2["genes"] = []


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
        raise PhenopolisException(f"invalid truth value {val!r}", 400)


def cache_on_browser(minutes=5):
    """ Flask decorator that allow to set Expire and Cache headers. """
    if APP_ENV == "debug":
        minutes = 0

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


def _get_pagination_parameters():
    try:
        offset = int(request.args.get("offset", 0))
        limit = int(request.args.get("limit", 1500))
    except ValueError as e:
        raise PhenopolisException(str(e), 500)
    return limit, offset
