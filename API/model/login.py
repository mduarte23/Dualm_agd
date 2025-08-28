from model.db_config import conexao
from model.criptografia import camuflar_senha, verificar_senha

def login(dominio, email, senha):
    ip = busca_ip(dominio)
    if not ip:
        return {"success": False, "message": "Domínio não encontrado"}

    conn_info = conexao(ip)
    if not conn_info["success"]:
        return {"success": False, "message": conn_info.get("message", "Erro na conexão")}

    cursor = conn_info["connection"].cursor()
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    usuario = cursor.fetchone()

    if not usuario:
        return {"success": False, "message": "Email ou senha incorretos"}

    senha_hash = usuario.get("senha")
    if not senha_hash or not verificar_senha(senha, senha_hash):
        return {"success": False, "message": "Email ou senha incorretos"}

    # Remover hash da resposta por segurança, se presente
    if "senha" in usuario:
        try:
            del usuario["senha"]
        except Exception:
            pass

    return {"success": True, "message": "Login bem sucedido", "usuario": usuario}

def busca_ip(dominio):
    ip_central = "69.62.99.17"
    conn_info = conexao(ip_central)

    if conn_info["success"]:
        conn = conn_info["connection"]
        try:
            with conn.cursor() as cur:
                # 1) tentativa exata
                cur.execute("SELECT ip FROM empresas_clientes WHERE dominio = %s", (dominio,))
                row = cur.fetchone()
                if row:
                    return row["ip"]

                # 2) se não houver ponto, tentar com .com (ex.: dualm -> dualm.com)
                if "." not in dominio:
                    cur.execute("SELECT ip FROM empresas_clientes WHERE dominio = %s", (f"{dominio}.com",))
                    row = cur.fetchone()
                    if row:
                        return row["ip"]

                # 3) fallback: tentar por prefixo (caso o domínio armazenado seja subdomínio)
                cur.execute("SELECT ip FROM empresas_clientes WHERE dominio ILIKE %s ORDER BY LENGTH(dominio) ASC LIMIT 1", (f"{dominio}%",))
                row = cur.fetchone()
                if row:
                    return row["ip"]
                return None
        except Exception as e:
            print(f"Erro ao buscar IP: {e}")
            return None
    else:
        return None


