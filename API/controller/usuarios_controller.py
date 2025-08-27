from flask import Blueprint, request, jsonify
from model.usuarios import listar, criar, atualizar, remover


usuarios_bp = Blueprint('usuarios', __name__)


@usuarios_bp.route('/usuarios', methods=['GET'])
def usuarios_listar():
    dominio = request.args.get('dominio')
    resultado = listar(dominio)
    status = 200 if resultado.get('success') else 400
    return jsonify(resultado), status


@usuarios_bp.route('/usuarios', methods=['POST'])
def usuarios_criar():
    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    nome_usuario = data.get('nome_usuario') or data.get('nome')
    email = data.get('email')
    senha = data.get('senha')
    # aceitar tanto 'nivel' (nome) quanto 'id_nivel' (fk)
    nivel = data.get('id_nivel') if data.get('id_nivel') is not None else data.get('nivel')
    resultado = criar(dominio, nome_usuario, email, senha, nivel)
    status = 200 if resultado.get('success') else 400
    return jsonify(resultado), status


@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def usuarios_atualizar(id_usuario):
    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    nome_usuario = data.get('nome_usuario') or data.get('nome')
    email = data.get('email')
    senha = data.get('senha')
    nivel = data.get('id_nivel') if data.get('id_nivel') is not None else data.get('nivel')
    resultado = atualizar(dominio, id_usuario, nome_usuario=nome_usuario, email=email, senha=senha, nivel=nivel)
    status = 200 if resultado.get('success') else 400
    return jsonify(resultado), status


@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def usuarios_remover(id_usuario):
    dominio = request.args.get('dominio') or (request.get_json(silent=True) or {}).get('dominio')
    resultado = remover(dominio, id_usuario)
    status = 200 if resultado.get('success') else 400
    return jsonify(resultado), status


