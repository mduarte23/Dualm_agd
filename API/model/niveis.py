from model.db_config import conexao
from model.login import busca_ip


TABLE = 'nivel_usuario'


def listar(dominio):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}
    conn_info = conexao(ip)
    if not conn_info.get('success'):
        return {"success": False, "message": conn_info.get('message', 'Erro de conexão')}
    conn = conn_info['connection']
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id_nivel, nivel FROM {TABLE} ORDER BY nivel ASC")
            rows = cur.fetchall() or []
        return {"success": True, "niveis": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar níveis: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def criar(dominio, nivel):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not nivel:
        return {"success": False, "message": "Campo obrigatório: nivel"}
    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}
    conn_info = conexao(ip)
    if not conn_info.get('success'):
        return {"success": False, "message": conn_info.get('message', 'Erro de conexão')}
    conn = conn_info['connection']
    try:
        with conn.cursor() as cur:
            cur.execute(f"INSERT INTO {TABLE} (nivel) VALUES (%s) RETURNING id_nivel, nivel", (nivel,))
            row = cur.fetchone()
        conn.commit()
        return {"success": True, "nivel": row}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao criar nível: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def atualizar(dominio, id_nivel, nivel):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not id_nivel or not nivel:
        return {"success": False, "message": "Campos obrigatórios: id_nivel, nivel"}
    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}
    conn_info = conexao(ip)
    if not conn_info.get('success'):
        return {"success": False, "message": conn_info.get('message', 'Erro de conexão')}
    conn = conn_info['connection']
    try:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE {TABLE} SET nivel = %s WHERE id_nivel = %s RETURNING id_nivel, nivel", (nivel, id_nivel))
            row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Nível não encontrado"}
        return {"success": True, "nivel": row}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao atualizar nível: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def remover(dominio, id_nivel):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not id_nivel:
        return {"success": False, "message": "Parâmetro 'id_nivel' é obrigatório"}
    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}
    conn_info = conexao(ip)
    if not conn_info.get('success'):
        return {"success": False, "message": conn_info.get('message', 'Erro de conexão')}
    conn = conn_info['connection']
    try:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {TABLE} WHERE id_nivel = %s RETURNING id_nivel", (id_nivel,))
            row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Nível não encontrado"}
        return {"success": True}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao remover nível: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


