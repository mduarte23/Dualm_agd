from flask import Flask
import os
from flask_cors import CORS 
from controller.login_controller import login_bp
from controller.agendamento_controller import agendamento_bp
from controller.especialistas_controller import especialistas_bp
from controller.convenios_controller import convenios_bp
from controller.gerencia_agenda_controller import ga_bp
from controller.empresa_controller import empresa_bp
from controller.usuarios_controller import usuarios_bp
from controller.especialidades_controller import especialidades_bp
from controller.niveis_controller import niveis_bp
from controller.cliente_controller import cliente_bp

app = Flask(__name__)

# CORS simples (sem JWT)
CORS(app)

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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

