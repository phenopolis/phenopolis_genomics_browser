from flask import jsonify, session
from sqlalchemy.orm import Session

from db.model import IndividualVariantClassification, Individual
from views import application
from views.auth import requires_auth, USER
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.individual import _fetch_authorized_individual
from views.postgres import session_scope


@application.route("/variant-classification", methods=["POST"])
@requires_auth
def create_classification():

    with session_scope() as db_session:
        try:
            classifications = _get_json_payload(IndividualVariantClassification)
            for c in classifications:
                _check_classification_valid(db_session, c)
        except PhenopolisException as e:
            application.logger.error(str(e))
            response = jsonify(success=False, error=str(e))
            response.status_code = e.http_status
            return response

        request_ok = True
        http_status = 200
        message = "Variant classifications were created"
        try:
            # generate a new unique id for the individual
            for c in classifications:
                # insert individual
                c.user_id = session[USER]  # whatever value comes here we ensure the actual user is stored
                c.id = None  # this one should be set by the database
                c.classified_on = None  # this one should be set by the database
                db_session.add(c)
        except PhenopolisException as e:
            application.logger.exception(e)
            request_ok = False
            message = str(e)
            http_status = e.http_status

    return jsonify(success=request_ok, message=message), http_status


@application.route("/variant-classifications-by-individual/<phenopolis_id>")
@requires_auth
def get_classifications_by_individual(phenopolis_id):

    with session_scope() as db_session:
        individual = _fetch_authorized_individual(db_session, phenopolis_id)
        # unauthorized access to individual
        if not individual:
            response = jsonify(
                message="Sorry, either the patient does not exist or you are not permitted to see this patient"
            )
            response.status_code = 401
        else:
            classifications = (
                db_session.query(IndividualVariantClassification)
                .join(Individual, Individual.id == IndividualVariantClassification.individual_id)
                .filter(Individual.phenopolis_id == phenopolis_id)
                .order_by(IndividualVariantClassification.classified_on.desc())
                .all()
            )
            response = jsonify([c.as_dict() for c in classifications])
    return response


def _check_classification_valid(db_session: Session, classification: IndividualVariantClassification):
    try:
        phenopolis_id = (
            db_session.query(Individual).filter(Individual.id == classification.individual_id).first().phenopolis_id
        )
    except Exception:
        phenopolis_id = None
    individual = _fetch_authorized_individual(db_session, phenopolis_id)
    if individual is None:
        raise PhenopolisException(
            "User not authorized to classify variants for individual {}".format(classification.individual_id), 401
        )
