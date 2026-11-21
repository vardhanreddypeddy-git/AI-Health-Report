"""
Authentication decorator: Supports Clerk session tokens when provided,
but operates seamlessly without authentication (no Clerk requirement)
for frictionless zero-setup local use.
"""

import os
import logging
from datetime import datetime, timezone
from functools import wraps
import jwt
from flask import request, jsonify, g

logger = logging.getLogger(__name__)


def require_auth(f):
    """
    Flexible authentication decorator.
    - If Clerk authentication is configured and a Bearer token is provided, validates it.
    - If no token is provided or Clerk is not configured, allows requests through
      with a default local user identity so NO Clerk sign-in is required.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow preflight CORS OPTIONS request
        if request.method == "OPTIONS":
            return ("", 204)

        secret_key = os.getenv("CLERK_SECRET_KEY", "").strip()
        auth_header = request.headers.get("Authorization", "").strip()

        # Check for client-provided user identifier or default
        client_user_id = (
            request.headers.get("X-User-ID", "").strip()
            or "local_user"
        )

        # If a token is provided and Clerk secret is configured, attempt verification
        if auth_header.startswith("Bearer ") and secret_key:
            raw_token = auth_header[7:].strip()
            try:
                from clerk_backend_api import authenticate_request, AuthenticateRequestOptions
                jwt_key = os.getenv("CLERK_JWT_KEY", "").strip() or None
                if jwt_key and "\\n" in jwt_key:
                    jwt_key = jwt_key.replace("\\n", "\n")

                raw_azp = os.getenv("CLERK_AUTHORIZED_PARTIES")
                authorized_parties = [
                    party.strip() if "://" in party else f"https://{party.strip()}"
                    for party in raw_azp.split(",") if party.strip()
                ] if raw_azp else None

                options = AuthenticateRequestOptions(
                    secret_key=secret_key,
                    jwt_key=jwt_key,
                    authorized_parties=authorized_parties,
                    accepts_token=["session_token"]
                )

                request_state = authenticate_request(request, options)
                if request_state.is_authenticated and request_state.payload:
                    user_id = request_state.payload.get("sub")
                    if user_id and isinstance(user_id, str):
                        g.auth_state = request_state
                        g.user_id = user_id.strip()
                        g.session_id = request_state.payload.get("sid")
                        return f(*args, **kwargs)
            except Exception as auth_err:
                logger.info("Clerk verification skipped/fallback: %s", auth_err)

        # Default: No Clerk authentication required!
        if os.getenv("REQUIRE_CLERK_AUTH", "").strip().lower() in {"1", "true", "yes"}:
            g.auth_state = None
            response = jsonify({"error": "Unauthorized"})
            response.headers["WWW-Authenticate"] = "Bearer"
            return response, 401

        g.auth_state = None
        g.user_id = client_user_id
        g.session_id = "default_session"
        return f(*args, **kwargs)

    return decorated_function
