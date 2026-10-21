
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session

from database import conectar
from core.security import verificar_token

from schemas.modo_monitoramento import (
    ModoMonitoramentoUpdate,
    ModoMonitoramentoResponse
)

from controllers.modo_monitoramento import (buscar_modo, atualizar_modo)


router = APIRouter(
    prefix="/pacientes/me/modo-monitoramento",
    tags=["Modo Monitoramento"]
)


def obter_paciente_autenticado(
    usuario=Depends(verificar_token)
):
    id_usuario = usuario.get("sub")
    perfil = usuario.get("perfil")

    if id_usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Token sem identificação do usuário."
        )

    if str(perfil) != "2":
        raise HTTPException(
            status_code=403,
            detail="Acesso exclusivo para pacientes."
        )

    try:
        return int(id_usuario)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Identificação inválida no token."
        )


@router.get("", response_model=ModoMonitoramentoResponse)
def consultar_modo(
    db: Session = Depends(conectar),
    id_usuario: int = Depends(
        obter_paciente_autenticado
    )
):
    return buscar_modo(
        db,
        id_usuario
    )


@router.patch("", response_model=ModoMonitoramentoResponse)
def alterar_modo(
    dados: ModoMonitoramentoUpdate,
    db: Session = Depends(conectar),
    id_usuario: int = Depends(
        obter_paciente_autenticado
    )
):
    return atualizar_modo(
        db,
        id_usuario,
        dados.modo.value
    )
