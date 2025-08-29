from flask import Blueprint, request, jsonify
import base64
import os

from model import agendamento as ag_mod


n8n_bp = Blueprint('n8n', __name__)


def _check_basic_auth(req) -> bool:
    auth = req.headers.get('Authorization', '')
    if not auth.lower().startswith('basic '):
        return False
    try:
        b64 = auth.split(' ', 1)[1].strip()
        raw = base64.b64decode(b64).decode('utf-8')
        username, password = raw.split(':', 1)
    except Exception:
        return False

    expected_user = os.getenv('N8N_BASIC_USER') or 'dualm-api'
    expected_pass = os.getenv('N8N_BASIC_PASS') or '@p1_Du@l3!@'
    return username == expected_user and password == expected_pass


@n8n_bp.route('/n8n/agendamentos', methods=['POST'])
def n8n_criar_agendamento():
    # Basic Auth
    if not _check_basic_auth(request):
        resp = jsonify({ 'success': False, 'message': 'Não autorizado' })
        resp.status_code = 401
        resp.headers['WWW-Authenticate'] = 'Basic realm="n8n"'
        return resp

    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    id_cliente = data.get('id_cliente')
    id_especialista = data.get('id_especialista')
    data_ag = data.get('data')
    horario = data.get('horario')

    required = [('dominio', dominio), ('id_cliente', id_cliente), ('id_especialista', id_especialista), ('data', data_ag), ('horario', horario)]
    missing = [k for k, v in required if v in (None, '', [])]
    if missing:
        return jsonify({ 'success': False, 'message': f"Campos obrigatórios ausentes: {', '.join(missing)}" }), 400

    # Enforce regras como no site (sem ignorar limite por padrão)
    result = ag_mod.agendamento(id_cliente, id_especialista, data_ag, horario, dominio, ignorar_limite=False)
    if result.get('success'):
        return jsonify(result), 201

    # Quando falha, tentar sugerir até 3 horários/dias alternativos
    try:
        cliente_tem_conv, id_conv = ag_mod.info_cliente(id_cliente, dominio)
        especialista, convenios_especialista, tempo_consulta = ag_mod.info_especialista(id_especialista, dominio)
        max_consulta, antecedencia = (0, 0)
        aceita_convenio = False
        if cliente_tem_conv and convenios_especialista:
            try:
                aceita_convenio = any((row.get('id_convenio') == id_conv) for row in convenios_especialista)
            except Exception:
                aceita_convenio = False
        if cliente_tem_conv and aceita_convenio:
            try:
                max_consulta, antecedencia = ag_mod.info_gerencia_agenda(id_especialista, id_conv, dominio)
            except Exception:
                max_consulta, antecedencia = 0, 0

        sugestoes = []
        try:
            sugestoes = ag_mod.sugerir_horarios_ia(
                id_especialista=id_especialista,
                id_convenio=id_conv,
                data_str=data_ag,
                horario_str=horario,
                dominio=dominio,
                antecedencia_dias=antecedencia or 0,
                max_consulta=max_consulta or 0,
                tempo_consulta_min=tempo_consulta or 0,
                k=3
            )
        except Exception:
            sugestoes = []

        payload_fail = {
            'success': False,
            'message': result.get('message') or 'Não foi possível criar o agendamento',
            'code': result.get('code') or 'AGENDAMENTO_FALHOU',
            'sugestoes': sugestoes
        }
        # 409 sinaliza conflito/regra de negócio
        return jsonify(payload_fail), 409
    except Exception:
        # Se algo der errado ao sugerir, apenas devolve o erro original
        status = 409 if result.get('code') else 400
        return jsonify(result), status


@n8n_bp.route('/n8n/agendamentos/sem-convenio', methods=['POST'])
def n8n_criar_agendamento_sem_convenio():
    # Basic Auth
    if not _check_basic_auth(request):
        resp = jsonify({ 'success': False, 'message': 'Não autorizado' })
        resp.status_code = 401
        resp.headers['WWW-Authenticate'] = 'Basic realm="n8n"'
        return resp

    data = request.get_json(silent=True) or {}
    dominio = data.get('dominio')
    id_cliente = data.get('id_cliente')
    id_especialista = data.get('id_especialista')
    data_ag = data.get('data')
    horario = data.get('horario')

    required = [('dominio', dominio), ('id_cliente', id_cliente), ('id_especialista', id_especialista), ('data', data_ag), ('horario', horario)]
    missing = [k for k, v in required if v in (None, '', [])]
    if missing:
        return jsonify({ 'success': False, 'message': f"Campos obrigatórios ausentes: {', '.join(missing)}" }), 400

    # Força fluxo sem convênio: ignora limites por convênio.
    # Se o cliente tiver convênio, vamos agendar como sem convênio (id_convenio=None) usando rotina principal.
    try:
        # Precisamos do tempo_consulta e outras regras (disponibilidade/antecedência de atendimento do especialista ainda valem)
        especialista, _convs, tempo_consulta = ag_mod.info_especialista(id_especialista, dominio)
        # Checa regras de disponibilidade comuns
        if not ag_mod.medico_atende_no_horario(id_especialista, data_ag, horario, tempo_consulta, dominio):
            return jsonify({ 'success': False, 'message': 'Especialista não atende neste dia/horário' }), 409
        if not ag_mod.horario_cliente_disponivel(id_cliente, data_ag, horario, tempo_consulta, dominio):
            return jsonify({ 'success': False, 'message': 'Cliente já possui agendamento neste horário' }), 409
        if not ag_mod.horario_disponivel(id_especialista, data_ag, horario, tempo_consulta, dominio):
            # Sem convênio: se o horário já está ocupado, sugerimos alternativas
            sugestoes = ag_mod.sugerir_horarios_ia(
                id_especialista=id_especialista,
                id_convenio=None,
                data_str=data_ag,
                horario_str=horario,
                dominio=dominio,
                antecedencia_dias=0,
                max_consulta=0,
                tempo_consulta_min=tempo_consulta or 0,
                k=3
            )
            return jsonify({ 'success': False, 'code': 'HORARIO_OCUPADO', 'message': 'Horário já ocupado para este especialista', 'sugestoes': sugestoes }), 409

        # Tudo certo: realiza sem convênio (id_convenio=None)
        ag_mod.realiza_agendamento(id_cliente, id_especialista, data_ag, horario, tempo_consulta, None, dominio)
        return jsonify({ 'success': True, 'message': 'Agendamento realizado com sucesso (sem convênio)' }), 201
    except Exception as e:
        # Tentativa de sugestões em caso de erro inesperado
        try:
            especialista, _convs, tempo_consulta = ag_mod.info_especialista(id_especialista, dominio)
            sugestoes = ag_mod.sugerir_horarios_ia(
                id_especialista=id_especialista,
                id_convenio=None,
                data_str=data_ag,
                horario_str=horario,
                dominio=dominio,
                antecedencia_dias=0,
                max_consulta=0,
                tempo_consulta_min=tempo_consulta or 0,
                k=3
            )
        except Exception:
            sugestoes = []
        return jsonify({ 'success': False, 'message': f'Falha ao criar agendamento: {e}', 'sugestoes': sugestoes }), 400


