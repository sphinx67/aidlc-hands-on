# 유닛 정의

## 유닛 분리 전략
백엔드(FastAPI)와 프론트엔드(React)는 독립적으로 배포되는 별도 서버이므로 2개 유닛으로 분리합니다.

---

## 유닛 1: 백엔드 (Backend)

### 기본 정보
- **유닛명**: backend
- **기술 스택**: Python + FastAPI + SQLAlchemy + SQLite
- **실행 포트**: 8000
- **디렉토리**: `backend/`

### 책임
- REST API 제공 (인증, 테이블, 메뉴, 주문, 주문 이력)
- SSE 기반 실시간 이벤트 스트림
- JWT 기반 관리자 인증
- 테이블 세션 관리
- SQLite 데이터 영속성

### 코드 구조
```
backend/
├── main.py                  # FastAPI 앱 진입점, CORS 설정, 라우터 등록
├── database.py              # SQLAlchemy 엔진, 세션 팩토리
├── models/                  # SQLAlchemy ORM 모델
│   ├── __init__.py
│   ├── store.py
│   ├── table.py
│   ├── menu.py
│   ├── order.py
│   └── order_history.py
├── schemas/                 # Pydantic 요청/응답 스키마
│   ├── __init__.py
│   ├── auth.py
│   ├── table.py
│   ├── menu.py
│   ├── order.py
│   └── order_history.py
├── routers/                 # FastAPI 라우터
│   ├── __init__.py
│   ├── auth.py
│   ├── tables.py
│   ├── menus.py
│   ├── orders.py
│   ├── order_history.py
│   └── sse.py
├── services/                # 비즈니스 로직 서비스
│   ├── __init__.py
│   ├── auth_service.py
│   ├── table_service.py
│   ├── menu_service.py
│   ├── order_service.py
│   ├── order_history_service.py
│   └── sse_service.py
├── dependencies.py          # FastAPI 의존성 주입 (get_db, get_current_admin 등)
├── seed.py                  # 초기 데이터 시드 스크립트
└── requirements.txt
```

### 주요 기능 목록
- 관리자 로그인/JWT 발급 (16시간)
- 테이블 초기 설정 및 인증
- 메뉴/카테고리 조회
- 주문 생성/조회/상태 변경/삭제
- 테이블 세션 종료 (주문 이력 이동)
- 과거 주문 이력 조회
- SSE 실시간 이벤트 스트림

---

## 유닛 2: 프론트엔드 (Frontend)

### 기본 정보
- **유닛명**: frontend
- **기술 스택**: React + TypeScript + Tailwind CSS + Context API
- **실행 포트**: 3000
- **디렉토리**: `frontend/`

### 책임
- 고객용 주문 UI (메뉴 조회, 장바구니, 주문 생성, 주문 내역)
- 관리자용 대시보드 UI (실시간 모니터링, 테이블 관리)
- localStorage 기반 상태 유지 (장바구니, 테이블 로그인, JWT)
- SSE 클라이언트 (실시간 주문 수신)

### 코드 구조
```
frontend/
├── public/
├── src/
│   ├── main.tsx             # React 앱 진입점
│   ├── App.tsx              # 라우팅 설정 (React Router)
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── customer/
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── OrdersPage.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       └── TablesPage.tsx
│   ├── components/          # 공통 UI 컴포넌트
│   │   ├── MenuCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderCard.tsx
│   │   ├── TableCard.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── context/             # React Context (상태 관리)
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── AdminAuthContext.tsx
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useAdminAuth.ts
│   │   ├── useSSE.ts
│   │   └── useOrders.ts
│   ├── api/                 # API 클라이언트
│   │   ├── client.ts        # axios 인스턴스
│   │   ├── customerApi.ts
│   │   ├── adminApi.ts
│   │   └── sseClient.ts
│   └── types/               # TypeScript 타입 정의
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 주요 기능 목록
- 테이블 자동 로그인 (localStorage)
- 메뉴 목록/카테고리 탭 UI
- 장바구니 관리 (localStorage 유지)
- 주문 생성 (5초 후 자동 리다이렉트)
- 현재 세션 주문 내역 조회
- 관리자 로그인 (JWT 16시간)
- 실시간 주문 대시보드 (SSE)
- 테이블 관리 (초기 설정, 세션 종료, 과거 내역)
