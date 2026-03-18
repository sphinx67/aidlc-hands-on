from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import SessionLocal
from services.auth_service import decode_admin_token, decode_table_token
from schemas.auth import AdminTokenData, TableTokenData

bearer_scheme = HTTPBearer()


def get_db():
    """요청당 DB 세션 제공, 완료 후 자동 닫힘"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> AdminTokenData:
    """관리자 JWT 검증 및 토큰 데이터 반환"""
    return decode_admin_token(credentials.credentials)


def get_current_table(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TableTokenData:
    """테이블 JWT 검증 및 토큰 데이터 반환"""
    return decode_table_token(credentials.credentials)
