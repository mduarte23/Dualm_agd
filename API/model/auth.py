import os
from datetime import datetime, timedelta
from typing import Tuple, Optional, Dict, Any

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


def _get_secret() -> str:
    # Prefer strong secret from env; fallback to static for dev only
    return (
        os.getenv("JWT_SECRET")
        or os.getenv("SECRET_KEY")
        or "@p1_Du@l3!@"
    )


def _get_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(_get_secret())


def create_token(payload: Dict[str, Any], expires_in_seconds: int = 60 * 60 * 8) -> str:
    # Store expiry inside token for clients that want to read it
    data = dict(payload)
    data.setdefault("iat", int(datetime.utcnow().timestamp()))
    data.setdefault("exp", int((datetime.utcnow() + timedelta(seconds=expires_in_seconds)).timestamp()))
    s = _get_serializer()
    return s.dumps(data, salt="auth-token")


def verify_token(token: str, max_age_seconds: Optional[int] = None) -> Tuple[bool, Optional[Dict[str, Any]], str]:
    s = _get_serializer()
    try:
        payload = s.loads(token, salt="auth-token", max_age=max_age_seconds or 60 * 60 * 24)
        return True, payload, ""
    except SignatureExpired:
        return False, None, "Token expirado"
    except BadSignature:
        return False, None, "Token inválido"
    except Exception as e:
        return False, None, f"Falha ao validar token: {e}"


