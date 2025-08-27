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
        cur.execute("SELECT id_especialidade, nome_especialidade FROM especialidades ORDER BY nome_especialidade ASC")
        rows = cur.fetchall() or []
        return {"success": True, "data": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar especialidades: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def criar(dominio, nome_especialidade):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    if not nome_especialidade:
        return {"success": False, "message": "nome_especialidade é obrigatório"}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO especialidades (nome_especialidade)
            VALUES (%s)
            RETURNING id_especialidade
            """,
            (nome_especialidade,),
        )
        row = cur.fetchone()
        conn.commit()
        return {"success": True, "data": {"id_especialidade": row["id_especialidade"] if isinstance(row, dict) else row[0]}}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao criar especialidade: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def atualizar(dominio, id_especialidade, nome_especialidade):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    if not nome_especialidade:
        return {"success": False, "message": "nome_especialidade é obrigatório"}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE especialidades SET nome_especialidade = %s WHERE id_especialidade = %s",
            (nome_especialidade, id_especialidade),
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao atualizar especialidade: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def excluir(dominio, id_especialidade):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    conn_info = conexao(alvo)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    conn = conn_info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM especialidades WHERE id_especialidade = %s", (id_especialidade,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao excluir especialidade: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


