
from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.paciente import Paciente


def buscar_modo(db: Session, id_usuario: int):
    paciente = db.query(Paciente).filter(
        Paciente.id_usuario == id_usuario
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente nao encontrado."
        )

    return {
        "id_paciente": paciente.id_paciente,
        "modo": paciente.modo_monitoramento
    }


def atualizar_modo(
    db: Session,
    id_usuario: int,
    modo: str
):
    paciente = db.query(Paciente).filter(
        Paciente.id_usuario == id_usuario
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente nao encontrado."
        )

    paciente.modo_monitoramento = modo

    db.commit()
    db.refresh(paciente)

    return {
        "id_paciente": paciente.id_paciente,
        "modo": paciente.modo_monitoramento
    }
