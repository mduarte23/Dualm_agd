from flask import Blueprint, request, jsonify
from model import especialidades as esp_model


especialidades_bp = Blueprint("especialidades", __name__)


@especialidades_bp.route("/especialidades", methods=["GET"])
def listar_especialidades():
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = esp_model.listar(dominio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialidades_bp.route("/especialidades", methods=["POST"])
def criar_especialidade():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    nome = data.get("nome_especialidade")
    result = esp_model.criar(dominio, nome)
    status = 201 if result.get("success") else 400
    return jsonify(result), status


@especialidades_bp.route("/especialidades/<int:id_especialidade>", methods=["PUT"])
def atualizar_especialidade(id_especialidade):
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    nome = data.get("nome_especialidade")
    result = esp_model.atualizar(dominio, id_especialidade, nome)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@especialidades_bp.route("/especialidades/<int:id_especialidade>", methods=["DELETE"])
def excluir_especialidade(id_especialidade):
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = esp_model.excluir(dominio, id_especialidade)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


