# Dualm API

API backend para o projeto Dualm desenvolvida em Python com FastAPI.

## Instalação

1. Crie um ambiente virtual:
```bash
python -m venv venv
```

2. Ative o ambiente virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Executando a API

```bash
python main.py
```

A API estará disponível em: http://localhost:8000

## Documentação da API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /` - Página inicial
- `GET /health` - Verificação de saúde da API
- `GET /api/v1/items` - Lista de itens (exemplo)

## Estrutura do Projeto

```
apis/
├── main.py              # Arquivo principal da aplicação
├── requirements.txt     # Dependências Python
└── README.md           # Este arquivo
```
