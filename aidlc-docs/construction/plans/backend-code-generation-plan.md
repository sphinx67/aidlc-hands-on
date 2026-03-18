# 백엔드 코드 생성 계획

## 유닛 정보
- **유닛명**: backend
- **기술 스택**: Python 3.11+ / FastAPI / SQLAlchemy 2.x / SQLite
- **코드 위치**: `aidlc-hands-on/backend/` (워크스페이스 루트 기준)
- **프로젝트 유형**: Greenfield 멀티 유닛

## 구현 스토리 범위
Unit 1 (Backend)이 담당하는 모든 스토리:
- 관리자 로그인 및 JWT 발급
- 테이블 초기 설정 및 인증
- 메뉴/카테고리 조회
- 주문 생성/조회/상태 변경/삭제
- 테이블 세션 종료 (주문 이력 이동)
- 과거 주문 이력 조회
- SSE 실시간 이벤트 스트림

## 의존성
- Unit 2 (Frontend)가 이 유닛의 REST API를 소비
- 인터페이스: REST API (포트 8000), SSE 엔드포인트

---

## 생성 단계

### Step 1: 프로젝트 구조 설정
- [x] `backend/` 디렉토리 생성
- [x] `backend/requirements.txt` 생성
- [x] `backend/.env.example` 생성
- [x] `backend/config.py` 생성 (Pydantic BaseSettings)
- [x] `backend/database.py` 생성 (SQLAlchemy 엔진/세션)

### Step 2: 도메인 모델 생성 (models/)
- [x] `backend/models/__init__.py` 생성
- [x] `backend/models/store.py` 생성 (Store, Category, Menu)
- [x] `backend/models/table.py` 생성 (Table)
- [x] `backend/models/order.py` 생성 (Order, OrderItem, OrderStatus Enum)
- [x] `backend/models/order_history.py` 생성 (OrderHistory, OrderHistoryItem)

### Step 3: Pydantic 스키마 생성 (schemas/)
- [x] `backend/schemas/__init__.py` 생성
- [x] `backend/schemas/auth.py` 생성 (로그인 요청/응답, 토큰 데이터)
- [x] `backend/schemas/table.py` 생성 (테이블 요청/응답)
- [x] `backend/schemas/menu.py` 생성 (카테고리/메뉴 응답)
- [x] `backend/schemas/order.py` 생성 (주문 생성 요청/응답)
- [x] `backend/schemas/order_history.py` 생성 (이력 응답)

### Step 4: 서비스 레이어 생성 (services/)
- [x] `backend/services/__init__.py` 생성
- [x] `backend/services/sse_service.py` 생성 (SSEService 싱글톤, asyncio.Queue 기반)
- [x] `backend/services/auth_service.py` 생성 (JWT 발급/검증, bcrypt)
- [x] `backend/services/table_service.py` 생성 (테이블 인증, 세션 관리)
- [x] `backend/services/menu_service.py` 생성 (메뉴/카테고리 조회)
- [x] `backend/services/order_service.py` 생성 (주문 CRUD, 상태 전이)
- [x] `backend/services/order_history_service.py` 생성 (이력 이동, 조회)

### Step 5: 의존성 주입 생성
- [x] `backend/dependencies.py` 생성 (get_db, get_current_admin, get_current_table)

### Step 6: 라우터 생성 (routers/)
- [x] `backend/routers/__init__.py` 생성
- [x] `backend/routers/auth.py` 생성 (POST /api/auth/login)
- [x] `backend/routers/tables.py` 생성 (테이블 CRUD, 인증, 세션 종료)
- [x] `backend/routers/menus.py` 생성 (카테고리/메뉴 조회)
- [x] `backend/routers/orders.py` 생성 (주문 생성/조회/상태 변경/삭제)
- [x] `backend/routers/order_history.py` 생성 (이력 조회)
- [x] `backend/routers/sse.py` 생성 (SSE 스트림 엔드포인트)

### Step 7: 앱 진입점 생성
- [x] `backend/main.py` 생성 (FastAPI 앱, CORS, 라우터 등록, startup 이벤트)

### Step 8: 시드 데이터 생성
- [x] `backend/seed.py` 생성

### Step 9: 문서 생성
- [x] `aidlc-docs/construction/backend/code/backend-summary.md` 생성

---

## 최종 디렉토리 구조

```
backend/
├── main.py
├── config.py
├── database.py
├── dependencies.py
├── seed.py
├── requirements.txt
├── .env.example
├── models/
│   ├── __init__.py
│   ├── store.py          # Store, Category, Menu
│   ├── table.py          # Table
│   ├── order.py          # Order, OrderItem, OrderStatus
│   └── order_history.py  # OrderHistory, OrderHistoryItem
├── schemas/
│   ├── __init__.py
│   ├── auth.py
│   ├── table.py
│   ├── menu.py
│   ├── order.py
│   └── order_history.py
├── services/
│   ├── __init__.py
│   ├── sse_service.py
│   ├── auth_service.py
│   ├── table_service.py
│   ├── menu_service.py
│   ├── order_service.py
│   └── order_history_service.py
└── routers/
    ├── __init__.py
    ├── auth.py
    ├── tables.py
    ├── menus.py
    ├── orders.py
    ├── order_history.py
    └── sse.py
```

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/auth/login | 관리자 로그인 | 없음 |
| GET | /api/tables | 테이블 목록 조회 | 관리자 |
| POST | /api/tables | 테이블 생성 | 관리자 |
| POST | /api/tables/{id}/setup | 테이블 초기 설정 (비밀번호) | 관리자 |
| POST | /api/tables/{id}/auth | 테이블 인증 (고객) | 없음 |
| POST | /api/tables/{id}/complete | 세션 종료 (이용 완료) | 관리자 |
| GET | /api/menus/categories | 카테고리 목록 | 없음 |
| GET | /api/menus | 메뉴 목록 | 없음 |
| GET | /api/orders | 주문 목록 (관리자: 전체, 고객: 세션) | 관리자/테이블 |
| POST | /api/orders | 주문 생성 | 테이블 |
| PATCH | /api/orders/{id}/status | 주문 상태 변경 | 관리자 |
| DELETE | /api/orders/{id} | 주문 삭제 | 관리자 |
| GET | /api/order-history | 과거 주문 이력 조회 | 관리자 |
| GET | /api/sse/orders | SSE 실시간 스트림 | 관리자 |
