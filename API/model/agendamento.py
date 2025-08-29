from model.db_config import conexao
from model.login import busca_ip
from datetime import datetime
import json

def agendamento(id_cliente, id_especialista, data, horario, dominio, ignorar_limite=False):

    # Lê informações do cliente e especialista
    cliente_tem_convenio, id_convenio_cliente = info_cliente(id_cliente, dominio)
    especialista, convenios_especialista, tempo_consulta = info_especialista(id_especialista, dominio)

    # Trava: não permitir agendar em datas passadas
    try:
        if dif_datas(data) < 0:
            return {"success": False, "message": "Não é permitido agendar em datas passadas"}
    except Exception:
        # Em caso de data inválida, falhar também
        return {"success": False, "message": "Data inválida para agendamento"}

    # Regra: só permitir agendamento em dias/horários de atendimento do especialista
    if not medico_atende_no_horario(id_especialista, data, horario, tempo_consulta, dominio):
        return {
            "success": False,
            "message": "Especialista não atende neste dia/horário"
        }

    # Primeiro, evita conflito para o mesmo cliente no mesmo dia/horário
    # (mesmo que seja outro médico)
    if not horario_cliente_disponivel(id_cliente, data, horario, tempo_consulta, dominio):
        return {
            "success": False,
            "message": "Cliente já possui agendamento neste horário"
        }
    # Em seguida, evita conflito do mesmo especialista no mesmo horário
    if not horario_disponivel(id_especialista, data, horario, tempo_consulta, dominio):
        return {
            "success": False,
            "message": "Horário já ocupado para este especialista"
        }

    # Se o cliente possui convênio e o especialista aceita este convênio,
    # aplicamos as regras de gerência (máximo por dia/antecedência)
    aceita_convenio = False
    if cliente_tem_convenio and convenios_especialista:
        try:
            aceita_convenio = any(
                (row.get("id_convenio") == id_convenio_cliente) for row in convenios_especialista
            )
        except Exception:
            aceita_convenio = False

    if cliente_tem_convenio and aceita_convenio:
        max_consulta, antecedencia = info_gerencia_agenda(id_especialista, id_convenio_cliente, dominio)
        qtd_agenda = info_agenda(id_especialista, id_convenio_cliente, data, dominio)
        dif_data = dif_datas(data)

        # Verifica antecedência mínima (não pode ser ignorada por padrão)
        if dif_data < antecedencia:
            sugestoes = sugerir_horarios_ia(
                id_especialista=id_especialista,
                id_convenio=id_convenio_cliente,
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
                "code": "ANTECEDENCIA_INSUFICIENTE",
                "message": "A data selecionada não respeita a antecedência mínima para este convênio.",
                "sugestoes": sugestoes
            }

        # Limite por convênio atingido
        if max_consulta and qtd_agenda >= max_consulta:
            if ignorar_limite:
                realiza_agendamento(id_cliente, id_especialista, data, horario, tempo_consulta, id_convenio_cliente, dominio)
                return {"success": True, "message": "Agendamento realizado (limite por convênio excedido)", "warning": "Limite excedido"}
            else:
                return {
                    "success": False,
                    "code": "LIMITE_CONVENIO",
                    "message": "Limite de agendamentos por convênio atingido para este dia. Deseja continuar mesmo assim?",
                    "can_override": True,
                    "limite": int(max_consulta),
                    "qtd_atual": int(qtd_agenda)
                }

        # Caso dentro das regras, realiza normalmente
        realiza_agendamento(id_cliente, id_especialista, data, horario, tempo_consulta, id_convenio_cliente, dominio)
        return {"success": True, "message": "Agendamento realizado com sucesso"}

    # Caso contrário (sem convênio ou convênio não aceito), permite agendar sem convênio
    realiza_agendamento(id_cliente, id_especialista, data, horario, tempo_consulta, None, dominio)
    return {"success": True, "message": "Agendamento realizado com sucesso (sem convênio)"}


def info_cliente(id_cliente, dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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


def medico_atende_no_horario(id_especialista, data_str, horario_str, duracao_min, dominio):
    """
    Verifica se o horário solicitado cai dentro das janelas de atendimento do especialista
    naquele dia específico, considerando a duração.
    """
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info.get("success"):
        return False
    conn = info["connection"]
    try:
        # Converter strings para objetos
        data_dt = datetime.strptime(data_str, "%Y-%m-%d")
        try:
            h_parts = [int(p) for p in horario_str.split(":")[:2]]
            inicio_dt = datetime.combine(data_dt.date(), time(h_parts[0], h_parts[1]))
        except Exception:
            inicio_dt = datetime.combine(data_dt.date(), time(9, 0))
        fim_dt = inicio_dt + timedelta(minutes=int(duracao_min or 0))

        janelas = _grade_horaria_especialista(conn, id_especialista, data_referencia=data_dt)
        if not janelas:
            return False
        # Verifica se o intervalo solicitado está contido em alguma janela do dia
        for j_inicio, j_fim in janelas:
            janela_ini = datetime.combine(data_dt.date(), j_inicio)
            janela_fim = datetime.combine(data_dt.date(), j_fim)
            if inicio_dt >= janela_ini and fim_dt <= janela_fim:
                return True
        return False
    except Exception:
        return False
    finally:
        try:
            conn.close()
        except Exception:
            pass

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


def horario_disponivel(id_especialista, data, horario, duracao_min, dominio):
    """
    Retorna True se não existir agendamento para o especialista na mesma data e horário.
    """
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        # Se não foi possível checar, por segurança considera indisponível
        return False


def horario_cliente_disponivel(id_cliente, data, horario, duracao_min, dominio):
    """
    Retorna True se o cliente NÃO possuir outro agendamento na mesma data e horário
    (independente do especialista).
    """
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return False
    conn = conn_info["connection"]
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 1
            FROM agendamento
            WHERE id_cliente = %s
              AND data_agendamento::date = %s::date
              AND (horario, horario + make_interval(0,0,0,0,0, duracao, 0))
                  OVERLAPS (%s::time, %s::time + make_interval(0,0,0,0,0, %s, 0))
            LIMIT 1
            """,
            (id_cliente, data, horario, horario, int(duracao_min or 0)),
        )
        row = cur.fetchone()
        return row is None
    except Exception:
        return False

def horario_disponivel(id_especialista, data, horario, duracao_min, dominio):
    """
    Retorna True se não existir agendamento para o especialista na mesma data e horário.
    """
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
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
              AND data_agendamento::date = %s::date
              AND (horario, horario + make_interval(0,0,0,0,0, duracao, 0))
                  OVERLAPS (%s::time, %s::time + make_interval(0,0,0,0,0, %s, 0))
            LIMIT 1
            """,
            (id_especialista, data, horario, horario, int(duracao_min or 0)),
        )
        row = cur.fetchone()
        return row is None
    except Exception:
        return False


def listar_agendamentos(dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    conn = conn_info["connection"]
    try:
        def _has_table(conn, table_name):
            try:
                with conn.cursor() as _c:
                    _c.execute("SELECT 1 FROM information_schema.tables WHERE table_name=%s LIMIT 1", (table_name,))
                    return _c.fetchone() is not None
            except Exception:
                return False

        cur = conn.cursor()
        # Versão simples e estável: lista agendamentos com nome do especialista
        cur.execute(
            """
            SELECT a.id_agendamento, a.id_especialista, a.id_cliente, a.data_agendamento, a.horario, a.duracao,
                   e.nome_especialista, e.cor
            FROM agendamento a
            LEFT JOIN especialistas e ON e.id_especialista = a.id_especialista
            ORDER BY a.data_agendamento ASC, a.horario ASC
            """
        )
        rows = cur.fetchall() or []
        ags = []
        for r in rows:
            is_dict = isinstance(r, dict)
            id_ag = r["id_agendamento"] if is_dict else r[0]
            id_esp = r["id_especialista"] if is_dict else r[1]
            id_cli = r["id_cliente"] if is_dict else r[2]
            data_val = r["data_agendamento"] if is_dict else r[3]
            hora_val = r["horario"] if is_dict else r[4]
            dur = r["duracao"] if is_dict else r[5]
            nome_esp = r.get("nome_especialista") if is_dict else r[6]
            cor = r.get("cor") if is_dict else r[7]

            # normalizações
            try:
                # date/datetime -> ISO (YYYY-MM-DD)
                if hasattr(data_val, "isoformat"):
                    data_str = data_val.isoformat()
                else:
                    data_str = str(data_val)
            except Exception:
                data_str = str(data_val)

            try:
                # time/datetime -> HH:MM
                if hasattr(hora_val, "strftime"):
                    hora_str = hora_val.strftime("%H:%M")
                else:
                    hora_str = str(hora_val)[:5]
            except Exception:
                hora_str = str(hora_val)[:5]

            ags.append({
                "id_agendamento": id_ag,
                "id_especialista": id_esp,
                "id_cliente": id_cli,
                "data_agendamento": data_str,
                "horario": hora_str,
                "duracao": dur,
                "nome_especialista": nome_esp,
                "cor": cor,
            })
        return {"success": True, "agendamentos": ags}
    except Exception as e:
        try:
            print("Erro ao listar agendamentos:", e)
        except Exception:
            pass
        # Fallback: não derruba a listagem; retorna vazio para não quebrar o frontend
        return {"success": True, "agendamentos": []}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def atualizar_agendamento(id_agendamento, id_cliente, id_especialista, data, horario, dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    conn = conn_info["connection"]
    try:
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE agendamento
               SET id_cliente = COALESCE(%s, id_cliente),
                   id_especialista = COALESCE(%s, id_especialista),
                   data_agendamento = COALESCE(%s, data_agendamento),
                   horario = COALESCE(%s, horario)
             WHERE id_agendamento = %s
            RETURNING id_agendamento
            """,
            (id_cliente, id_especialista, data, horario, id_agendamento)
        )
        row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Agendamento não encontrado"}
        return {"success": True}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao atualizar agendamento: {e}"}


def remover_agendamento(id_agendamento, dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}
    conn = conn_info["connection"]
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM agendamento WHERE id_agendamento = %s RETURNING id_agendamento", (id_agendamento,))
        row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Agendamento não encontrado"}
        return {"success": True}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao remover agendamento: {e}"}