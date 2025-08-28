from flask import Blueprint, request, jsonify
import model.agendamento as agendamento_mod


agendamento_bp = Blueprint("agendamento", __name__)


@agendamento_bp.route("/agendamentos", methods=["GET"])
def listar_agendamentos():
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    func = getattr(agendamento_mod, "listar_agendamentos", None)
    if not callable(func):
        return jsonify({"success": False, "message": "Função listar_agendamentos não encontrada"}), 500
    result = func(dominio)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


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

    # Busca função no módulo para evitar erro em import-time
    func = getattr(agendamento_mod, "agendamento", None)
    if not callable(func):
        nomes = ", ".join(sorted([n for n in dir(agendamento_mod) if not n.startswith("_")]))
        origem = getattr(agendamento_mod, "__file__", "<desconhecido>")
        return jsonify({
            "success": False,
            "message": "Função 'agendamento' não encontrada em model.agendamento",
            "disponiveis": nomes,
            "modulo": origem
        }), 500

    result = func(
        id_cliente=data["id_cliente"],
        id_especialista=data["id_especialista"],
        data=data["data"],
        horario=data["horario"],
        dominio=data["dominio"],
    )

    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@agendamento_bp.route("/agendamentos/<int:id_agendamento>", methods=["PUT"])
def atualizar_agendamento(id_agendamento):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio")
    id_cliente = data.get("id_cliente")
    id_especialista = data.get("id_especialista")
    data_ag = data.get("data")
    horario = data.get("horario")
    func = getattr(agendamento_mod, "atualizar_agendamento", None)
    if not callable(func):
        return jsonify({"success": False, "message": "Função atualizar_agendamento não encontrada"}), 500
    result = func(id_agendamento, id_cliente, id_especialista, data_ag, horario, dominio)
    return jsonify(result), (200 if result.get("success") else 400)


@agendamento_bp.route("/agendamentos/<int:id_agendamento>", methods=["DELETE"])
def remover_agendamento(id_agendamento):
    dominio = request.args.get("dominio") or (request.get_json(silent=True) or {}).get("dominio")
    func = getattr(agendamento_mod, "remover_agendamento", None)
    if not callable(func):
        return jsonify({"success": False, "message": "Função remover_agendamento não encontrada"}), 500
    result = func(id_agendamento, dominio)
    return jsonify(result), (200 if result.get("success") else 400)


