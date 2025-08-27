from flask import Blueprint, request, jsonify
from model import convenios as convenios_model


convenios_bp = Blueprint("convenios", __name__)


@convenios_bp.route("/convenios", methods=["GET"])
def listar_convenios():
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = convenios_model.listar(dominio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@convenios_bp.route("/convenios", methods=["POST"])
def criar_convenio():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    nome = data.get("nome_convenio")
    result = convenios_model.criar(dominio, nome)
    status = 201 if result.get("success") else 400
    return jsonify(result), status


@convenios_bp.route("/convenios/<int:id_convenio>", methods=["PUT"])
def atualizar_convenio(id_convenio):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    nome = data.get("nome_convenio")
    result = convenios_model.atualizar(dominio, id_convenio, nome)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@convenios_bp.route("/convenios/<int:id_convenio>", methods=["DELETE"])
def excluir_convenio(id_convenio):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = convenios_model.excluir(dominio, id_convenio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


