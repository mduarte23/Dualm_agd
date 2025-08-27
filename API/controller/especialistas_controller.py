from flask import Blueprint, request, jsonify
from model import especialistas as especialistas_model


especialistas_bp = Blueprint("especialistas", __name__)


@especialistas_bp.route("/especialistas", methods=["GET"])
def listar_especialistas():
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400

    result = especialistas_model.listar(dominio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>", methods=["GET"])
def obter_especialista(id_especialista):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400

    result = especialistas_model.obter_por_id(dominio, id_especialista)
    status = 200 if result.get("success") else 404
    return jsonify(result), status


@especialistas_bp.route("/especialistas", methods=["POST"])
def criar_especialista():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400

    payload = {k: v for k, v in data.items() if k != "dominio"}
    result = especialistas_model.criar(dominio, payload)
    status = 201 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>", methods=["PUT"])
def atualizar_especialista(id_especialista):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    payload = {k: v for k, v in data.items() if k != "dominio"}
    result = especialistas_model.atualizar(dominio, id_especialista, payload)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>/especialidades", methods=["GET"])
def listar_especialidades_de_um(id_especialista):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = especialistas_model.listar_especialidades_do_especialista(dominio, id_especialista)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>/especialidades", methods=["POST"])
def adicionar_especialidade_para_um(id_especialista):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    id_especialidade = data.get("id_especialidade")
    if not dominio or not id_especialidade:
        return jsonify({"success": False, "message": "Informe dominio e id_especialidade"}), 400
    result = especialistas_model.adicionar_especialidade(dominio, id_especialista, id_especialidade)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>/especialidades/<int:id_especialidade>", methods=["DELETE"])
def remover_especialidade_de_um(id_especialista, id_especialidade):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = especialistas_model.remover_especialidade(dominio, id_especialista, id_especialidade)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>", methods=["DELETE"])
def excluir_especialista(id_especialista):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = especialistas_model.excluir(dominio, id_especialista)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


# Convênios do especialista
@especialistas_bp.route("/especialistas/<int:id_especialista>/convenios", methods=["GET"])
def listar_convenios_de_um(id_especialista):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = especialistas_model.listar_convenios_do_especialista(dominio, id_especialista)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>/convenios", methods=["POST"])
def adicionar_convenio_para_um(id_especialista):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    id_convenio = data.get("id_convenio")
    if not dominio or not id_convenio:
        return jsonify({"success": False, "message": "Informe dominio e id_convenio"}), 400
    result = especialistas_model.adicionar_convenio(dominio, id_especialista, id_convenio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialistas_bp.route("/especialistas/<int:id_especialista>/convenios/<int:id_convenio>", methods=["DELETE"])
def remover_convenio_de_um(id_especialista, id_convenio):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = especialistas_model.remover_convenio(dominio, id_especialista, id_convenio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


