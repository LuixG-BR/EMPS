from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import verificar_token
from database import conectar

from models.usuario import Usuario
from models.paciente import Paciente


def usuario_ativo(
    usuario_token = Depends(verificar_token),
    db: Session = Depends(conectar)
):

    id_usuario = int(usuario_token["sub"])

    usuario = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == id_usuario
        )
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado."
        )

    if usuario.status is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado."
        )

    return usuario_token


def usuario_autenticado(
    usuario_token = Depends(usuario_ativo)
):
    return usuario_token


def somente_administrador(
    usuario_token = Depends(usuario_ativo)
):

    id_perfil = usuario_token.get("perfil")

    if id_perfil != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para administradores."
        )

    return usuario_token


def administrador_ou_medico(
    usuario_token = Depends(usuario_ativo)
):

    id_perfil = usuario_token.get("perfil")

    if id_perfil not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para administradores ou médicos."
        )

    return usuario_token


def paciente_proprio_ou_admin_medico(
    id_paciente: int,
    usuario_token = Depends(usuario_ativo),
    db: Session = Depends(conectar)
):

    id_usuario = int(usuario_token["sub"])
    id_perfil = usuario_token.get("perfil")

    # administrador ou médico
    if id_perfil in [1, 2]:
        return usuario_token

    # paciente
    if id_perfil == 3:

        paciente = (
            db.query(Paciente)
            .filter(
                Paciente.id_paciente == id_paciente
            )
            .first()
        )

        if not paciente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente não encontrado."
            )

        if paciente.id_usuario != id_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você só pode acessar os seus próprios dados."
            )

        return usuario_token

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Acesso não permitido."
    )


def somente_paciente(
    usuario_token=Depends(usuario_ativo)
):
    id_perfil = usuario_token.get("perfil")

    if str(id_perfil) != "3":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para pacientes."
        )

    try:
        id_usuario = int(usuario_token["sub"])
    except (KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificação inválida no token."
        )

    return id_usuario
