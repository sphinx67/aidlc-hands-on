from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    secret_key: str = "dev-secret-key-change-in-production"
    allowed_origins: List[str] = ["http://localhost:3000"]
    database_url: str = "sqlite:///./table_order.db"
    access_token_expire_hours: int = 16
    table_token_expire_hours: int = 24

    class Config:
        env_file = ".env"


settings = Settings()
