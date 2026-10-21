from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.monitoramento import Monitoramento
from models.paciente import Paciente
from schemas.monitoramento import MonitoramentoCreate


# LIMITES EXPERIMENTAIS DO MPU6050

LIMITE_MOVIMENTO_ALERTA = 3.0
LIMITE_MOVIMENTO_INTENSO = 7.0
LIMITE_MOVIMENTO_MUITO_INTENSO = 10.0


def analisar_risco(bpm, movimento):

    if bpm >= 150 and movimento >= 10:
        return "Emergencia em BPM | Emergencia em Movimento"

    elif bpm >= 150:
        return "Emergencia em BPM"

    elif movimento >= 10:
        return "Emergencia em Movimento"

    elif movimento >= LIMITE_MOVIMENTO_INTENSO:
        return "Movimento Intenso"

    elif bpm >= 120 and movimento >= LIMITE_MOVIMENTO_ALERTA:
        return "Alerta em BPM | Alerta em Movimento"

    elif bpm >= 120:
        return "Alerta em BPM"

    elif movimento >= LIMITE_MOVIMENTO_ALERTA:
        return "Alerta em Movimento"

    return "Normal"


# MODO SPORT - IMPLEMENTACAO INICIAL SEGURA
def analisar_risco_sport(bpm, movimento):

    # Inicialmente preservamos a regra normal.
    # As tolerancias para atividade fisica ainda
    # precisam ser testadas e validadas.
    return analisar_risco(bpm, movimento)


def selecionar_analise(bpm, movimento, modo):

    if modo == "sport":
        return analisar_risco_sport(bpm, movimento)

    return analisar_risco(bpm, movimento)

def registrar_monitoramento(
    db: Session,
    dados: MonitoramentoCreate
):
    paciente = db.query(Paciente).filter(
        Paciente.id_paciente == dados.id_paciente
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente nao encontrado."
        )

    modo = paciente.modo_monitoramento

    status = selecionar_analise(
        dados.frequencia_cardiaca,
        dados.movimento,
        modo
    )

    print(
        "Analise:",
        "Paciente =", dados.id_paciente,
        "| Modo =", modo,
        "| BPM =", dados.frequencia_cardiaca,
        "| Movimento =", dados.movimento,
        "| Status =", status
    )

    if status == "Normal":
        return {
            "mensagem": "Dados normais",
            "status": status,
            "modo_monitoramento": modo
        }

    novo = Monitoramento(
        id_paciente=dados.id_paciente,
        id_dispositivo=dados.id_dispositivo,
        frequencia_cardiaca=dados.frequencia_cardiaca,
        movimento=dados.movimento,
        status=status,
        modo_monitoramento=modo
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


def listar_monitoramentos_paciente(
    db: Session,
    id_paciente: int
):
    return db.query(
        Monitoramento
    ).filter(
        Monitoramento.id_paciente == id_paciente
    ).all()