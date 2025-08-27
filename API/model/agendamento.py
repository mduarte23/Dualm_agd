from model.db_config import conexao
from datetime import datetime
import json

def agendamento(id_cliente, id_especialista, data, horario, dominio):

    convenio, id_convenio = info_cliente(id_cliente, dominio)
    especialista, convenio_especialista, tempo_consulta = info_especialista(id_especialista, dominio)

    if convenio is True and especialista:
        aceita_convenio = False
        if convenio_especialista:
            try:
                aceita_convenio = any(
                    (row.get("id_convenio") == id_convenio) for row in convenio_especialista
                )
            except Exception:
                aceita_convenio = False

        if aceita_convenio:
            # Evita agendamento duplicado no mesmo horário para o mesmo especialista
            if not horario_disponivel(id_especialista, data, horario, dominio):
                return {
                    "success": False,
                    "message": "Horário já ocupado para este especialista"
                }
            max_consulta, antecedencia = info_gerencia_agenda(id_especialista, id_convenio, dominio)
            qtd_agenda = info_agenda(id_especialista, id_convenio, data, dominio)
            dif_data = dif_datas(data)

            if qtd_agenda < max_consulta and dif_data >= antecedencia:
                agendamento = realiza_agendamento(id_cliente, id_especialista, data, horario, tempo_consulta, id_convenio, dominio)
                return {"success": True, "message": "Agendamento realizado com sucesso"}
            else:
                sugestoes = sugerir_horarios_ia(
                    id_especialista=id_especialista,
                    id_convenio=id_convenio,
                    data_str=data,
                    horario_str=horario,
                    dominio=dominio,
                    antecedencia_dias=antecedencia,
                    max_consulta=max_consulta,
                    tempo_consulta_min=tempo_consulta,
                    k=3
                )
                return {
                    "success": False,
                    "message": "Especialista não tem mais vagas ou a data é menor que a antecedência.",
                    "sugestoes": sugestoes
                }


        else:
            return {"success": False, "message": "Especialista não aceita o convenio"}
    else:
        return {"success": False, "message": "Cliente não possui o convenio"}

    pass


def info_cliente(id_cliente, dominio):
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        # Mantém contrato: retorna (convenio_bool, id_convenio or None)
        return False, None
    
    cursor = conn_info["connection"].cursor()
    cliente = None
    # Tenta variações comuns de tabela/coluna: cliente/clientes e id_cliente/id
    for tabela in ("cliente", "clientes"):
        for coluna in ("id_cliente", "id"):
            try:
                cursor.execute(f"SELECT convenio, id_convenio FROM {tabela} WHERE {coluna} = %s", (id_cliente,))
                cliente = cursor.fetchone()
                if cliente:
                    break
            except Exception as _:
                continue
        if cliente:
            break

    if not cliente:
        return False, None

    convenio = cliente["convenio"]

    if convenio == True:
        id_convenio = cliente["id_convenio"]
        return convenio, id_convenio
    else:
        return convenio, None


def info_especialista(id_especialista, dominio):
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        # Retorna tupla consistente para evitar exceptions no chamador
        return {}, False, None
    
    cursor = conn_info["connection"].cursor()
    cursor.execute("SELECT aceita_convenio, tempo_consulta FROM especialistas WHERE id_especialista = %s", (id_especialista,))
    especialista = cursor.fetchone()
    if not especialista:
        return {}, False, None
    
    tempo_consulta = especialista["tempo_consulta"]
    
    if especialista["aceita_convenio"] == True:
        convenio = []
        # Tenta nome no singular e plural
        for tabela in ("especialista_convenios", "especialistas_convenios"):
            try:
                cursor.execute(f"SELECT id_convenio FROM {tabela} WHERE id_especialista = %s", (id_especialista,))
                convenio = cursor.fetchall()
                if convenio:
                    break
            except Exception as _:
                continue
        if convenio is False:
            convenio = []
    else:
        convenio = False
    
    return especialista,convenio,tempo_consulta


def info_gerencia_agenda(id_especialista, id_convenio, dominio):
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    
    cursor = conn_info["connection"].cursor()
    cursor.execute("SELECT max_consulta, antecedencia FROM gerencia_agenda WHERE id_especialista = %s AND id_convenio = %s", (id_especialista, id_convenio))
    row = cursor.fetchone()

    if not row:
        return 0, 0

    try:
        max_consulta_val = row["max_consulta"] if isinstance(row, dict) else row[0]
        antecedencia_val = row["antecedencia"] if isinstance(row, dict) else row[1]
    except Exception:
        max_consulta_val, antecedencia_val = 0, 0

    max_consulta = int(max_consulta_val or 0)
    antecedencia = int(antecedencia_val or 0)
    
    return max_consulta, antecedencia

def info_agenda(id_especialista, id_convenio, data, dominio):
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    
    cursor = conn_info["connection"].cursor()
    cursor.execute("SELECT COUNT(*) AS total FROM agendamento WHERE id_especialista = %s AND id_convenio = %s AND data_agendamento = %s", (id_especialista, id_convenio, data))
    row = cursor.fetchone()
    agenda = row["total"] if isinstance(row, dict) else row[0]

    return agenda

def dif_datas(data_agendamento):
    data_agendamento = datetime.strptime(data_agendamento, "%Y-%m-%d")
    data_atual = datetime.now()
    dif = data_agendamento - data_atual
    return dif.days


def realiza_agendamento(id_cliente, id_especialista, data, horario, tempo_consulta, id_convenio, dominio):
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    
    cursor = conn_info["connection"].cursor()
    cursor.execute("INSERT INTO agendamento (id_cliente, id_especialista, data_agendamento, horario, duracao, id_convenio) VALUES (%s, %s, %s, %s, %s, %s)", (id_cliente, id_especialista, data, horario, tempo_consulta, id_convenio))
    conn_info["connection"].commit()

from datetime import datetime, timedelta, time

# --- Helpers para horários de trabalho e grade ---
def _grade_horaria_especialista(conn, id_especialista, data_referencia=None):
    """
    Lê a coluna horario_atendimento do especialista e retorna lista de tuplas (inicio, fim) como objetos time.
    Suporta dois formatos:
    - Lista simples: [{"inicio":"08:00","fim":"12:00"}, ...]
    - Mapa por dia: {seg:[{...}], ter:[{...}], ...}
    """
    cur = conn.cursor()
    cur.execute("SELECT horario_atendimento FROM especialistas WHERE id_especialista = %s", (id_especialista,))
    row = cur.fetchone()
    cur.close()

    if not row or not row.get("horario_atendimento"):
        # fallback se não houver nada configurado
        return [(time(8, 0), time(12, 0)), (time(13, 30), time(17, 30))]

    try:
        # Converte JSON para Python
        raw = row.get("horario_atendimento")
        horarios = json.loads(raw) if isinstance(raw, str) else raw

        # Caso 1: lista simples
        if isinstance(horarios, list):
            grade = []
            for h in horarios:
                inicio = datetime.strptime(h["inicio"], "%H:%M").time()
                fim = datetime.strptime(h["fim"], "%H:%M").time()
                grade.append((inicio, fim))
            return grade

        # Caso 2: mapa por dia
        if isinstance(horarios, dict):
            dia_idx = (data_referencia.weekday() if isinstance(data_referencia, datetime) else datetime.now().weekday())
            mapa = {
                0: ["seg", "segunda"],
                1: ["ter", "terca", "terça"],
                2: ["qua", "quarta"],
                3: ["qui", "quinta"],
                4: ["sex", "sexta"],
                5: ["sab", "sabado", "sábado"],
                6: ["dom", "domingo"],
            }
            chaves = mapa.get(dia_idx, [])
            blocos = []
            for k in chaves:
                v = horarios.get(k)
                if v:
                    blocos = v
                    break
            grade = []
            for h in blocos or []:
                inicio = datetime.strptime(h.get("inicio", "08:00"), "%H:%M").time()
                fim = datetime.strptime(h.get("fim", "17:00"), "%H:%M").time()
                grade.append((inicio, fim))
            if grade:
                return grade
            # fallback se mapa vazio
            return [(time(8, 0), time(12, 0)), (time(13, 30), time(17, 30))]

        # Qualquer outro tipo: fallback
        return [(time(8, 0), time(12, 0)), (time(13, 30), time(17, 30))]
    except Exception as e:
        print("Erro ao parsear horario_atendimento:", e)
        return [(time(8, 0), time(12, 0)), (time(13, 30), time(17, 30))]

def _gerar_slots(data_dt, duracao_min, conn, id_especialista, janelas=None):
    """
    Gera slots (datetime) para uma data dada, dentro das janelas de trabalho.
    """
    if janelas is None:
        janelas = _grade_horaria_especialista(conn, id_especialista, data_referencia=data_dt)

    slots = []
    for inicio, fim in janelas:
        atual = datetime.combine(data_dt.date(), inicio)
        limite = datetime.combine(data_dt.date(), fim)
        passo = timedelta(minutes=int(duracao_min))
        while atual + passo <= limite:
            slots.append(atual)
            atual += passo
    return slots

def _horarios_ocupados(conn, id_especialista, data_dt):
    """
    Busca horários já ocupados em 'agendamento' para a data e especialista.
    Retorna set de strings 'HH:MM'.
    """
    cur = conn.cursor()
    cur.execute("""
        SELECT horario
        FROM agendamento
        WHERE id_especialista = %s
          AND data_agendamento = %s
    """, (id_especialista, data_dt.date()))
    rows = cur.fetchall()
    ocupados = set()
    for r in rows:
        # se vier como time ou str:
        h = r["horario"] if isinstance(r, dict) else r[0]
        if isinstance(h, datetime):
            ocupados.add(h.strftime("%H:%M"))
        else:
            # se for time
            try:
                ocupados.add(h.strftime("%H:%M"))
            except:
                # se já for string 'HH:MM:SS' ou 'HH:MM'
                ocupados.add(str(h)[:5])
    cur.close()
    return ocupados

def _count_por_convenio_no_dia(conn, id_especialista, id_convenio, data_dt):
    """
    Conta quantos agendamentos existem para aquele especialista/convênio na data.
    Usa a mesma lógica da sua info_agenda (ajuste o FROM se precisar).
    """
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) 
        FROM agendamento
        WHERE id_especialista = %s
          AND id_convenio = %s
          AND data_agendamento = %s
    """, (id_especialista, id_convenio, data_dt.date()))
    qtd = cur.fetchone()[0]
    cur.close()
    return qtd

def _score_slot(slot_dt, desejado_dt):
    """
    Heurística simples de pontuação:
    - Quanto mais próximo do horário desejado, melhor (diferença absoluta em minutos)
    - Penaliza horários muito cedo/tarde naturalmente via distância temporal
    """
    return abs(int((slot_dt - desejado_dt).total_seconds() // 60))

def sugerir_horarios_ia(id_especialista, id_convenio, data_str, horario_str, dominio,
                        antecedencia_dias, max_consulta, tempo_consulta_min, k=3,
                        janela_busca_dias=14):
    """
    Procura até 3 horários alternativos com uma heurística "IA":
    - varre os próximos dias (até 14 por padrão)
    - respeita antecedência mínima e cap de convênio por dia
    - evita horários já ocupados
    - ranqueia pela proximidade ao horário desejado
    Retorna lista de dicts: [{"data": "YYYY-MM-DD", "horario": "HH:MM"}]
    """
    # Parse entradas
    data_dt = datetime.strptime(data_str, "%Y-%m-%d")
    try:
        # Aceita "HH:MM" ou "HH:MM:SS"
        h_parts = [int(p) for p in horario_str.split(":")[:2]]
        desejado_dt = datetime.combine(data_dt.date(), time(h_parts[0], h_parts[1]))
    except:
        # fallback: 09:00
        desejado_dt = datetime.combine(data_dt.date(), time(9, 0))

    # Conexão
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        return []

    conn = conn_info["connection"]
    hoje = datetime.now()

    candidatos_scored = []

    for delta in range(janela_busca_dias + 1):
        dia_dt = data_dt + timedelta(days=delta)

        # Respeita antecedência mínima
        if (dia_dt.date() - hoje.date()).days < antecedencia_dias:
            continue

        # Cap por convênio no dia
        qtd_conv = _count_por_convenio_no_dia(conn, id_especialista, id_convenio, dia_dt)
        if qtd_conv >= max_consulta:
            # dia cheio para esse convênio
            continue

        # Gera slots e remove ocupados
        ocupados = _horarios_ocupados(conn, id_especialista, dia_dt)
        slots = _gerar_slots(dia_dt, tempo_consulta_min, conn, id_especialista)

        livres = []
        for s in slots:
            hhmm = s.strftime("%H:%M")
            if hhmm not in ocupados:
                livres.append(s)

        # Se não há livres, segue para o próximo dia
        if not livres:
            continue

        # Ranqueia pela proximidade ao horário desejado (no dia da consulta original)
        for s in livres:
            # Desejado em outro dia: usa mesmo horário (mesmo hh:mm) para ref
            desejado_equivalente = datetime.combine(s.date(), desejado_dt.time())
            score = _score_slot(s, desejado_equivalente) + (delta * 5)  # leve penalização por estar mais distante em dias
            candidatos_scored.append((score, s))

        # Pequena otimização: se já temos muitos candidatos, podemos parar cedo
        if len(candidatos_scored) > 50:
            break

    # Ordena pelos melhores scores e pega top-k
    candidatos_scored.sort(key=lambda x: x[0])
    sugestoes = []
    usados = set()
    for _, s in candidatos_scored:
        chave = (s.date().isoformat(), s.strftime("%H:%M"))
        if chave in usados:
            continue
        sugestoes.append({"data": s.date().isoformat(), "horario": s.strftime("%H:%M")})
        usados.add(chave)
        if len(sugestoes) >= k:
            break

    try:
        conn.close()
    except:
        pass

    return sugestoes


def horario_disponivel(id_especialista, data, horario, dominio):
    """
    Retorna True se não existir agendamento para o especialista na mesma data e horário.
    """
    conn_info = conexao(dominio)
    if not conn_info["success"]:
        # Se não foi possível checar, por segurança considera indisponível
        return False
    conn = conn_info["connection"]
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 1
            FROM agendamento
            WHERE id_especialista = %s
              AND data_agendamento = %s
              AND horario = %s
            LIMIT 1
            """,
            (id_especialista, data, horario),
        )
        row = cur.fetchone()
        return row is None
    except Exception:
        return False
