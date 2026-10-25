from pydantic import BaseModel, Field


class TokenNotificacaoCreate(BaseModel):
    expo_push_token: str = Field(
        min_length=1,
        max_length=512,
        description="Token push gerado pelo Expo Notifications"
    )


class TokenNotificacaoResponse(BaseModel):
    mensagem: str
    ativo: bool
