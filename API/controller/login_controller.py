from flask import Blueprint, request, jsonify, current_app
import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from model.login import busca_ip
from model.db_config import conexao
from model.criptografia import camuflar_senha
from datetime import datetime, timedelta
import random

# Armazenamento simples em memória para códigos de recuperação
# Chave: f"{dominio}|{email}" -> { 'code': '123456', 'expires_at': datetime }
_reset_codes = {}
from model.login import login as login_service


login_bp = Blueprint("login", __name__)


@login_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json(silent=True) or {}

    dominio = data.get("dominio")
    email = data.get("email")
    senha = data.get("senha")

    if not dominio or not email or not senha:
        return jsonify({
            "success": False,
            "message": "Campos obrigatórios ausentes: dominio, email, senha"
        }), 400

    result = login_service(dominio, email, senha)
    status_code = 200 if result.get("success") else 401
    return jsonify(result), status_code


@login_bp.route("/login/esqueci", methods=["POST"])
def esqueci_senha_route():
    data = request.get_json(silent=True) or {}
    dominio = data.get("dominio")
    email = data.get("email")

    if not dominio or not email:
        return jsonify({
            "success": False,
            "message": "Campos obrigatórios ausentes: dominio, email"
        }), 400

    # Gerar código de 6 dígitos com expiração de 15 minutos
    try:
        code = str(random.randint(100000, 999999))
        key = f"{dominio}|{email}"
        _reset_codes[key] = {
            'code': code,
            'expires_at': datetime.utcnow() + timedelta(minutes=15)
        }

        subject = "Código de Recuperação de Senha"
        body = (
            "Olá,\n\n"
            "Recebemos uma solicitação para redefinir sua senha.\n"
            "Se você não solicitou, ignore este e-mail.\n\n"
            f"Seu código de recuperação é: {code}\n"
            "Validade: 15 minutos.\n\n"
            "Use este código na tela de login para criar uma nova senha."
        )

        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = current_app.config.get('MAIL_DEFAULT_SENDER')
        msg['To'] = email

        server = smtplib.SMTP(current_app.config.get('MAIL_SERVER'), current_app.config.get('MAIL_PORT'))
        if current_app.config.get('MAIL_USE_TLS'):
            server.starttls()
        server.login(current_app.config.get('MAIL_USERNAME'), current_app.config.get('MAIL_PASSWORD'))
        server.sendmail(msg['From'], [email], msg.as_string())
        server.quit()
    except Exception as e:
        # Não revelar detalhes ao usuário
        print(f"Erro ao enviar e-mail de recuperação: {e}")

    # Mensagem genérica de sucesso (mesmo em caso de falha de envio, por segurança)
    return jsonify({
        "success": True,
        "message": "Se existir uma conta, enviamos um código de recuperação ao e-mail informado."
    }), 200


@login_bp.route("/login/redefinir", methods=["POST"])
def redefinir_senha_route():
    data = request.get_json(silent=True) or {}
    token = data.get('token')
    nova_senha = data.get('senha')
    if not token or not nova_senha:
        return jsonify({ 'success': False, 'message': 'Token e nova senha são obrigatórios' }), 400

    try:
        s = URLSafeTimedSerializer(current_app.config.get('MAIL_PASSWORD') or 'secret')
        payload = s.loads(token, salt='reset-senha', max_age=3600)
        dominio = payload.get('dominio')
        email = payload.get('email')
        if not dominio or not email:
            return jsonify({ 'success': False, 'message': 'Token inválido' }), 400

        ip = busca_ip(dominio)
        if not ip:
            return jsonify({ 'success': False, 'message': 'Domínio inválido' }), 400
        conn_info = conexao(ip)
        if not conn_info.get('success'):
            return jsonify({ 'success': False, 'message': conn_info.get('message', 'Erro de conexão') }), 500
        conn = conn_info['connection']
        with conn.cursor() as cur:
            cur.execute("UPDATE usuarios SET senha = %s WHERE email = %s", (camuflar_senha(nova_senha), email))
            conn.commit()
        return jsonify({ 'success': True, 'message': 'Senha redefinida com sucesso' }), 200
    except SignatureExpired:
        return jsonify({ 'success': False, 'message': 'Token expirado' }), 400
    except BadSignature:
        return jsonify({ 'success': False, 'message': 'Token inválido' }), 400
    except Exception as e:
        print(f"Erro ao redefinir senha: {e}")
        return jsonify({ 'success': False, 'message': 'Erro ao redefinir senha' }), 500


@login_bp.route("/login/redefinir-codigo", methods=["POST"])
def redefinir_senha_codigo_route():
    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    email = data.get('email')
    codigo = data.get('codigo')
    nova_senha = data.get('senha')
    if not dominio or not email or not codigo or not nova_senha:
        return jsonify({ 'success': False, 'message': 'Informe domínio, e-mail, código e nova senha' }), 400

    key = f"{dominio}|{email}"
    info = _reset_codes.get(key)
    if not info:
        return jsonify({ 'success': False, 'message': 'Solicite um novo código' }), 400
    if datetime.utcnow() > info['expires_at']:
        _reset_codes.pop(key, None)
        return jsonify({ 'success': False, 'message': 'Código expirado' }), 400
    if str(codigo) != str(info['code']):
        return jsonify({ 'success': False, 'message': 'Código inválido' }), 400

    try:
        ip = busca_ip(dominio)
        if not ip:
            return jsonify({ 'success': False, 'message': 'Domínio inválido' }), 400
        conn_info = conexao(ip)
        if not conn_info.get('success'):
            return jsonify({ 'success': False, 'message': conn_info.get('message', 'Erro de conexão') }), 500
        conn = conn_info['connection']
        with conn.cursor() as cur:
            cur.execute("UPDATE usuarios SET senha = %s WHERE email = %s", (camuflar_senha(nova_senha), email))
            conn.commit()
        _reset_codes.pop(key, None)
        return jsonify({ 'success': True, 'message': 'Senha redefinida com sucesso' }), 200
    except Exception as e:
        print(f"Erro ao redefinir senha por código: {e}")
        return jsonify({ 'success': False, 'message': 'Erro ao redefinir senha' }), 500

