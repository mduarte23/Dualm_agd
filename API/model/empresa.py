from model.db_config import conexao
from model.login import busca_ip
from model.criptografia import camuflar_senha


def obter(dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    try:
        cur.execute("SELECT id_empresa, nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco FROM empresa LIMIT 1")
        row = cur.fetchone()
        if not row:
            return {"success": True, "data": None}
        return {"success": True, "data": row}
    except Exception as e:
        return {"success": False, "message": f"Erro ao obter empresa: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def atualizar(dominio, payload):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    nome = payload.get("nome_empresa")
    descricao = payload.get("descricao_empresa")
    horario = payload.get("horario_atendimento")
    telefone = payload.get("telefone")
    endereco = payload.get("endereco")
    try:
        cur.execute("SELECT id_empresa FROM empresa LIMIT 1")
        row = cur.fetchone()
        if row:
            cur.execute(
                "UPDATE empresa SET nome_empresa=%s, descricao_empresa=%s, horario_atendimento=%s, telefone=%s, endereco=%s WHERE id_empresa=%s",
                (nome, descricao, horario, telefone, endereco, row["id_empresa"] if isinstance(row, dict) else row[0]),
            )
        else:
            cur.execute(
                "INSERT INTO empresa (nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco) VALUES (%s, %s, %s, %s, %s)",
                (nome, descricao, horario, telefone, endereco),
            )
        conn.commit()
        return {"success": True}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Erro ao salvar empresa: {e}"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


