from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db
from models.store import Store
from services.auth_service import verify_password, create_admin_token
from schemas.auth import AdminLoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.store_id == request.store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if store.admin_username != request.username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if not verify_password(request.password, store.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = create_admin_token(request.store_id, request.username)
    return TokenResponse(access_token=token)
