from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.monitoramento import Monitoramento
from models.paciente import Paciente
from schemas.monitoramento import MonitoramentoCreate


# LIMITES EXPERIMENTAIS DO MPU6050
NORMAL_BPM_ALERTA = 120
NORMAL_BPM_EMERGENCIA = 150

NORMAL_MOV_ALERTA = 3.0
NORMAL_MOV_INTENSO = 7.0
NORMAL_MOV_EMERGENCIA = 10.00

# LIMITES - MODO SPORT
SPORT_BPM_ALERTA = 140
SPORT_BPM_EMERGENCIA = 170

SPORT_MOV_ALERTA = 5.0
SPORT_MOV_INTENSO = 9.0
SPORT_MOV_EMERGENCIA = 12.0


def analisar_risco_normal(bpm, movimento):

    if bpm >= NORMAL_BPM_EMERGENCIA and movimento >= NORMAL_MOV_EMERGENCIA:
        return "Emergencia em BPM | Emergencia em Movimento"

    elif bpm >= NORMAL_BPM_EMERGENCIA:
        return "Emergencia em BPM"

    elif movimento >= NORMAL_MOV_EMERGENCIA:
        return "Emergencia em Movimento"

    elif movimento >= NORMAL_MOV_INTENSO:
        return "Movimento Intenso"

    elif bpm >= NORMAL_BPM_ALERTA and movimento >= NORMAL_MOV_ALERTA:
        return "Alerta em BPM | Alerta em Movimento"

    elif bpm >= NORMAL_BPM_ALERTA:
        return "Alerta em BPM"

    elif movimento >= NORMAL_MOV_ALERTA:
        return "Alerta em Movimento"

    return "Normal"


def analisar_risco_sport(bpm, movimento):

    if bpm >= SPORT_BPM_EMERGENCIA and movimento >= SPORT_MOV_EMERGENCIA:
        return "Emergencia em BPM | Emergencia em Movimento"

    elif bpm >= SPORT_BPM_EMERGENCIA:
        return "Emergencia em BPM"

    elif movimento >= SPORT_MOV_EMERGENCIA:
        return "Emergencia em Movimento"

    elif movimento >= SPORT_MOV_INTENSO:
        return "Movimento Intenso"

    elif bpm >= SPORT_BPM_ALERTA and movimento >= SPORT_MOV_ALERTA:
        return "Alerta em BPM | Alerta em Movimento"

    elif bpm >= SPORT_BPM_ALERTA:
        return "Alerta em BPM"

    elif movimento >= SPORT_MOV_ALERTA:
        return "Alerta em Movimento"

    return "Normal"


def selecionar_regra(bpm, movimento, modo):

    if modo == "normal":
        return analisar_risco_normal(bpm, movimento)

    elif modo == "sport":
        return analisar_risco_sport(bpm, movimento)

    raise ValueError(
        "Modo de monitoramento invalido."
    )
    

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

    if modo not in ("normal", "sport"):
        raise HTTPException(
            status_code=422,
            detail="Modo de monitoramento invalido."
        )

    bpm = dados.frequencia_cardiaca
    movimento = dados.movimento

    status = selecionar_regra(bpm, movimento, modo)

    if status == "Normal":
        return {
            "mensagem": "Dados normais",
            "status": status,
            "modo_monitoramento": modo
        }

    novo = Monitoramento(
        id_paciente=dados.id_paciente,
        id_dispositivo=dados.id_dispositivo,
        frequencia_cardiaca=bpm,
        movimento=movimento,
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