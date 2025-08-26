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
├── App.js         # Componente principal com roteamento
├── index.js       # Ponto de entrada
└── index.css      # Estilos globais
```

## 🛠️ Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação
```bash
# Navegar para a pasta do projeto
cd site

# Instalar dependências
npm install

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

### Campos de Login
- **Domínio**: Campo de texto para o domínio da empresa/organização
- **E-mail**: Campo de email para autenticação
- **Senha**: Campo de senha com validação

### Fluxo de Autenticação
1. Usuário preenche o formulário de login
2. Validação dos campos obrigatórios
3. Simulação de requisição para API (configurável)
4. Redirecionamento para Dashboard após sucesso
5. Header com navegação e botão de logout

## 📱 PWA

O projeto está configurado como uma Progressive Web App (PWA) com:
- Manifest para instalação
- Service Worker para cache offline
- Ícones responsivos

## 🔧 Configuração

### Proxy para API
O projeto está configurado para fazer proxy das requisições para `http://localhost:8000` (backend Python).

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto para configurações específicas:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## 🚀 Próximos Passos

Para integrar com uma API real:
1. Substituir a simulação de login em `Home.js`
2. Implementar gerenciamento de estado (Context API ou Redux)
3. Adicionar proteção de rotas para usuários não autenticados
4. Implementar refresh tokens e persistência de sessão

## 📝 Licença

Este projeto faz parte do Dualm e está sob licença proprietária.
