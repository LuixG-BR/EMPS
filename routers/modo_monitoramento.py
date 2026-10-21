from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import conectar
from core.permissions import somente_paciente

from schemas.modo_monitoramento import (
    ModoMonitoramentoUpdate,
    ModoMonitoramentoResponse
)

from controllers.modo_monitoramento import (buscar_modo, atualizar_modo)


router = APIRouter(
    prefix="/pacientes/me/modo-monitoramento",
    tags=["Modo Monitoramento"]
)


@router.get("", response_model=ModoMonitoramentoResponse)
def consultar_modo(
    db: Session = Depends(conectar),
    id_usuario: int = Depends(somente_paciente)
):
    return buscar_modo(
        db,
        id_usuario
    )

@router.patch("", response_model=ModoMonitoramentoResponse)
def alterar_modo(
    dados: ModoMonitoramentoUpdate,
    db: Session = Depends(conectar),
    id_usuario: int = Depends(somente_paciente)
):
    return atualizar_modo(
        db,
        id_usuario,
        dados.modo.value
    )
