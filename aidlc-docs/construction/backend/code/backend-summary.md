# 백엔드 코드 생성 요약

## 생성된 파일 목록

### 설정/진입점
- `backend/main.py` - FastAPI 앱, CORS, 라우터 등록
- `backend/config.py` - Pydantic BaseSettings 환경 변수 관리
- `backend/database.py` - SQLAlchemy 엔진/세션 팩토리
- `backend/dependencies.py` - get_db, get_current_admin, get_current_table
- `backend/requirements.txt` - 의존성 패키지
- `backend/.env.example` - 환경 변수 예시

### 도메인 모델 (models/)
- `models/store.py` - Store, Category, Menu
- `models/table.py` - Table
- `models/order.py` - Order, OrderItem, OrderStatus
- `models/order_history.py` - OrderHistory, OrderHistoryItem

### Pydantic 스키마 (schemas/)
- `schemas/auth.py` - 로그인 요청/응답, 토큰 데이터
- `schemas/table.py` - 테이블 요청/응답
- `schemas/menu.py` - 카테고리/메뉴 응답
- `schemas/order.py` - 주문 생성/응답
- `schemas/order_history.py` - 이력 응답

### 서비스 레이어 (services/)
- `services/sse_service.py` - SSEService 싱글톤 (asyncio.Queue)
- `services/auth_service.py` - JWT 발급/검증, bcrypt
- `services/table_service.py` - 테이블 인증, 세션 관리
- `services/menu_service.py` - 메뉴/카테고리 조회
- `services/order_service.py` - 주문 CRUD, 상태 전이
- `services/order_history_service.py` - 이력 이동/조회

### 라우터 (routers/)
- `routers/auth.py` - POST /api/auth/login
- `routers/tables.py` - 테이블 CRUD, 인증, 세션 종료
- `routers/menus.py` - 카테고리/메뉴 조회
- `routers/orders.py` - 주문 생성/조회/상태 변경/삭제
- `routers/order_history.py` - 이력 조회
- `routers/sse.py` - SSE 스트림

### 기타
- `backend/seed.py` - 초기 데이터 시드

## 실행 방법

```bash
cd backend

# 1. 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env의 SECRET_KEY를 안전한 값으로 변경

# 4. 시드 데이터 삽입
python seed.py

# 5. 서버 실행
uvicorn main:app --reload --port 8000
```

## API 문서
서버 실행 후 http://localhost:8000/docs 에서 Swagger UI 확인 가능
