import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.store import Store
from models.table import Table
from services.auth_service import verify_password, hash_password, create_table_token
from schemas.table import TableAuthResponse


def get_store_or_404(db: Session, store_id: str) -> Store:
    store = db.query(Store).filter(Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="매장을 찾을 수 없습니다")
    return store


def get_tables(db: Session, store: Store) -> list:
    return db.query(Table).filter(Table.store_id == store.id).all()


def create_table(db: Session, store: Store, table_number: int) -> Table:
    existing = db.query(Table).filter(
        Table.store_id == store.id, Table.table_number == table_number
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 테이블 번호입니다")
    table = Table(store_id=store.id, table_number=table_number)
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


def setup_table_password(db: Session, store: Store, table_id: int, password: str) -> Table:
    table = db.query(Table).filter(Table.id == table_id, Table.store_id == store.id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="테이블을 찾을 수 없습니다")
    table.password_hash = hash_password(password)
    db.commit()
    db.refresh(table)
    return table


def authenticate_table(db: Session, store_id: str, table_number: int, password: str) -> TableAuthResponse:
    store = get_store_or_404(db, store_id)
    table = db.query(Table).filter(
        Table.store_id == store.id, Table.table_number == table_number
    ).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if not table.password_hash:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="테이블 비밀번호가 설정되지 않았습니다")
    if not verify_password(password, table.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # 세션 유지 또는 신규 생성
    if not table.current_session_id:
        table.current_session_id = str(uuid.uuid4())
        db.commit()
        db.refresh(table)

    token = create_table_token(table.id, store_id, table.current_session_id)
    return TableAuthResponse(
        access_token=token,
        table_id=table.id,
        table_number=table.table_number,
        session_id=table.current_session_id,
    )


def complete_session(db: Session, store: Store, table_id: int) -> Table:
    table = db.query(Table).filter(Table.id == table_id, Table.store_id == store.id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="테이블을 찾을 수 없습니다")
    if not table.current_session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="활성 세션이 없습니다")
    return table
