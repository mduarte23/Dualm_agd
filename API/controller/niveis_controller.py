from flask import Blueprint, request, jsonify
from model.niveis import listar, criar, atualizar, remover


niveis_bp = Blueprint('niveis', __name__)


@niveis_bp.route('/niveis', methods=['GET'])
def niveis_listar():
    dominio = request.args.get('dominio')
    res = listar(dominio)
    return jsonify(res), (200 if res.get('success') else 400)


@niveis_bp.route('/niveis', methods=['POST'])
def niveis_criar():
    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    nivel = data.get('nivel')
    res = criar(dominio, nivel)
    return jsonify(res), (200 if res.get('success') else 400)


@niveis_bp.route('/niveis/<int:id_nivel>', methods=['PUT'])
def niveis_atualizar(id_nivel):
    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    nivel = data.get('nivel')
    res = atualizar(dominio, id_nivel, nivel)
    return jsonify(res), (200 if res.get('success') else 400)


@niveis_bp.route('/niveis/<int:id_nivel>', methods=['DELETE'])
def niveis_remover(id_nivel):
    dominio = request.args.get('dominio') or (request.get_json(silent=True) or {}).get('dominio')
    res = remover(dominio, id_nivel)
    return jsonify(res), (200 if res.get('success') else 400)


