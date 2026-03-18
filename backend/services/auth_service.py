from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from config import settings
from schemas.auth import AdminTokenData, TableTokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_admin_token(store_id: str, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.access_token_expire_hours)
    payload = {
        "sub": f"{store_id}:{username}",
        "type": "admin",
        "store_id": store_id,
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_table_token(table_id: int, store_id: str, session_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.table_token_expire_hours)
    payload = {
        "sub": str(table_id),
        "type": "table",
        "table_id": table_id,
        "store_id": store_id,
        "session_id": session_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_admin_token(token: str) -> AdminTokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        return AdminTokenData(
            store_id=payload["store_id"],
            username=payload["username"],
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


def decode_table_token(token: str) -> TableTokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != "table":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        return TableTokenData(
            table_id=payload["table_id"],
            store_id=payload["store_id"],
            session_id=payload["session_id"],
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
