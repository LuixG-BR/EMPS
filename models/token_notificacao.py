from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class TokenNotificacao(Base):
    __tablename__ = "token_notificacao"

    id_token = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    expo_push_token = Column(
        Text,
        nullable=False,
        unique=True
    )

    data_criacao = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    data_atualizacao = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    ativo = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true"
    )
