from model.db_config import conexao
from model.login import busca_ip


def listar(dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("SELECT id_convenio, nome_convenio FROM convenios ORDER BY nome_convenio ASC")
        rows = cur.fetchall() or []
        return {"success": True, "data": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar convenios: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def criar(dominio, nome_convenio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    if not nome_convenio:
        return {"success": False, "message": "nome_convenio é obrigatório"}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO convenios (nome_convenio) VALUES (%s) RETURNING id_convenio", (nome_convenio,))
        row = cur.fetchone()
        conn.commit()
        return {"success": True, "data": {"id_convenio": row["id_convenio"] if isinstance(row, dict) else row[0]}}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao criar convênio: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def atualizar(dominio, id_convenio, nome_convenio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("UPDATE convenios SET nome_convenio = %s WHERE id_convenio = %s", (nome_convenio, id_convenio))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao atualizar convênio: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def excluir(dominio, id_convenio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM convenios WHERE id_convenio = %s", (id_convenio,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao excluir convênio: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


