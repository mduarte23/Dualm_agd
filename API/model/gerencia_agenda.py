from model.db_config import conexao
from model.login import busca_ip


def _conn(dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    return conexao(alvo)


def listar_por_especialista(dominio, id_especialista):
    info = _conn(dominio)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT id_convenio, max_consulta, antecedencia
            FROM gerencia_agenda
            WHERE id_especialista = %s
            ORDER BY id_convenio ASC
            """,
            (id_especialista,),
        )
        rows = cur.fetchall() or []
        return {"success": True, "data": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar gerência: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def upsert(dominio, id_especialista, id_convenio, max_consulta, antecedencia):
    info = _conn(dominio)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    try:
        # Atualiza se existir, senão insere
        cur.execute(
            """
            UPDATE gerencia_agenda
               SET max_consulta = %s, antecedencia = %s
             WHERE id_especialista = %s AND id_convenio = %s
            """,
            (int(max_consulta or 0), int(antecedencia or 0), id_especialista, id_convenio),
        )
        if cur.rowcount == 0:
            cur.execute(
                """
                INSERT INTO gerencia_agenda (id_especialista, id_convenio, max_consulta, antecedencia)
                VALUES (%s, %s, %s, %s)
                """,
                (id_especialista, id_convenio, int(max_consulta or 0), int(antecedencia or 0)),
            )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao salvar gerência: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def excluir(dominio, id_especialista, id_convenio):
    info = _conn(dominio)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM gerencia_agenda WHERE id_especialista = %s AND id_convenio = %s",
            (id_especialista, id_convenio),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao excluir gerência: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


