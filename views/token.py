# code modified from https://realpython.com/handling-email-confirmation-in-flask/
from itsdangerous import URLSafeTimedSerializer
from views import application


def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(application.config["SECRET_KEY"])
    return serializer.dumps(email, salt=application.config["SECURITY_PASSWORD_SALT"])


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(application.config["SECRET_KEY"])
    try:
        email = serializer.loads(token, salt=application.config["SECURITY_PASSWORD_SALT"], max_age=expiration)
    except Exception:
        return False
    return email
