from flask import Blueprint, request, jsonify
from model import empresa as empresa_model
from model.db_config import conexao
from model.login import busca_ip
from model.criptografia import camuflar_senha


empresa_bp = Blueprint("empresa", __name__)


@empresa_bp.route("/empresa", methods=["GET"])
def obter_empresa():
    dominio = request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    result = empresa_model.obter(dominio)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@empresa_bp.route("/empresa", methods=["PUT"]) 
def atualizar_empresa():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    payload = {k: v for k, v in data.items() if k != "dominio"}
    result = empresa_model.atualizar(dominio, payload)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@empresa_bp.route("/conta", methods=["PUT"])
def atualizar_conta():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio") or request.args.get("dominio")
    if not dominio:
        return jsonify({"success": False, "message": "Informe o dominio"}), 400
    user_id = data.get("id_usuario")
    nome = data.get("nome_usuario")
    email = data.get("email")
    senha = data.get("senha")
    if not user_id:
        return jsonify({"success": False, "message": "Informe id_usuario"}), 400

    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info["success"]:
        return jsonify({"success": False, "message": info.get("message", "Erro na conexão")}), 400

    conn = info["connection"]
    cur = conn.cursor()
    try:
        sets = []
        values = []
        if nome is not None:
            sets.append("nome_usuario = %s")
            values.append(nome)
        if email is not None:
            sets.append("email = %s")
            values.append(email)
        if senha:
            sets.append("senha = %s")
            values.append(camuflar_senha(senha))
        if not sets:
            return jsonify({"success": False, "message": "Nada para atualizar"}), 400
        values.append(user_id)
        cur.execute(f"UPDATE usuarios SET {', '.join(sets)} WHERE id_usuario = %s", tuple(values))
        conn.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": f"Erro ao atualizar conta: {e}"}), 400
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


