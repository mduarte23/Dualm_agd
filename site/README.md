# Dualm Site - React

Este é o frontend do projeto Dualm, desenvolvido com React e tecnologias modernas.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal para interface
- **React Router DOM** - Roteamento da aplicação
- **Styled Components** - Estilização componentizada
- **Axios** - Cliente HTTP para APIs

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   └── Header.js  # Cabeçalho da aplicação (não aparece na página de login)
├── pages/         # Páginas da aplicação
│   ├── Home.js    # Página de login (rota raiz)
│   ├── Dashboard.js # Dashboard principal após login
│   ├── About.js   # Página sobre
│   └── Contact.js # Página de contato
├── services/      # Serviços da aplicação
│   └── authService.js # Serviço de autenticação
├── App.js         # Componente principal com roteamento
├── index.js       # Ponto de entrada
└── index.css      # Estilos globais
```

## 🛠️ Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Backend Python rodando em http://localhost:8000

### Instalação
```bash
# Navegar para a pasta do projeto
cd site

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar em modo de desenvolvimento
npm start
```

### Scripts Disponíveis
- `npm start` - Executa a aplicação em modo de desenvolvimento
- `npm build` - Cria a versão de produção
- `npm test` - Executa os testes
- `npm eject` - Ejetar configurações do Create React App

## 🌐 Acessos

- **Login**: http://localhost:3000 (página inicial)
- **Dashboard**: http://localhost:3000/dashboard (após login)
- **Sobre**: http://localhost:3000/about
- **Contato**: http://localhost:3000/contact
- **API Backend**: http://localhost:8000 (configurado como proxy)

## 🎨 Características

- **Página de Login** - Formulário de login com domínio, email e senha
- **Dashboard** - Painel principal após autenticação
- **Design Responsivo** - Funciona em todos os dispositivos
- **Navegação SPA** - Single Page Application com React Router
- **Estilização Moderna** - Utilizando Styled Components
- **Formulários Interativos** - Validação e feedback visual
- **Performance Otimizada** - Lazy loading e otimizações React

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Consulta de Domínio**: O sistema consulta a tabela `empresas_clientes` para obter o IP do banco
2. **Conexão com Cliente**: Conecta no banco de dados do cliente usando as credenciais da tabela
3. **Validação de Usuário**: Verifica email e senha na tabela de usuários do cliente
4. **Geração de Token**: Cria um JWT token para sessão
5. **Redirecionamento**: Envia o usuário para o Dashboard

### Campos de Login
- **Domínio**: Campo de texto para o domínio da empresa/organização
- **E-mail**: Campo de email para autenticação
- **Senha**: Campo de senha com validação

### APIs Necessárias
O backend Python precisa implementar:

#### 1. Consulta de Domínio
```
GET /api/client-database?domain=exemplo.com
```

#### 2. Login no Banco do Cliente
```
POST /api/client-login
{
  "clientIp": "192.168.1.100",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "databaseConfig": {...}
}
```

## 🗄️ Banco de Dados

### Tabela `empresas_clientes`
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

### Tabela de Usuários do Cliente
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

## 📱 PWA

O projeto está configurado como uma Progressive Web App (PWA) com:
- Manifest para instalação
- Service Worker para cache offline
- Ícones responsivos

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
REACT_APP_API_TIMEOUT=30000
REACT_APP_DEBUG=true
```

### Proxy para API
O projeto está configurado para fazer proxy das requisições para `http://localhost:8000` (backend Python).

## 🚀 Implementação do Backend

### Dependências Python
```txt
fastapi==0.104.1
uvicorn==0.24.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

### Estrutura Recomendada
```
apis/
├── main.py              # FastAPI app principal
├── database/
│   ├── connection.py    # Conexão com PostgreSQL
│   └── models.py        # Modelos SQLAlchemy
├── services/
│   ├── auth_service.py  # Lógica de autenticação
│   └── client_service.py # Lógica de consulta de clientes
└── routes/
    └── auth.py          # Rotas de autenticação
```

## 📋 Especificação Completa da API

Para detalhes completos da implementação, consulte o arquivo `API_SPECIFICATION.md` que contém:
- Endpoints detalhados
- Exemplos de requisição/resposta
- Código de exemplo em Python
- Recomendações de segurança

## 🧪 Testando

### Teste de Login
1. Acesse http://localhost:3000
2. Digite um domínio válido (ex: exemplo.com)
3. Digite email e senha de um usuário existente
4. Verifique se é redirecionado para o Dashboard

### Teste com cURL
```bash
# Consultar domínio
curl "http://localhost:8000/api/client-database?domain=exemplo.com"

# Fazer login
curl -X POST "http://localhost:8000/api/client-login" \
  -H "Content-Type: application/json" \
  -d '{"clientIp": "192.168.1.100", "email": "usuario@exemplo.com", "password": "senha123", "databaseConfig": {...}}'
```

## 🔒 Segurança

- **JWT Tokens** para autenticação
- **Hash de senhas** com bcrypt
- **Validação de inputs** em todos os campos
- **Rate limiting** para prevenir ataques de força bruta
- **HTTPS** obrigatório em produção

## 📝 Licença

Este projeto faz parte do Dualm e está sob licença proprietária.
