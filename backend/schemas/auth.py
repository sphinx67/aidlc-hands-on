from pydantic import BaseModel


class AdminLoginRequest(BaseModel):
    store_id: str
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminTokenData(BaseModel):
    store_id: str
    username: str


class TableTokenData(BaseModel):
    table_id: int
    store_id: str
    session_id: str
