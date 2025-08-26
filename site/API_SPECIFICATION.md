# Especificação da API - Backend Python

Este documento descreve as APIs que precisam ser implementadas no seu backend Python para funcionar com o sistema de autenticação do React.

## 🔗 Base URL
```
http://localhost:8000
```

## 📋 Endpoints Necessários

### 1. Consulta de Domínio do Cliente
**GET** `/api/client-database`

Consulta a tabela `empresas_clientes` para obter informações do banco de dados do cliente.

#### Parâmetros de Query
```json
{
  "domain": "exemplo.com"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "clientIp": "192.168.1.100",
  "clientName": "Empresa Exemplo Ltda",
  "databaseConfig": {
    "host": "192.168.1.100",
    "port": 5432,
    "database": "cliente_exemplo",
    "user": "db_user",
    "password": "db_password"
  }
}
```

#### Resposta de Erro (404)
```json
{
  "success": false,
  "message": "Domínio não encontrado"
}
```

### 2. Login no Banco do Cliente
**POST** `/api/client-login`

Faz autenticação no banco de dados do cliente usando as credenciais fornecidas.

#### Corpo da Requisição
```json
{
  "clientIp": "192.168.1.100",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "databaseConfig": {
    "host": "192.168.1.100",
    "port": 5432,
    "database": "cliente_exemplo",
    "user": "db_user",
    "password": "db_password"
  }
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "role": "admin",
    "permissions": ["read", "write", "delete"]
  },
  "clientInfo": {
    "id": 1,
    "name": "Empresa Exemplo Ltda",
    "domain": "exemplo.com",
    "database": "cliente_exemplo"
  }
}
```

#### Resposta de Erro (401)
```json
{
  "success": false,
  "message": "E-mail ou senha incorretos"
}
```

#### Resposta de Erro (404)
```json
{
  "success": false,
  "message": "Usuário não encontrado neste sistema"
}
```

## 🗄️ Estrutura da Tabela `empresas_clientes`

### Campos Esperados
```sql
CREATE TABLE empresas_clientes (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    dominio VARCHAR(255) UNIQUE NOT NULL,
    ip_banco VARCHAR(45) NOT NULL,
    porta_banco INTEGER DEFAULT 5432,
    nome_banco VARCHAR(255) NOT NULL,
    usuario_banco VARCHAR(255) NOT NULL,
    senha_banco VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exemplo de Dados
```sql
INSERT INTO empresas_clientes (
    nome_empresa, 
    dominio, 
    ip_banco, 
    porta_banco, 
    nome_banco, 
    usuario_banco, 
    senha_banco
) VALUES (
    'Empresa Exemplo Ltda',
    'exemplo.com',
    '192.168.1.100',
    5432,
    'cliente_exemplo',
    'db_user',
    'db_password'
);
```

## 🔐 Tabela de Usuários do Cliente

### Estrutura Esperada
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Implementação no Python

### Exemplo de Estrutura de Arquivos
```
apis/
├── main.py              # FastAPI app principal
├── database/
│   ├── __init__.py
│   ├── connection.py    # Conexão com PostgreSQL principal
│   └── models.py        # Modelos SQLAlchemy
├── services/
│   ├── __init__.py
│   ├── auth_service.py  # Lógica de autenticação
│   └── client_service.py # Lógica de consulta de clientes
├── routes/
│   ├── __init__.py
│   └── auth.py          # Rotas de autenticação
└── requirements.txt
```

### Dependências Necessárias
```txt
fastapi==0.104.1
uvicorn==0.24.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

## 🔒 Segurança

### Recomendações
1. **HTTPS**: Use sempre HTTPS em produção
2. **JWT Tokens**: Implemente refresh tokens
3. **Rate Limiting**: Limite tentativas de login
4. **Validação**: Valide todos os inputs
5. **Logs**: Registre tentativas de login
6. **Criptografia**: Use bcrypt para senhas

### Exemplo de Hash de Senha
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

## 📝 Exemplo de Implementação

### Rota de Consulta de Domínio
```python
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from services.client_service import get_client_by_domain

router = APIRouter()

@router.get("/api/client-database")
async def get_client_database(domain: str, db: Session = Depends(get_db)):
    client = get_client_by_domain(db, domain)
    if not client:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")
    
    return {
        "success": True,
        "clientIp": client.ip_banco,
        "clientName": client.nome_empresa,
        "databaseConfig": {
            "host": client.ip_banco,
            "port": client.porta_banco,
            "database": client.nome_banco,
            "user": client.usuario_banco,
            "password": client.senha_banco
        }
    }
```

### Rota de Login
```python
@router.post("/api/client-login")
async def client_login(
    login_data: dict,
    db: Session = Depends(get_db)
):
    # Conectar ao banco do cliente
    client_db = connect_to_client_database(login_data["databaseConfig"])
    
    # Verificar credenciais
    user = authenticate_user(client_db, login_data["email"], login_data["password"])
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Gerar token JWT
    token = create_access_token(data={"sub": user.email})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "name": user.nome,
            "email": user.email
        },
        "clientInfo": {
            "id": login_data["clientId"],
            "name": login_data["clientName"]
        }
    }
```

## 🧪 Testando a API

### Teste com cURL
```bash
# Consultar domínio
curl "http://localhost:8000/api/client-database?domain=exemplo.com"

# Fazer login
curl -X POST "http://localhost:8000/api/client-login" \
  -H "Content-Type: application/json" \
  -d '{
    "clientIp": "192.168.1.100",
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "databaseConfig": {
      "host": "192.168.1.100",
      "port": 5432,
      "database": "cliente_exemplo",
      "user": "db_user",
      "password": "db_password"
    }
  }'
```

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:
- Documentação do FastAPI: https://fastapi.tiangolo.com/
- Documentação do SQLAlchemy: https://docs.sqlalchemy.org/
- Documentação do PostgreSQL: https://www.postgresql.org/docs/
