from flask import Blueprint, request, jsonify
from model.login import login as login_service


login_bp = Blueprint("login", __name__)


@login_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json(silent=True) or {}

    dominio = data.get("dominio")
    email = data.get("email")
    senha = data.get("senha")

    if not dominio or not email or not senha:
        return jsonify({
            "success": False,
            "message": "Campos obrigatórios ausentes: dominio, email, senha"
        }), 400

    result = login_service(dominio, email, senha)
    status_code = 200 if result.get("success") else 401
    return jsonify(result), status_code


