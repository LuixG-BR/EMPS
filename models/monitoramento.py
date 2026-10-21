from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Monitoramento(Base):

    __tablename__ = "monitoramento"


    id_monitoramento = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_paciente = Column(
        Integer,
        ForeignKey(
            "paciente.id_paciente"
        )
    )

    id_dispositivo = Column(
        Integer,
        ForeignKey(
            "dispositivo_wearable.id_dispositivo"
        )
    )

    data_hora = Column(
        DateTime,
        default=func.now()
    )

    frequencia_cardiaca = Column(
        Integer
    )

    movimento = Column(
        Integer
    )

    status = Column(
        String(50)
    )

    modo_monitoramento = Column(
        String(20),
        nullable=False,
        default="normal",
        server_default="normal"
    )
