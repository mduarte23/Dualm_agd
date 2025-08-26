from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(
    title="Dualm API",
    description="API para o projeto Dualm",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bem-vindo à API Dualm!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "dualm-api"}

@app.get("/api/v1/items")
async def get_items():
    """Endpoint de exemplo para listar itens"""
    return {
        "items": [
            {"id": 1, "name": "Item 1", "description": "Descrição do item 1"},
            {"id": 2, "name": "Item 2", "description": "Descrição do item 2"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
