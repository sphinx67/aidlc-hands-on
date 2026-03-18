# 논리 컴포넌트 - 백엔드

## 컴포넌트 구성도

```
[FastAPI App (main.py)]
        |
        +-- CORSMiddleware          # CORS 처리
        +-- AuthRouter             # /api/auth
        +-- TableRouter            # /api/tables
        +-- MenuRouter             # /api/menus
        +-- OrderRouter            # /api/orders
        +-- OrderHistoryRouter     # /api/order-history
        +-- SSERouter              # /api/sse
        |
        v
[의존성 주입 레이어 (dependencies.py)]
        |
        +-- get_db()               # SQLAlchemy Session
        +-- get_current_admin()    # JWT 관리자 검증
        +-- get_current_table()    # JWT 테이블 검증
        |
        v
[서비스 레이어]
        |
        +-- AuthService            # 인증/토큰 (싱글톤)
        +-- TableService           # 테이블 관리
        +-- MenuService            # 메뉴 조회
        +-- OrderService           # 주문 처리
        +-- OrderHistoryService    # 이력 관리
        +-- SSEService             # 실시간 이벤트 (싱글톤)
        |
        v
[데이터 레이어]
        |
        +-- SQLAlchemy Engine      # DB 연결 (database.py)
        +-- SQLite File            # table_order.db
```

---

## 싱글톤 컴포넌트

### SSEService (싱글톤)
- 앱 시작 시 1개 인스턴스 생성
- 모든 라우터에서 동일 인스턴스 공유
- store_id별 Queue 목록 관리
- 이유: 연결 상태를 앱 전체에서 공유해야 함

```python
# main.py
sse_service = SSEService()  # 앱 시작 시 생성

# 라우터에서 주입
@router.get("/sse/orders")
async def sse_orders(sse: SSEService = Depends(lambda: sse_service)):
    ...
```

### Settings (싱글톤)
- 앱 시작 시 `.env` 파일 로드
- 모든 모듈에서 `from config import settings`로 접근

---

## DB 세션 관리

```python
# database.py
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# dependencies.py
def get_db():
    db = SessionLocal()
    try:
        yield db      # 요청 처리 중 세션 제공
    finally:
        db.close()    # 요청 완료 후 세션 닫기
```

- `check_same_thread=False`: FastAPI 비동기 환경에서 SQLite 사용 시 필요
- 요청당 1개 세션, 요청 완료 시 자동 닫힘

---

## 에러 처리 컴포넌트

FastAPI 전역 예외 핸들러로 일관된 에러 응답 형식 제공:

```python
# main.py
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
```

서비스 레이어에서 발생하는 예외:
- `HTTPException(404)`: 리소스 없음
- `HTTPException(401)`: 인증 실패
- `HTTPException(403)`: 권한 없음
- `HTTPException(409)`: 중복 데이터
- `HTTPException(400)`: 잘못된 요청 (비즈니스 규칙 위반)

---

## 앱 시작 시퀀스

```python
# main.py
app = FastAPI(title="테이블오더 API")

# 1. CORS 미들웨어 등록
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, ...)

# 2. DB 테이블 자동 생성
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

# 3. 라우터 등록
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(table_router, prefix="/api/tables", tags=["tables"])
app.include_router(menu_router, prefix="/api/menus", tags=["menus"])
app.include_router(order_router, prefix="/api/orders", tags=["orders"])
app.include_router(order_history_router, prefix="/api/order-history", tags=["order-history"])
app.include_router(sse_router, prefix="/api/sse", tags=["sse"])
```
