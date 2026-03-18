# 컴포넌트 정의

## 기술 스택 확정
- 백엔드: Python + FastAPI + SQLAlchemy ORM + SQLite
- 프론트엔드: React (TypeScript) + Context API + Tailwind CSS
- API 구조: 리소스별 라우터 (`/api/stores/`, `/api/tables/`, `/api/menus/`, `/api/orders/`, `/api/sse/`)
- CORS: FastAPI CORS 미들웨어

---

## 백엔드 컴포넌트

### 1. 라우터 레이어 (Routers)

#### AuthRouter (`/api/auth`)
- **책임**: 관리자 로그인/로그아웃, JWT 토큰 발급
- **엔드포인트**: POST /login, POST /logout

#### StoreRouter (`/api/stores`)
- **책임**: 매장 정보 조회
- **엔드포인트**: GET /{store_id}

#### TableRouter (`/api/tables`)
- **책임**: 테이블 목록 조회, 테이블 초기 설정, 테이블 인증, 세션 종료
- **엔드포인트**: GET /, POST /{table_id}/setup, POST /{table_id}/auth, POST /{table_id}/complete

#### MenuRouter (`/api/menus`)
- **책임**: 카테고리별 메뉴 목록 조회, 메뉴 상세 조회
- **엔드포인트**: GET /, GET /categories, GET /{menu_id}

#### OrderRouter (`/api/orders`)
- **책임**: 주문 생성, 주문 목록 조회(테이블/세션 기준), 주문 상태 변경, 주문 삭제
- **엔드포인트**: POST /, GET /, PATCH /{order_id}/status, DELETE /{order_id}

#### OrderHistoryRouter (`/api/order-history`)
- **책임**: 과거 주문 이력 조회 (세션 종료된 주문)
- **엔드포인트**: GET /

#### SSERouter (`/api/sse`)
- **책임**: 관리자용 실시간 주문 이벤트 스트림 제공
- **엔드포인트**: GET /orders

---

### 2. 서비스 레이어 (Services)

#### AuthService
- **책임**: JWT 토큰 생성/검증, 비밀번호 bcrypt 해싱/검증, 관리자 인증 처리

#### TableService
- **책임**: 테이블 초기 설정, 테이블 세션 관리, 테이블 인증, 세션 종료 처리

#### MenuService
- **책임**: 메뉴 목록 조회, 카테고리 조회, 메뉴 상세 조회

#### OrderService
- **책임**: 주문 생성, 주문 조회(세션 기준), 주문 상태 변경, 주문 삭제, SSE 이벤트 발행

#### OrderHistoryService
- **책임**: 세션 종료 시 주문 이력 이동, 과거 이력 조회

#### SSEService
- **책임**: SSE 연결 관리, 이벤트 브로드캐스트

---

### 3. 데이터 모델 레이어 (Models)

#### Store (매장)
- **책임**: 매장 정보 저장 (식별자, 이름, 관리자 계정)

#### Table (테이블)
- **책임**: 테이블 정보 저장 (번호, 비밀번호 해시, 현재 세션 ID)

#### Category (카테고리)
- **책임**: 메뉴 카테고리 저장

#### Menu (메뉴)
- **책임**: 메뉴 정보 저장 (이름, 가격, 설명, 이미지 URL, 카테고리, 노출 순서)

#### Order (주문)
- **책임**: 주문 정보 저장 (테이블, 세션 ID, 상태, 총 금액, 주문 시각)

#### OrderItem (주문 항목)
- **책임**: 주문 항목 저장 (주문, 메뉴, 수량, 단가)

#### OrderHistory (과거 주문 이력)
- **책임**: 세션 종료된 주문 이력 저장 (이용 완료 시각 포함)

#### OrderHistoryItem (과거 주문 항목)
- **책임**: 과거 주문 항목 저장

---

### 4. 스키마 레이어 (Schemas / Pydantic)

#### 요청/응답 스키마
- **책임**: API 요청/응답 데이터 검증 및 직렬화 (Pydantic BaseModel 기반)
- 각 리소스별 Request/Response 스키마 정의

---

### 5. 의존성 주입 (Dependencies)

#### get_db
- **책임**: SQLAlchemy DB 세션 제공 (FastAPI Depends)

#### get_current_admin
- **책임**: JWT 토큰 검증 후 현재 관리자 반환 (관리자 전용 엔드포인트 보호)

#### get_current_table
- **책임**: 테이블 토큰 검증 후 현재 테이블 반환 (고객 전용 엔드포인트 보호)

---

## 프론트엔드 컴포넌트

### 1. 라우팅 구조

```
/                    → 루트 (자동 리다이렉트)
/customer            → 고객 메인 (메뉴 화면)
/customer/cart       → 장바구니
/customer/orders     → 주문 내역
/admin/login         → 관리자 로그인
/admin/dashboard     → 관리자 대시보드 (실시간 주문 모니터링)
/admin/tables        → 테이블 관리
```

---

### 2. 페이지 컴포넌트 (Pages)

#### CustomerMenuPage
- **책임**: 메뉴 목록 표시, 카테고리 탭, 장바구니 진입점

#### CustomerCartPage
- **책임**: 장바구니 목록, 수량 조절, 주문 확정

#### CustomerOrdersPage
- **책임**: 현재 세션 주문 내역 표시

#### AdminLoginPage
- **책임**: 관리자 로그인 폼

#### AdminDashboardPage
- **책임**: 실시간 주문 모니터링 그리드, SSE 연결

#### AdminTablesPage
- **책임**: 테이블 관리 (초기 설정, 세션 종료, 과거 내역)

---

### 3. 공통 컴포넌트 (Shared Components)

#### MenuCard
- **책임**: 메뉴 카드 UI (이미지, 이름, 가격, 설명, 담기 버튼)

#### CartItem
- **책임**: 장바구니 항목 UI (수량 조절, 삭제)

#### OrderCard
- **책임**: 주문 카드 UI (주문 번호, 시각, 메뉴 목록, 금액, 상태)

#### TableCard
- **책임**: 관리자 대시보드 테이블 카드 (총 주문액, 최신 주문 미리보기)

#### Modal
- **책임**: 확인 팝업 (주문 삭제, 세션 종료 확인)

#### LoadingSpinner
- **책임**: 로딩 상태 표시

---

### 4. 상태 관리 (Context)

#### AuthContext
- **책임**: 테이블 자동 로그인 상태, localStorage 연동, 세션 ID 관리

#### CartContext
- **책임**: 장바구니 상태, localStorage 연동, 수량 조절, 총 금액 계산

#### AdminAuthContext
- **책임**: 관리자 JWT 토큰 상태, 16시간 세션 관리

---

### 5. API 클라이언트 (API Layer)

#### apiClient
- **책임**: axios 또는 fetch 기반 HTTP 클라이언트, 기본 URL 설정, 인터셉터

#### customerApi
- **책임**: 고객용 API 호출 (메뉴 조회, 주문 생성, 주문 내역)

#### adminApi
- **책임**: 관리자용 API 호출 (로그인, 주문 관리, 테이블 관리)

#### sseClient
- **책임**: SSE 연결 관리, 이벤트 수신 처리
