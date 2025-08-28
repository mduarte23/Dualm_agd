from model.db_config import conexao
from model.login import busca_ip
from model.criptografia import camuflar_senha


def _has_column(conn, table_name, column_name):
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = %s AND column_name = %s
                LIMIT 1
                """,
                (table_name, column_name),
            )
            return cur.fetchone() is not None
    except Exception:
        return False

def _has_table(conn, table_name):
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 1 FROM information_schema.tables WHERE table_name = %s LIMIT 1
                """,
                (table_name,),
            )
            return cur.fetchone() is not None
    except Exception:
        return False


def obter(dominio):
    ip = busca_ip(dominio) if dominio else None
    alvo = ip or dominio
    info = conexao(alvo)
    if not info["success"]:
        return {"success": False, "message": info.get("message", "Erro na conexão")}
    conn = info["connection"]
    cur = conn.cursor()
    try:
        has_dispara = _has_column(conn, 'empresa', 'dispara_msg')
        if has_dispara:
            cur.execute("SELECT id_empresa, nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco, dispara_msg FROM empresa LIMIT 1")
        else:
            cur.execute("SELECT id_empresa, nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco FROM empresa LIMIT 1")
        row = cur.fetchone()
        if not row:
            return {"success": True, "data": None}
        # adiciona chave dispara_msg quando coluna não existe, e lê antecedencia da tabela dedicada se existir
        if not has_dispara:
            # garantir chave dispara_msg no payload mesmo sem coluna
            try:
                if isinstance(row, dict):
                    row["dispara_msg"] = False
            except Exception:
                pass
        # obter antecedencia da tabela dispara_msg, se existir
        if _has_table(conn, 'dispara_msg'):
            try:
                cur.execute("SELECT antecedencia FROM dispara_msg ORDER BY antecedencia ASC")
                msg_rows = cur.fetchall() or []
                values = []
                for r in msg_rows:
                    try:
                        values.append(int(r["antecedencia"] if isinstance(r, dict) else r[0]))
                    except Exception:
                        pass
                if isinstance(row, dict):
                    row["antecedencias"] = values
                    # compat: também expõe um único valor (primeiro) caso o front antigo use
                    row["antecedencia"] = (values[0] if values else None)
            except Exception:
                # ignora falhas de leitura dessa tabela
                pass
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
    dispara_msg = payload.get("dispara_msg")
    antecedencia = payload.get("antecedencia")
    antecedencias = payload.get("antecedencias")
    try:
        cur.execute("SELECT id_empresa FROM empresa LIMIT 1")
        row = cur.fetchone()
        has_dispara = _has_column(conn, 'empresa', 'dispara_msg')
        if row:
            if has_dispara:
                cur.execute(
                    "UPDATE empresa SET nome_empresa=%s, descricao_empresa=%s, horario_atendimento=%s, telefone=%s, endereco=%s, dispara_msg=%s WHERE id_empresa=%s",
                    (nome, descricao, horario, telefone, endereco, dispara_msg, row["id_empresa"] if isinstance(row, dict) else row[0]),
                )
            else:
                cur.execute(
                    "UPDATE empresa SET nome_empresa=%s, descricao_empresa=%s, horario_atendimento=%s, telefone=%s, endereco=%s WHERE id_empresa=%s",
                    (nome, descricao, horario, telefone, endereco, row["id_empresa"] if isinstance(row, dict) else row[0]),
                )
        else:
            if has_dispara:
                cur.execute(
                    "INSERT INTO empresa (nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco, dispara_msg) VALUES (%s, %s, %s, %s, %s, %s)",
                    (nome, descricao, horario, telefone, endereco, dispara_msg),
                )
            else:
                cur.execute(
                    "INSERT INTO empresa (nome_empresa, descricao_empresa, horario_atendimento, telefone, endereco) VALUES (%s, %s, %s, %s, %s)",
                    (nome, descricao, horario, telefone, endereco),
                )
        # Atualizar/Inserir antecedencia em dispara_msg, se tabela existir e valor fornecido
        if _has_table(conn, 'dispara_msg') and ((antecedencia is not None) or (antecedencias is not None)):
            try:
                # normaliza para lista de inteiros únicos e ordenados
                vals = []
                if isinstance(antecedencias, list):
                    for v in antecedencias:
                        try:
                            vals.append(int(v))
                        except Exception:
                            pass
                elif antecedencia is not None:
                    try:
                        vals.append(int(antecedencia))
                    except Exception:
                        pass
                vals = sorted(list({v for v in vals if v is not None and v >= 0}))

                # apaga todos e reinsere
                cur.execute("DELETE FROM dispara_msg")
                for v in vals:
                    cur.execute("INSERT INTO dispara_msg (antecedencia) VALUES (%s)", (v,))
            except Exception:
                # não falhar por causa da tabela opcional
                pass
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


