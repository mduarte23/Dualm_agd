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
                SELECT 1
                FROM information_schema.tables
                WHERE table_name = %s
                LIMIT 1
                """,
                (table_name,),
            )
            return cur.fetchone() is not None
    except Exception:
        return False


def listar(dominio):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}

    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}

    conn_info = conexao(ip)
    if not conn_info.get("success"):
        return {"success": False, "message": conn_info.get("message", "Erro de conexão")}

    conn = conn_info["connection"]
    try:
        usuarios_has_nivel = _has_column(conn, 'usuarios', 'nivel')
        usuarios_has_id_nivel = _has_column(conn, 'usuarios', 'id_nivel')
        nivel_table_exists = _has_table(conn, 'nivel_usuario')
        with conn.cursor() as cur:
            if usuarios_has_id_nivel and nivel_table_exists:
                # Temos FK e tabela de níveis: podemos realizar o JOIN e retornar nome do nível
                cur.execute(
                    """
                    SELECT 
                        u.id_usuario, 
                        u.nome_usuario, 
                        u.email,
                        COALESCE(n.nivel, 'usuario') AS nivel,
                        n.id_nivel
                    FROM usuarios u
                    LEFT JOIN nivel_usuario n ON n.id_nivel = u.id_nivel
                    ORDER BY u.nome_usuario ASC
                    """
                )
                rows = cur.fetchall() or []
            elif usuarios_has_nivel:
                # Não há tabela de níveis, mas há coluna nivel em usuarios
                cur.execute(
                    """
                    SELECT 
                        id_usuario, 
                        nome_usuario, 
                        email,
                        COALESCE(nivel, 'usuario') AS nivel
                    FROM usuarios
                    ORDER BY nome_usuario ASC
                    """
                )
                rows = cur.fetchall() or []
            elif usuarios_has_id_nivel:
                # Há id_nivel em usuarios, mas não existe tabela de níveis: retornar id_nivel bruto
                cur.execute(
                    """
                    SELECT 
                        id_usuario, 
                        nome_usuario, 
                        email,
                        id_nivel
                    FROM usuarios
                    ORDER BY nome_usuario ASC
                    """
                )
                rows = cur.fetchall() or []
            else:
                # Não há informação de nível: retornar básico e setar nível padrão
                cur.execute(
                    """
                    SELECT 
                        id_usuario, 
                        nome_usuario, 
                        email
                    FROM usuarios
                    ORDER BY nome_usuario ASC
                    """
                )
                rows = cur.fetchall() or []
                for r in rows:
                    try:
                        r["nivel"] = "usuario"
                    except Exception:
                        pass
        return {"success": True, "usuarios": rows}
    except Exception as e:
        return {"success": False, "message": f"Erro ao listar usuários: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def criar(dominio, nome_usuario, email, senha, nivel='usuario', id_especialista=None):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not nome_usuario or not email or not senha:
        return {"success": False, "message": "Campos obrigatórios: nome_usuario, email, senha"}

    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}

    conn_info = conexao(ip)
    if not conn_info.get("success"):
        return {"success": False, "message": conn_info.get("message", "Erro de conexão")}

    conn = conn_info["connection"]
    try:
        senha_hash = camuflar_senha(senha)
        nivel_exists = _has_column(conn, 'usuarios', 'id_nivel') or _has_column(conn, 'usuarios', 'nivel')
        with conn.cursor() as cur:
            if nivel_exists:
                if _has_column(conn, 'usuarios', 'id_nivel'):
                    # quando existe id_nivel, nivel recebido pode ser id inteiro ou nome; tentamos como id
                    try:
                        id_nivel = int(nivel) if nivel is not None else None
                    except Exception:
                        id_nivel = None
                    if _has_column(conn, 'usuarios', 'id_especialista'):
                        cur.execute(
                            """
                            INSERT INTO usuarios (nome_usuario, email, senha, id_nivel, id_especialista)
                            VALUES (%s, %s, %s, %s, %s)
                            RETURNING id_usuario, nome_usuario, email, id_nivel, id_especialista
                            """,
                            (nome_usuario, email, senha_hash, id_nivel, id_especialista)
                        )
                    else:
                        cur.execute(
                            """
                            INSERT INTO usuarios (nome_usuario, email, senha, id_nivel)
                            VALUES (%s, %s, %s, %s)
                            RETURNING id_usuario, nome_usuario, email, id_nivel
                            """,
                            (nome_usuario, email, senha_hash, id_nivel)
                        )
                else:
                    if _has_column(conn, 'usuarios', 'id_especialista'):
                        cur.execute(
                            """
                            INSERT INTO usuarios (nome_usuario, email, senha, nivel, id_especialista)
                            VALUES (%s, %s, %s, COALESCE(%s, 'usuario'), %s)
                            RETURNING id_usuario, nome_usuario, email, COALESCE(nivel, 'usuario') AS nivel, id_especialista
                            """,
                            (nome_usuario, email, senha_hash, nivel, id_especialista)
                        )
                    else:
                        cur.execute(
                            """
                            INSERT INTO usuarios (nome_usuario, email, senha, nivel)
                            VALUES (%s, %s, %s, COALESCE(%s, 'usuario'))
                            RETURNING id_usuario, nome_usuario, email, COALESCE(nivel, 'usuario') AS nivel
                            """,
                            (nome_usuario, email, senha_hash, nivel)
                        )
            else:
                if _has_column(conn, 'usuarios', 'id_especialista'):
                    cur.execute(
                        """
                        INSERT INTO usuarios (nome_usuario, email, senha, id_especialista)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id_usuario, nome_usuario, email, id_especialista
                        """,
                        (nome_usuario, email, senha_hash, id_especialista)
                    )
                else:
                    cur.execute(
                        """
                        INSERT INTO usuarios (nome_usuario, email, senha)
                        VALUES (%s, %s, %s)
                        RETURNING id_usuario, nome_usuario, email
                        """,
                        (nome_usuario, email, senha_hash)
                    )
            novo = cur.fetchone()
        conn.commit()
        return {"success": True, "usuario": novo}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao criar usuário: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def atualizar(dominio, id_usuario, nome_usuario=None, email=None, senha=None, nivel=None, id_especialista=None):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not id_usuario:
        return {"success": False, "message": "Parâmetro 'id_usuario' é obrigatório"}

    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}

    conn_info = conexao(ip)
    if not conn_info.get("success"):
        return {"success": False, "message": conn_info.get("message", "Erro de conexão")}

    conn = conn_info["connection"]
    try:
        campos = []
        valores = []
        if nome_usuario is not None:
            campos.append("nome_usuario = %s")
            valores.append(nome_usuario)
        if email is not None:
            campos.append("email = %s")
            valores.append(email)
        if senha:
            campos.append("senha = %s")
            valores.append(camuflar_senha(senha))

        nivel_exists = _has_column(conn, 'usuarios', 'id_nivel') or _has_column(conn, 'usuarios', 'nivel')
        if nivel_exists and (nivel is not None):
            if _has_column(conn, 'usuarios', 'id_nivel'):
                campos.append("id_nivel = %s")
                try:
                    valores.append(int(nivel))
                except Exception:
                    valores.append(None)
            else:
                campos.append("nivel = %s")
                valores.append(nivel)

        if _has_column(conn, 'usuarios', 'id_especialista') and (id_especialista is not None):
            campos.append("id_especialista = %s")
            try:
                valores.append(int(id_especialista) if id_especialista is not None else None)
            except Exception:
                valores.append(None)

        if not campos:
            return {"success": False, "message": "Nenhum campo para atualizar"}

        valores.append(id_usuario)
        if nivel_exists:
            if _has_column(conn, 'usuarios', 'id_nivel'):
                query = f"UPDATE usuarios SET {', '.join(campos)} WHERE id_usuario = %s RETURNING id_usuario, nome_usuario, email, id_nivel"
            else:
                query = f"UPDATE usuarios SET {', '.join(campos)} WHERE id_usuario = %s RETURNING id_usuario, nome_usuario, email, COALESCE(nivel, 'usuario') AS nivel"
        else:
            query = f"UPDATE usuarios SET {', '.join(campos)} WHERE id_usuario = %s RETURNING id_usuario, nome_usuario, email"
        with conn.cursor() as cur:
            cur.execute(query, tuple(valores))
            atualizado = cur.fetchone()
        conn.commit()
        if not atualizado:
            return {"success": False, "message": "Usuário não encontrado"}
        return {"success": True, "usuario": atualizado}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao atualizar usuário: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


def remover(dominio, id_usuario):
    if not dominio:
        return {"success": False, "message": "Parâmetro 'dominio' é obrigatório"}
    if not id_usuario:
        return {"success": False, "message": "Parâmetro 'id_usuario' é obrigatório"}

    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}

    conn_info = conexao(ip)
    if not conn_info.get("success"):
        return {"success": False, "message": conn_info.get("message", "Erro de conexão")}

    conn = conn_info["connection"]
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM usuarios WHERE id_usuario = %s RETURNING id_usuario", (id_usuario,))
            row = cur.fetchone()
        conn.commit()
        if not row:
            return {"success": False, "message": "Usuário não encontrado"}
        return {"success": True}
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": f"Erro ao remover usuário: {e}"}
    finally:
        try:
            conn.close()
        except Exception:
            pass


