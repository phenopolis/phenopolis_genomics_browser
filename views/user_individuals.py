"""
Users Individuals view
"""
from flask import jsonify
from sqlalchemy.orm import Session

from db.model import UserIndividual, User, Individual
from views import application
from views.auth import requires_admin
from views.exceptions import PhenopolisException
from views.helpers import _get_json_payload
from views.postgres import session_scope


@application.route("/user-individual", methods=["POST"])
@requires_admin
def create_user_individual():

    try:
        new_user_individuals = _get_json_payload(UserIndividual)
        for u in new_user_individuals:
            _check_user_individual_valid(u)
    except PhenopolisException as e:
        application.logger.error(str(e))
        return jsonify(success=False, error=str(e)), e.http_status

    with session_scope() as db_session:
        request_ok = True
        message = "User individuals were created"
        try:
            # insert user individuals
            for u in new_user_individuals:
                # TODO: should not all these checks happen at the DB?
                _check_db_integrity_user_individual(db_session, u)
                db_session.add(u)
        except Exception as e:
            application.logger.exception(e)
            request_ok = False
            message = str(e)

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message), 200


@application.route("/user-individual", methods=["DELETE"])
@requires_admin
def delete_user_individual():
    try:
        user_individuals_to_be_deleted = _get_json_payload(UserIndividual)
    except PhenopolisException as e:
        return jsonify(success=False, error=str(e)), e.http_status

    with session_scope() as db_session:
        request_ok = True
        message = "User individuals were deleted"
        try:
            # insert user individuals
            for u in user_individuals_to_be_deleted:
                db_session.query(UserIndividual).filter(UserIndividual.user == u.user).filter(
                    UserIndividual.internal_id == u.internal_id
                ).delete()
        except Exception as e:
            application.logger.exception(e)
            request_ok = False
            message = str(e)

    if not request_ok:
        return jsonify(success=False, message=message), 500
    else:
        return jsonify(success=True, message=message), 200


def _check_db_integrity_user_individual(db_session: Session, user: UserIndividual):
    # TODO: all these checks could happen in the DB
    if db_session.query(User.user).filter(User.user.match(user.user)).count() != 1:
        raise PhenopolisException("Trying to add an entry in user_individual to a non existing user", 500)
    if db_session.query(Individual.internal_id).filter(Individual.internal_id.match(user.internal_id)).count() != 1:
        raise PhenopolisException("Trying to add an entry in user_individual to a non existing individual", 500)
    if (
        db_session.query(UserIndividual)
        .filter(UserIndividual.user.match(user.user))
        .filter(UserIndividual.internal_id.match(user.internal_id))
        .count()
        > 0
    ):
        raise PhenopolisException("Trying to add an entry in user_individual that already exists", 500)


def _check_user_individual_valid(new_user_individual: UserIndividual):
    if new_user_individual is None:
        raise PhenopolisException("Null user individual", 400)
    if new_user_individual.user is None or new_user_individual.user == "":
        raise PhenopolisException("Missing user", 400)
    if new_user_individual.internal_id is None or new_user_individual.internal_id == "":
        raise PhenopolisException("Missing individual id", 400)
