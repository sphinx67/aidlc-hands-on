# 유닛-기능 매핑

## 유닛 1: backend 기능 매핑

| 기능 요구사항 | 구현 컴포넌트 |
|--------------|--------------|
| FR-C-01: 테이블 자동 로그인 | TableRouter, TableService, AuthService |
| FR-C-02: 메뉴 조회 | MenuRouter, MenuService |
| FR-C-04: 주문 생성 | OrderRouter, OrderService, SSEService |
| FR-C-05: 주문 내역 조회 (고객) | OrderRouter, OrderService |
| FR-A-01: 관리자 인증 | AuthRouter, AuthService |
| FR-A-02: 실시간 주문 모니터링 | SSERouter, SSEService, OrderService |
| FR-A-03: 테이블 관리 - 초기 설정 | TableRouter, TableService |
| FR-A-03: 테이블 관리 - 주문 삭제 | OrderRouter, OrderService |
| FR-A-03: 테이블 관리 - 세션 종료 | TableRouter, TableService, OrderHistoryService |
| FR-A-03: 테이블 관리 - 과거 내역 | OrderHistoryRouter, OrderHistoryService |
| 시드 데이터 | seed.py |

## 유닛 2: frontend 기능 매핑

| 기능 요구사항 | 구현 컴포넌트 |
|--------------|--------------|
| FR-C-01: 테이블 자동 로그인 | AuthContext, useAuth |
| FR-C-02: 메뉴 조회 | MenuPage, MenuCard, customerApi |
| FR-C-03: 장바구니 관리 | CartPage, CartItem, CartContext, useCart |
| FR-C-04: 주문 생성 | CartPage, customerApi |
| FR-C-05: 주문 내역 조회 | OrdersPage, OrderCard, useOrders |
| FR-A-01: 관리자 인증 | LoginPage, AdminAuthContext, useAdminAuth |
| FR-A-02: 실시간 주문 모니터링 | DashboardPage, TableCard, useSSE, sseClient |
| FR-A-03: 테이블 관리 | TablesPage, Modal, adminApi |

## 개발 우선순위

### backend
1. DB 모델 및 시드 데이터
2. 인증 (AuthService, AuthRouter)
3. 메뉴 API (MenuService, MenuRouter)
4. 주문 API (OrderService, OrderRouter)
5. 테이블 관리 API (TableService, TableRouter)
6. 주문 이력 API (OrderHistoryService, OrderHistoryRouter)
7. SSE (SSEService, SSERouter)

### frontend
1. 프로젝트 설정 (Vite, Tailwind, React Router)
2. API 클라이언트 및 타입 정의
3. Context 및 커스텀 훅
4. 고객용 페이지 (Menu → Cart → Orders)
5. 관리자 로그인 페이지
6. 관리자 대시보드 (SSE 연동)
7. 테이블 관리 페이지
