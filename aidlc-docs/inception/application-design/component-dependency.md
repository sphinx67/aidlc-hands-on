# 컴포넌트 의존 관계

## 백엔드 의존 관계

```
[라우터 레이어]
      |
      +-- AuthRouter       → AuthService
      +-- TableRouter      → TableService → OrderHistoryService
      |                                   → AuthService (비밀번호 해싱)
      +-- MenuRouter       → MenuService
      +-- OrderRouter      → OrderService → SSEService
      +-- OrderHistoryRouter → OrderHistoryService
      +-- SSERouter        → SSEService

[서비스 레이어]
      |
      +-- AuthService          (독립)
      +-- MenuService          (독립)
      +-- SSEService           (독립, 싱글톤)
      +-- OrderHistoryService  (독립)
      +-- OrderService         → SSEService
      +-- TableService         → OrderHistoryService
                               → AuthService

[모델 레이어 - SQLAlchemy]
      |
      +-- Store
      +-- Table            → Store (FK)
      +-- Category         → Store (FK)
      +-- Menu             → Category (FK), Store (FK)
      +-- Order            → Table (FK)
      +-- OrderItem        → Order (FK), Menu (FK)
      +-- OrderHistory     → Table (FK)
      +-- OrderHistoryItem → OrderHistory (FK)

[의존성 주입]
      |
      +-- get_db               → SQLAlchemy Session (모든 라우터)
      +-- get_current_admin    → AuthService (관리자 전용 엔드포인트)
      +-- get_current_table    → AuthService (고객 전용 엔드포인트)
```

---

## 프론트엔드 의존 관계

```
[페이지 컴포넌트]
      |
      +-- CustomerMenuPage    → useAuth, useCart, MenuCard, customerApi
      +-- CustomerCartPage    → useCart, CartItem, customerApi
      +-- CustomerOrdersPage  → useAuth, useOrders, OrderCard, customerApi
      +-- AdminLoginPage      → useAdminAuth, adminApi
      +-- AdminDashboardPage  → useAdminAuth, useSSE, TableCard, OrderCard, adminApi
      +-- AdminTablesPage     → useAdminAuth, adminApi, Modal

[공통 컴포넌트]
      |
      +-- MenuCard             → (props only)
      +-- CartItem             → (props only)
      +-- OrderCard            → (props only)
      +-- TableCard            → OrderCard
      +-- Modal                → (props only)

[상태 관리 (Context)]
      |
      +-- AuthContext          → localStorage, customerApi
      +-- CartContext          → localStorage
      +-- AdminAuthContext     → localStorage, adminApi

[API 레이어]
      |
      +-- customerApi          → apiClient
      +-- adminApi             → apiClient
      +-- sseClient            → EventSource (브라우저 내장)
      +-- apiClient            → axios, localStorage (토큰)
```

---

## 백엔드 ↔ 프론트엔드 통신 흐름

```
[고객 주문 흐름]
CustomerMenuPage
  → customerApi.getMenus()
  → GET /api/menus
  → MenuService.get_menus()
  → SQLite

CustomerCartPage
  → customerApi.createOrder()
  → POST /api/orders
  → OrderService.create_order()
  → SQLite 저장
  → SSEService.broadcast("order.created")
  → AdminDashboardPage (SSE 수신)

[관리자 모니터링 흐름]
AdminDashboardPage
  → sseClient.connect()
  → GET /api/sse/orders (SSE 스트림)
  → SSEService.event_generator()
  → 이벤트 수신 시 UI 업데이트

[테이블 세션 종료 흐름]
AdminTablesPage
  → adminApi.completeSession()
  → POST /api/tables/{id}/complete
  → TableService.complete_session()
  → OrderHistoryService.move_to_history()
  → SQLite (Order → OrderHistory 이동)
  → SSEService.broadcast("order.deleted")
```

---

## 데이터 흐름 요약

| 방향 | 프로토콜 | 용도 |
|------|----------|------|
| 프론트 → 백엔드 | REST (HTTP/JSON) | 모든 CRUD 요청 |
| 백엔드 → 프론트 (관리자) | SSE | 실시간 주문 이벤트 |
| 프론트 ↔ localStorage | 브라우저 API | 장바구니, 테이블 로그인 정보, JWT 토큰 |
