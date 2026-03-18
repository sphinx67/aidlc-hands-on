# 프론트엔드 코드 생성 요약

## 생성된 파일 목록

### 프로젝트 설정
- `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- `frontend/index.html`, `frontend/.env.example`
- `frontend/src/main.tsx`, `frontend/src/index.css`

### 타입 정의
- `frontend/src/types/index.ts` - Category, Menu, CartItem, Order, OrderHistory, TableInfo, SSEEvent

### API 레이어
- `frontend/src/api/client.ts` - axios 인스턴스 (customerClient, adminClient)
- `frontend/src/api/customerApi.ts` - 테이블 인증, 메뉴, 주문
- `frontend/src/api/adminApi.ts` - 로그인, 주문 관리, 테이블 관리, 이력
- `frontend/src/api/sseClient.ts` - SSEClient (자동 재연결, 지수 백오프)

### Context
- `frontend/src/context/AuthContext.tsx` - 고객 인증, autoLogin
- `frontend/src/context/CartContext.tsx` - 장바구니, localStorage 연동
- `frontend/src/context/AdminAuthContext.tsx` - 관리자 JWT, 만료 처리

### 커스텀 훅
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/hooks/useAdminAuth.ts`
- `frontend/src/hooks/useCart.ts`
- `frontend/src/hooks/useOrders.ts`
- `frontend/src/hooks/useSSE.ts`

### 공통 컴포넌트
- `frontend/src/components/LoadingSpinner.tsx`
- `frontend/src/components/Modal.tsx`
- `frontend/src/components/MenuCard.tsx`
- `frontend/src/components/CartItem.tsx`
- `frontend/src/components/OrderCard.tsx`
- `frontend/src/components/ProtectedRoute.tsx`

### 고객 페이지
- `frontend/src/pages/customer/MenuPage.tsx`
- `frontend/src/pages/customer/CartPage.tsx`
- `frontend/src/pages/customer/OrdersPage.tsx`

### 관리자 페이지
- `frontend/src/pages/admin/LoginPage.tsx`
- `frontend/src/pages/admin/DashboardPage.tsx`
- `frontend/src/pages/admin/TablesPage.tsx`

### 앱 진입점
- `frontend/src/App.tsx`

### 백엔드 수정
- `backend/routers/sse.py` - SSE 인증을 쿼리 파라미터 방식으로 변경

## 실행 방법

```bash
cd frontend

# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000

# 4. 빌드
npm run build
```

## 접속 경로
- 고객 화면: http://localhost:3000/customer
- 관리자 로그인: http://localhost:3000/admin/login
- 관리자 대시보드: http://localhost:3000/admin/dashboard
