from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import func

from database import conectar
from core.permissions import somente_paciente
from models.token_notificacao import TokenNotificacao
from schemas.token_notificacao import (TokenNotificacaoCreate, TokenNotificacaoResponse)

router = APIRouter(
    prefix="/notificacoes",
    tags=["Notificações"]
)


@router.post("/token", response_model=TokenNotificacaoResponse)
def registrar_token(
    dados: TokenNotificacaoCreate,
    id_usuario: int = Depends(somente_paciente),
    db: Session = Depends(conectar)
):
    token = (
        db.query(TokenNotificacao)
        .filter(
            TokenNotificacao.expo_push_token == dados.expo_push_token
        )
        .first()
    )

    try:
        if token:
            token.id_usuario = id_usuario
            token.ativo = True
            token.data_atualizacao = func.now()
        else:
            token = TokenNotificacao(
                id_usuario=id_usuario,
                expo_push_token=dados.expo_push_token,
                ativo=True
            )
            db.add(token)

        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Não foi possível registrar o token."
        )

    return {
        "mensagem": "Token registrado com sucesso.",
        "ativo": True
    }


@router.delete("/token", response_model=TokenNotificacaoResponse)
def desativar_token(
    dados: TokenNotificacaoCreate,
    id_usuario: int = Depends(somente_paciente),
    db: Session = Depends(conectar)
):
    token = (
        db.query(TokenNotificacao)
        .filter(
            TokenNotificacao.expo_push_token
            == dados.expo_push_token,
            TokenNotificacao.id_usuario == id_usuario
        )
        .first()
    )

    if not token:
        raise HTTPException(
            status_code=404,
            detail="Token não encontrado para este usuário."
        )

    token.ativo = False
    token.data_atualizacao = func.now()

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Não foi possível desativar o token."
        )

    return {
        "mensagem": "Token desativado com sucesso.",
        "ativo": False
    }