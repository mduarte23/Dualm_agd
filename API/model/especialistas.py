from model.db_config import conexao
from model.login import busca_ip
import logging
import traceback


LIST_COLUMNS = (
    "id_especialista, nome_especialista, descricao, horario_atendimento, valor_consulta, aceita_convenio, tempo_consulta, gerenciar_agenda, cor"
)


def listar(dominio):
    # Aceita domínio amigável e resolve para IP do tenant
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT {LIST_COLUMNS} FROM especialistas ORDER BY nome_especialista ASC")
        rows = cur.fetchall() or []
        return {"success": True, "data": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar especialistas: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def obter_por_id(dominio, id_especialista):
    # Resolve domínio para IP se necessário
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            f"SELECT {LIST_COLUMNS} FROM especialistas WHERE id_especialista = %s",
            (id_especialista,),
        )
        row = cur.fetchone()
        if not row:
            return {"success": False, "message": "Especialista não encontrado"}
        return {"success": True, "data": row}
    except Exception as e:
        return {"success": False, "message": f"Erro ao obter especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def criar(dominio, payload):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    # Campos esperados conforme tabela do print
    nome = payload.get("nome_especialista")
    descricao = payload.get("descricao") or ""
    horario_atendimento = payload.get("horario_atendimento") or "[]"  # texto/JSON
    valor_consulta = payload.get("valor_consulta") or ""
    aceita_convenio = bool(payload.get("aceita_convenio", False))
    tempo_consulta = payload.get("tempo_consulta") or ""
    gerenciar_agenda = bool(payload.get("gerenciar_agenda", False))
    id_especialidade = payload.get("id_especialidade") or None

    if not nome:
        return {"success": False, "message": "nome_especialista é obrigatório"}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        # Tenta inserir com id_especialidade se a coluna existir
        try:
            # Tentativa 1: com cor e id_especialidade
            cur.execute(
                """
                INSERT INTO especialistas
                    (nome_especialista, descricao, horario_atendimento, valor_consulta, aceita_convenio, tempo_consulta, gerenciar_agenda, cor, id_especialidade)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_especialista
                """,
                (
                    nome,
                    descricao,
                    horario_atendimento,
                    valor_consulta,
                    aceita_convenio,
                    tempo_consulta,
                    gerenciar_agenda,
                    payload.get("cor"),
                    id_especialidade,
                ),
            )
        except Exception as e1:
            logging.error("Erro ao inserir especialista (com cor e id_especialidade): %s", str(e1))
            try:
                logging.error("Traceback: %s", traceback.format_exc())
            except Exception:
                pass
            # Após erro, limpa o estado da transação antes da próxima tentativa
            conn.rollback()
            try:
                # Tentativa 2: com cor, sem id_especialidade
                cur.execute(
                    """
                    INSERT INTO especialistas
                        (nome_especialista, descricao, horario_atendimento, valor_consulta, aceita_convenio, tempo_consulta, gerenciar_agenda, cor)
                    VALUES
                        (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id_especialista
                    """,
                    (
                        nome,
                        descricao,
                        horario_atendimento,
                        valor_consulta,
                        aceita_convenio,
                        tempo_consulta,
                        gerenciar_agenda,
                        payload.get("cor") or None,
                    ),
                )
            except Exception as e2:
                logging.error("Erro ao inserir especialista (com cor, sem id_especialidade): %s", str(e2))
                try:
                    logging.error("Traceback: %s", traceback.format_exc())
                except Exception:
                    pass
                conn.rollback()
                # Tentativa 3: sem cor e sem id_especialidade (para bancos desatualizados)
                cur.execute(
                    """
                    INSERT INTO especialistas
                        (nome_especialista, descricao, horario_atendimento, valor_consulta, aceita_convenio, tempo_consulta, gerenciar_agenda)
                    VALUES
                        (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id_especialista
                    """,
                    (
                        nome,
                        descricao,
                        horario_atendimento,
                        valor_consulta,
                        aceita_convenio,
                        tempo_consulta,
                        gerenciar_agenda,
                    ),
                )
        row = cur.fetchone()
        conn.commit()
        return {"success": True, "data": {"id_especialista": row["id_especialista"] if isinstance(row, dict) else row[0]}}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao criar especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def atualizar(dominio, id_especialista, payload):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    campos = [
        "nome_especialista",
        "descricao",
        "horario_atendimento",
        "valor_consulta",
        "aceita_convenio",
        "tempo_consulta",
        "gerenciar_agenda",
        "cor",
    ]

    valores = [payload.get(c) for c in campos]
    set_clause = ", ".join([f"{c} = %s" for c in campos])

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            f"UPDATE especialistas SET {set_clause} WHERE id_especialista = %s",
            (*valores, id_especialista),
        )
        conn.commit()

        # Se foi marcado como NÃO aceitar convênio, apagar vínculos existentes
        aceita_conv_flag = payload.get("aceita_convenio")
        if aceita_conv_flag is False:
            try:
                for tabela in ("especialista_convenios", "especialistas_convenios"):
                    try:
                        cur.execute(
                            f"DELETE FROM {tabela} WHERE id_especialista = %s",
                            (id_especialista,),
                        )
                        conn.commit()
                    except Exception:
                        conn.rollback()
                        continue
            except Exception:
                # Não bloqueia a atualização se a limpeza falhar
                pass

        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao atualizar especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def listar_especialidades_do_especialista(dominio, id_especialista):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT ee.id_especialidade, e.nome_especialidade
            FROM especialista_especialidade ee
            JOIN especialidades e ON e.id_especialidade = ee.id_especialidade
            WHERE ee.id_especialista = %s
            ORDER BY e.nome_especialidade ASC
            """,
            (id_especialista,),
        )
        rows = cur.fetchall() or []
        return {"success": True, "data": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar especialidades do especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def adicionar_especialidade(dominio, id_especialista, id_especialidade):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO especialista_especialidade (id_especialista, id_especialidade)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (id_especialista, id_especialidade),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao vincular especialidade: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def remover_especialidade(dominio, id_especialista, id_especialidade):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM especialista_especialidade WHERE id_especialista = %s AND id_especialidade = %s",
            (id_especialista, id_especialidade),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao desvincular especialidade: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def excluir(dominio, id_especialista):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        # Remove vínculos primeiro
        cur.execute("DELETE FROM especialista_especialidade WHERE id_especialista = %s", (id_especialista,))
        # Remove o especialista
        cur.execute("DELETE FROM especialistas WHERE id_especialista = %s", (id_especialista,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao excluir especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


# --- Convênios do especialista (N:N) ---
def listar_convenios_do_especialista(dominio, id_especialista):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        # tenta tabela no singular e plural
        for tabela in ("especialista_convenios", "especialistas_convenios"):
            try:
                cur.execute(
                    f"""
                    SELECT ec.id_convenio, c.nome_convenio
                    FROM {tabela} ec
                    JOIN convenios c ON c.id_convenio = ec.id_convenio
                    WHERE ec.id_especialista = %s
                    ORDER BY c.nome_convenio ASC
                    """,
                    (id_especialista,),
                )
                rows = cur.fetchall()
                if rows is not None:
                    return {"success": True, "data": rows}
            except Exception:
                continue
        return {"success": True, "data": []}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar convênios do especialista: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def adicionar_convenio(dominio, id_especialista, id_convenio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        for tabela in ("especialista_convenios", "especialistas_convenios"):
            try:
                cur.execute(
                    f"INSERT INTO {tabela} (id_especialista, id_convenio) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (id_especialista, id_convenio),
                )
                conn.commit()
                return {"success": True}
            except Exception:
                conn.rollback()
                continue
        return {"success": False, "message": "Tabela de vínculo de convênios não encontrada"}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao vincular convênio: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def remover_convenio(dominio, id_especialista, id_convenio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        for tabela in ("especialista_convenios", "especialistas_convenios"):
            try:
                cur.execute(
                    f"DELETE FROM {tabela} WHERE id_especialista = %s AND id_convenio = %s",
                    (id_especialista, id_convenio),
                )
                conn.commit()
                return {"success": True}
            except Exception:
                conn.rollback()
                continue
        return {"success": False, "message": "Tabela de vínculo de convênios não encontrada"}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao desvincular convênio: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


