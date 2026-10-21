from pydantic import BaseModel


class MonitoramentoCreate(BaseModel):

    id_paciente: int
    id_dispositivo: int
    frequencia_cardiaca: int
    movimento: float
    status: str


class MonitoramentoResponse(BaseModel):

    id_monitoramento: int
    id_paciente: int
    id_dispositivo: int
    frequencia_cardiaca: int
    movimento: float
    status: str
    modo_monitoramento: str

    class Config:
        from_attributes = True