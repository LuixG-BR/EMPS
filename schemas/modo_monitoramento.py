from enum import Enum
from pydantic import BaseModel

class ModoMonitoramento(str, Enum):
    NORMAL = "normal"
    SPORT = "sport"

class ModoMonitoramentoUpdate(BaseModel):
    modo: ModoMonitoramento

class ModoMonitoramentoResponse(BaseModel):
    id_paciente: int
    modo: ModoMonitoramento
