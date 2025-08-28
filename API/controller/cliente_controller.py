from flask import Blueprint, request, jsonify
from model.cliente import listar, criar, atualizar, remover


cliente_bp = Blueprint('cliente', __name__)


@cliente_bp.route('/clientes', methods=['GET'])
def clientes_listar():
  dominio = request.args.get('dominio')
  res = listar(dominio)
  return jsonify(res), (200 if res.get('success') else 400)

@cliente_bp.route('/clientes', methods=['POST'])
def clientes_criar():
  data = request.get_json(silent=True) or {}
  dominio = data.get('dominio')
  payload = {k: v for k, v in data.items() if k != 'dominio'}
  res = criar(dominio, payload)
  return jsonify(res), (200 if res.get('success') else 400)

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['PUT'])
def clientes_atualizar(id_cliente):
  data = request.get_json(silent=True) or {}
  dominio = data.get('dominio')
  payload = {k: v for k, v in data.items() if k not in ('dominio', 'id_cliente')}
  res = atualizar(dominio, id_cliente, payload)
  return jsonify(res), (200 if res.get('success') else 400)

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['DELETE'])
def clientes_remover(id_cliente):
  dominio = request.args.get('dominio') or (request.get_json(silent=True) or {}).get('dominio')
  res = remover(dominio, id_cliente)
  return jsonify(res), (200 if res.get('success') else 400)


