from flask import Blueprint, request, jsonify
from model import gerencia_agenda as ga_model


ga_bp = Blueprint("gerencia_agenda", __name__)


@ga_bp.route("/gerencia_agenda/<int:id_especialista>", methods=["GET"])
def listar_ga(id_especialista):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = ga_model.listar_por_especialista(dominio, id_especialista)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@ga_bp.route("/gerencia_agenda/<int:id_especialista>", methods=["POST"])
def upsert_ga(id_especialista):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    id_convenio = data.get("id_convenio")
    max_consulta = data.get("max_consulta")
    antecedencia = data.get("antecedencia")
    if not dominio or id_convenio is None:
        return jsonify({"success": False, "message": "Informe dominio e id_convenio"}), 400
    result = ga_model.upsert(dominio, id_especialista, id_convenio, max_consulta, antecedencia)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@ga_bp.route("/gerencia_agenda/<int:id_especialista>/<int:id_convenio>", methods=["DELETE"])
def excluir_ga(id_especialista, id_convenio):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = ga_model.excluir(dominio, id_especialista, id_convenio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


