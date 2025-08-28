from model.db_config import conexao
from model.login import busca_ip


def listar(dominio):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info.get('success'):
        return {"success": False, "message": info.get('message', 'Erro de conexão')}
    conn = info['connection']
    try:
        cur = conn.cursor()
        # Campos conforme screenshot: id_cliente, nome, contato, cpf-carteira, primeira_msg, convenio, id_convenio, data_nascimento
        cur.execute("""
            SELECT id_cliente, nome, contato, "cpf-carteira", primeira_msg, convenio, id_convenio, data_nascimento
            FROM cliente
            ORDER BY nome ASC
        """)
        rows = cur.fetchall() or []
        return {"success": True, "clientes": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar clientes: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass

def criar(dominio, payload):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info.get('success'):
        return {"success": False, "message": info.get('message', 'Erro de conexão')}
    conn = info['connection']
    try:
        cur = conn.cursor()
        nome = payload.get('nome')
        contato = payload.get('contato')
        cpf = payload.get('cpf-carteira')
        primeira_msg = payload.get('primeira_msg')
        convenio = payload.get('convenio')
        id_convenio = payload.get('id_convenio')
        data_nasc = payload.get('data_nascimento')
        cur.execute("""
            INSERT INTO cliente (nome, contato, "cpf-carteira", primeira_msg, convenio, id_convenio, data_nascimento)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id_cliente, nome
        """, (nome, contato, cpf, primeira_msg, convenio, id_convenio, data_nasc))
        row = cur.fetchone()
        conn.commit()
        return {"success": True, "cliente": row}
    except Exception as e:
        try: conn.rollback()
        except Exception: pass
        return {"success": False, "message": f"Erro ao criar cliente: {e}"}
    finally:
        try: conn.close()
        except Exception: pass

def atualizar(dominio, id_cliente, payload):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info.get('success'):
        return {"success": False, "message": info.get('message', 'Erro de conexão')}
    conn = info['connection']
    try:
        campos = []
        valores = []
        for k in ('nome','contato','cpf-carteira','primeira_msg','convenio','id_convenio','data_nascimento'):
            if k in payload:
                col = '"cpf-carteira"' if k == 'cpf-carteira' else k
                campos.append(f"{col} = %s")
                valores.append(payload.get(k))
        if not campos:
            return {"success": False, "message": "Nenhum campo para atualizar"}
        valores.append(id_cliente)
        cur = conn.cursor()
        cur.execute(f"UPDATE cliente SET {', '.join(campos)} WHERE id_cliente = %s RETURNING id_cliente", tuple(valores))
        row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Cliente não encontrado"}
        return {"success": True}
    except Exception as e:
        try: conn.rollback()
        except Exception: pass
        return {"success": False, "message": f"Erro ao atualizar cliente: {e}"}
    finally:
        try: conn.close()
        except Exception: pass

def remover(dominio, id_cliente):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info.get('success'):
        return {"success": False, "message": info.get('message', 'Erro de conexão')}
    conn = info['connection']
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM cliente WHERE id_cliente = %s RETURNING id_cliente", (id_cliente,))
        row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Cliente não encontrado"}
        return {"success": True}
    except Exception as e:
        try: conn.rollback()
        except Exception: pass
        return {"success": False, "message": f"Erro ao remover cliente: {e}"}
    finally:
        try: conn.close()
        except Exception: pass

