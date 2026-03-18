# NFR 설계 패턴 - 백엔드

## 보안 패턴

### 패턴 1: JWT 이중 토큰 전략
**적용 NFR**: NFR-SEC-02

관리자와 테이블 인증을 동일한 JWT 구조로 처리하되 `type` 클레임으로 구분합니다.

```python
# 관리자 토큰 페이로드
{"sub": "store_id:admin_username", "type": "admin", "exp": ...}

# 테이블 토큰 페이로드
{"sub": "table_id", "type": "table", "store_id": "...", "session_id": "...", "exp": ...}
```

FastAPI Depends로 엔드포인트별 토큰 타입 검증:
```python
# 관리자 전용
async def get_current_admin(token: str = Depends(oauth2_scheme)) -> AdminTokenData

# 테이블 전용
async def get_current_table(token: str = Depends(oauth2_scheme)) -> TableTokenData
```

---

### 패턴 2: 비밀번호 해싱 (단방향 암호화)
**적용 NFR**: NFR-SEC-01

```python
# passlib CryptContext 싱글톤
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

---

### 패턴 3: 응답 스키마 분리 (민감 정보 노출 방지)
**적용 NFR**: NFR-SEC-04

DB 모델과 응답 스키마를 분리하여 password_hash 등 민감 필드가 응답에 포함되지 않도록 합니다.

```python
# DB 모델: password_hash 필드 존재
class Store(Base):
    admin_password_hash: str

# 응답 스키마: password_hash 제외
class StoreResponse(BaseModel):
    id: int
    store_id: str
    name: str
    # admin_password_hash 없음
```

---

## 성능 패턴

### 패턴 4: 비동기 SSE (Async Generator 패턴)
**적용 NFR**: NFR-PERF-01

`asyncio.Queue` 기반으로 이벤트를 즉시 전달합니다. 폴링 없이 push 방식으로 2초 이내 전달을 보장합니다.

```python
class SSEService:
    def __init__(self):
        # store_id → List[asyncio.Queue]
        self._connections: dict[str, list[asyncio.Queue]] = {}

    async def broadcast(self, store_id: str, event: dict):
        if store_id in self._connections:
            for queue in self._connections[store_id]:
                await queue.put(event)  # 즉시 push

    async def event_generator(self, store_id: str):
        queue = asyncio.Queue()
        self._add_connection(store_id, queue)
        try:
            # 초기 데이터 전송
            yield f"data: {json.dumps({'type': 'connected'})}\n\n"
            while True:
                event = await queue.get()  # 이벤트 대기
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self._remove_connection(store_id, queue)
```

---

### 패턴 5: Eager Loading (N+1 쿼리 방지)
**적용 NFR**: NFR-PERF-02

주문 목록 조회 시 OrderItem을 함께 로드하여 N+1 쿼리를 방지합니다.

```python
# N+1 발생 (나쁜 예)
orders = db.query(Order).all()
for order in orders:
    items = order.items  # 각 주문마다 추가 쿼리 발생

# Eager Loading (좋은 예)
orders = db.query(Order)\
    .options(joinedload(Order.items))\
    .filter(Order.table_id == table_id)\
    .all()
```

---

## 데이터 무결성 패턴

### 패턴 6: Unit of Work (트랜잭션 패턴)
**적용 NFR**: NFR-DATA-01

세션 종료 처리는 단일 트랜잭션으로 묶어 원자성을 보장합니다.

```python
async def complete_session(self, db: Session, table_id: int):
    try:
        # 1. OrderHistory 생성
        # 2. OrderHistoryItem 생성
        # 3. OrderItem 삭제
        # 4. Order 삭제
        # 5. Table.current_session_id = null
        db.commit()  # 모두 성공 시 커밋
    except Exception:
        db.rollback()  # 하나라도 실패 시 전체 롤백
        raise
```

---

## 유지보수성 패턴

### 패턴 7: 환경 변수 설정 (Settings 패턴)
**적용 NFR**: NFR-MAINT-01

Pydantic BaseSettings로 환경 변수를 타입 안전하게 관리합니다.

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str
    allowed_origins: list[str] = ["http://localhost:3000"]
    database_url: str = "sqlite:///./table_order.db"
    access_token_expire_hours: int = 16
    table_token_expire_hours: int = 24

    class Config:
        env_file = ".env"

settings = Settings()  # 싱글톤
```

---

### 패턴 8: 의존성 주입 (Dependency Injection)
**적용 NFR**: NFR-MAINT-01

FastAPI Depends를 활용해 DB 세션과 인증을 레이어 간 결합 없이 주입합니다.

```python
# 라우터에서 사용
@router.post("/orders")
async def create_order(
    request: OrderCreateRequest,
    db: Session = Depends(get_db),              # DB 세션 주입
    table: TableTokenData = Depends(get_current_table)  # 인증 주입
):
    return order_service.create_order(db, table.table_id, ...)
```
