from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TableCreate(BaseModel):
    table_number: int


class TableSetupRequest(BaseModel):
    password: str


class TableAuthRequest(BaseModel):
    store_id: str
    table_number: int
    password: str


class TableAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    table_id: int
    table_number: int
    session_id: str


class TableResponse(BaseModel):
    id: int
    table_number: int
    current_session_id: Optional[str]
    is_active: bool
    has_password: bool
    created_at: datetime

    class Config:
        from_attributes = True
