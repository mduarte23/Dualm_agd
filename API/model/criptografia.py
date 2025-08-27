import bcrypt

def camuflar_senha(senha_plana: str) -> str:
    # Gera o hash da senha com um salt automático
    hash_bytes = bcrypt.hashpw(senha_plana.encode('utf-8'), bcrypt.gensalt())
    return hash_bytes.decode('utf-8')  # converte para string

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    # Compara a senha digitada com o hash armazenado
    return bcrypt.checkpw(senha_plana.encode('utf-8'), senha_hash.encode('utf-8'))




senha = "admin"
senha_hash = camuflar_senha(senha)
print(senha_hash)