from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Paciente(Base):

    __tablename__ = "paciente"


    id_paciente = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        unique=True
    )

    cpf = Column(
        String(14)
    )

    cns = Column(
        String(20)
    )

    data_nascimento = Column(
        Date
    )

    sexo = Column(
        String(20)
    )

    endereco = Column(
        String(255)
    )

    contato_emergencia = Column(
        String(20)
    )

    tipo_sanguineo = Column(
        String(5)
    )

    modo_monitoramento = Column(
        String(20),
        nullable=False,
        default="normal",
        server_default="normal"
    )

    usuario = relationship(
        "Usuario"
    )