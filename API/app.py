from flask import Flask, request, jsonify, g
import os
from flask_cors import CORS 
from controller.login_controller import login_bp
from controller.agendamento_controller import agendamento_bp
from controller.especialistas_controller import especialistas_bp
from controller.convenios_controller import convenios_bp
from controller.n8n_controller import n8n_bp
from controller.gerencia_agenda_controller import ga_bp
from controller.empresa_controller import empresa_bp
from controller.usuarios_controller import usuarios_bp
from controller.especialidades_controller import especialidades_bp
from controller.niveis_controller import niveis_bp
from controller.cliente_controller import cliente_bp

app = Flask(__name__)

# CORS simples (sem JWT)
CORS(app)

# Secret para tokens/assinaturas (preferir variável de ambiente)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or os.getenv('JWT_SECRET') or '@p1_Du@l3!@'

# Configurações de e-mail para recuperação de senha
app.config['MAIL_SERVER'] = 'smtp.hostinger.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'redefinicao@dualm.com.br'
app.config['MAIL_PASSWORD'] = 'Redefinir@dualm23'
app.config['MAIL_DEFAULT_SENDER'] = 'redefinicao@dualm.com.br'

app.register_blueprint(login_bp)
app.register_blueprint(agendamento_bp)
app.register_blueprint(especialistas_bp)
app.register_blueprint(convenios_bp)
app.register_blueprint(ga_bp)
app.register_blueprint(empresa_bp)
app.register_blueprint(especialidades_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(niveis_bp)
app.register_blueprint(cliente_bp)
app.register_blueprint(n8n_bp)


# Rotas públicas (sem necessidade de token)
_PUBLIC_PREFIXES = [
    '/login',  # inclui /login, /login/esqueci, /login/redefinir, /login/redefinir-codigo
    '/n8n',    # endpoints próprios do n8n já exigem Basic Auth própria
]


@app.before_request
def _require_authentication():
    try:
        # Permitir preflight CORS
        if request.method == 'OPTIONS':
            return None

        path = request.path or '/'
        if any(path.startswith(prefix) for prefix in _PUBLIC_PREFIXES):
            return None

        # Aceitar Authorization: Bearer <token> ou X-Auth-Token
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.lower().startswith('bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        if not token:
            token = request.headers.get('X-Auth-Token')

        if not token:
            return jsonify({ 'success': False, 'message': 'Não autorizado' }), 401

        # Validar token
        from model.auth import verify_token
        ok, payload, err = verify_token(token)
        if not ok:
            return jsonify({ 'success': False, 'message': err or 'Token inválido' }), 401

        # Disponibiliza o usuário para handlers
        g.current_user = payload
        return None
    except Exception:
        # Em caso de falha inesperada, negar acesso sem vazar detalhes
        return jsonify({ 'success': False, 'message': 'Não autorizado' }), 401


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

