# 프론트엔드 코드 생성 계획

## 유닛 정보
- **유닛명**: frontend
- **기술 스택**: React 18 + TypeScript + Vite + Tailwind CSS + axios
- **코드 위치**: `aidlc-hands-on/frontend/` (워크스페이스 루트 기준)
- **프로젝트 유형**: Greenfield 멀티 유닛

## 구현 스토리 범위
- FR-C-01: 테이블 자동 로그인 (AuthContext, useAuth)
- FR-C-02: 메뉴 조회 (MenuPage, MenuCard, customerApi)
- FR-C-03: 장바구니 관리 (CartPage, CartItem, CartContext)
- FR-C-04: 주문 생성 (CartPage, 5초 카운트다운)
- FR-C-05: 주문 내역 조회 (OrdersPage, OrderCard, useOrders)
- FR-A-01: 관리자 인증 (LoginPage, AdminAuthContext)
- FR-A-02: 실시간 주문 모니터링 (DashboardPage, useSSE, sseClient)
- FR-A-03: 테이블 관리 (TablesPage, Modal, adminApi)

## 의존성
- Unit 1 (Backend) REST API (포트 8000) 소비
- SSE 엔드포인트: GET /api/sse/orders?token={jwt}

---

## 생성 단계

### Step 1: 프로젝트 설정
- [x] `frontend/` Vite + React + TypeScript 프로젝트 초기화 (package.json, vite.config.ts, tsconfig.json)
- [x] `frontend/tailwind.config.js`, `frontend/postcss.config.js` 생성
- [x] `frontend/.env.example` 생성
- [x] `frontend/index.html` 생성
- [x] `frontend/src/main.tsx` 생성

### Step 2: 타입 정의
- [x] `frontend/src/types/index.ts` 생성 (Category, Menu, CartItem, Order, OrderHistory, TableInfo 등)

### Step 3: API 레이어
- [x] `frontend/src/api/client.ts` 생성 (axios 인스턴스 2개: customerClient, adminClient)
- [x] `frontend/src/api/customerApi.ts` 생성 (테이블 인증, 메뉴, 주문)
- [x] `frontend/src/api/adminApi.ts` 생성 (로그인, 주문 관리, 테이블 관리, 이력)
- [x] `frontend/src/api/sseClient.ts` 생성 (SSEClient 클래스, 자동 재연결)

### Step 4: Context 레이어
- [x] `frontend/src/context/AuthContext.tsx` 생성 (고객 인증, localStorage 연동, autoLogin)
- [x] `frontend/src/context/CartContext.tsx` 생성 (장바구니, localStorage 연동)
- [x] `frontend/src/context/AdminAuthContext.tsx` 생성 (관리자 JWT, 만료 처리)

### Step 5: 커스텀 훅
- [x] `frontend/src/hooks/useAuth.ts` 생성
- [x] `frontend/src/hooks/useAdminAuth.ts` 생성
- [x] `frontend/src/hooks/useCart.ts` 생성
- [x] `frontend/src/hooks/useOrders.ts` 생성 (고객 주문 목록 조회)
- [x] `frontend/src/hooks/useSSE.ts` 생성 (SSE 연결 + 실시간 상태 관리)

### Step 6: 공통 컴포넌트
- [x] `frontend/src/components/LoadingSpinner.tsx` 생성
- [x] `frontend/src/components/Modal.tsx` 생성 (확인/취소 팝업)
- [x] `frontend/src/components/MenuCard.tsx` 생성
- [x] `frontend/src/components/CartItem.tsx` 생성
- [x] `frontend/src/components/OrderCard.tsx` 생성 (고객/관리자 공용)
- [x] `frontend/src/components/ProtectedRoute.tsx` 생성 (고객/관리자 라우트 보호)

### Step 7: 고객 페이지
- [x] `frontend/src/pages/customer/MenuPage.tsx` 생성 (카테고리 탭 + 메뉴 그리드)
- [x] `frontend/src/pages/customer/CartPage.tsx` 생성 (장바구니 + 주문 확정 + 5초 카운트다운)
- [x] `frontend/src/pages/customer/OrdersPage.tsx` 생성 (현재 세션 주문 내역)

### Step 8: 관리자 페이지
- [x] `frontend/src/pages/admin/LoginPage.tsx` 생성
- [x] `frontend/src/pages/admin/DashboardPage.tsx` 생성 (SSE 실시간 주문 모니터링)
- [x] `frontend/src/pages/admin/TablesPage.tsx` 생성 (테이블 관리)

### Step 9: 앱 라우팅 및 백엔드 SSE 수정
- [x] `frontend/src/App.tsx` 생성 (라우팅, Provider 트리, lazy loading)
- [x] `aidlc-hands-on/backend/routers/sse.py` 수정 (쿼리 파라미터 토큰 지원)

### Step 10: 문서 생성
- [x] `aidlc-docs/construction/frontend/code/frontend-summary.md` 생성

---

## 최종 디렉토리 구조

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── index.ts
    ├── api/
    │   ├── client.ts
    │   ├── customerApi.ts
    │   ├── adminApi.ts
    │   └── sseClient.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   └── AdminAuthContext.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useAdminAuth.ts
    │   ├── useCart.ts
    │   ├── useOrders.ts
    │   └── useSSE.ts
    ├── components/
    │   ├── LoadingSpinner.tsx
    │   ├── Modal.tsx
    │   ├── MenuCard.tsx
    │   ├── CartItem.tsx
    │   ├── OrderCard.tsx
    │   └── ProtectedRoute.tsx
    └── pages/
        ├── customer/
        │   ├── MenuPage.tsx
        │   ├── CartPage.tsx
        │   └── OrdersPage.tsx
        └── admin/
            ├── LoginPage.tsx
            ├── DashboardPage.tsx
            └── TablesPage.tsx
```
