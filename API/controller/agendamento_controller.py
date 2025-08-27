from flask import Blueprint, request, jsonify
from model.agendamento import agendamento


agendamento_bp = Blueprint("agendamento", __name__)


@agendamento_bp.route("/agendamentos", methods=["POST"])
@agendamento_bp.route("/agendamento", methods=["POST"])  # alias singular
def criar_agendamento():
    data = request.get_json(silent=True) or {}

    required = ["id_cliente", "id_especialista", "data", "horario", "dominio"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({
            "success": False,
            "message": f"Campos obrigatórios ausentes: {', '.join(missing)}"
        }), 400

    result = agendamento(
        id_cliente=data["id_cliente"],
        id_especialista=data["id_especialista"],
        data=data["data"],
        horario=data["horario"],
        dominio=data["dominio"],
    )

    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


