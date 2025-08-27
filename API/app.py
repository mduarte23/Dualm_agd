from flask import Flask, send_from_directory
from flask_cors import CORS 
from controller.login_controller import login_bp
from controller.agendamento_controller import agendamento_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(login_bp)
app.register_blueprint(agendamento_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

