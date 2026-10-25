from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from database import Base, engine

import models
from routers import usuario
from routers import paciente
from routers import medico
from routers import paciente_medico
from routers import dispositivo
from routers import monitoramento
from routers import medicamento
from routers import relatorio
from routers import modo_monitoramento
from routers import token_notificacao
from routers import login


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EMPS API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario.router)
app.include_router(paciente.router)
app.include_router(medico.router)
app.include_router(paciente_medico.router)
app.include_router(dispositivo.router)
app.include_router(monitoramento.router)
app.include_router(medicamento.router)
app.include_router(relatorio.router)
app.include_router(modo_monitoramento.router)
app.include_router(token_notificacao.router)
app.include_router(login.router)

@app.get("/")
def Home():
    return {
        "Mensagem": "Backend EMPS",
        "Status": "Online"
    }

