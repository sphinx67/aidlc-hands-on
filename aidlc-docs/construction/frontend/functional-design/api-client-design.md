# API 클라이언트 설계 - 프론트엔드

## 공통 클라이언트 (client.ts)

axios 인스턴스 기반, 기본 URL `http://localhost:8000`.

```typescript
// 요청 인터셉터: Authorization 헤더 자동 주입
// 응답 인터셉터: 401 수신 시 해당 토큰 삭제 처리
```

**토큰 주입 규칙**:
- 고객 API 호출 시: localStorage의 `table_token` 사용
- 관리자 API 호출 시: localStorage의 `admin_token` 사용
- 각 API 모듈에서 헤더를 직접 전달하는 방식으로 구현 (인터셉터 대신 명시적 주입)

---

## TypeScript 타입 정의 (types/index.ts)

```typescript
export interface Category {
  id: number
  name: string
  display_order: number
}

export interface Menu {
  id: number
  category_id: number
  name: string
  price: number
  description: string | null
  image_url: string | null
  display_order: number
  is_available: boolean
}

export interface CartItem {
  menuId: number
  menuName: string
  unitPrice: number
  quantity: number
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

export interface OrderItem {
  id: number
  menu_id: number
  menu_name: string
  unit_price: number
  quantity: number
}

export interface Order {
  id: number
  order_number: string
  table_id: number
  session_id: string
  status: OrderStatus
  total_amount: number
  items: OrderItem[]
  created_at: string
}

export interface OrderHistoryItem {
  id: number
  menu_name: string
  unit_price: number
  quantity: number
}

export interface OrderHistory {
  id: number
  order_number: string
  table_id: number
  session_id: string
  status: OrderStatus
  total_amount: number
  items: OrderHistoryItem[]
  ordered_at: string
  completed_at: string
}

export interface TableInfo {
  id: number
  table_number: number
  current_session_id: string | null
  is_active: boolean
  has_password: boolean
  created_at: string
}
```

---

## customerApi.ts

```typescript
// 테이블 인증
authenticateTable(storeId: string, tableNumber: number, password: string)
  → POST /api/tables/auth
  → 응답: { access_token, table_id, table_number, session_id }

// 카테고리 목록
getCategories(storeId: string)
  → GET /api/menus/categories?store_id={storeId}
  → 응답: Category[]

// 메뉴 목록
getMenus(storeId: string, categoryId?: number)
  → GET /api/menus?store_id={storeId}[&category_id={categoryId}]
  → 응답: Menu[]

// 주문 생성
createOrder(items: {menu_id: number, quantity: number}[], token: string)
  → POST /api/orders (Authorization: Bearer {token})
  → 응답: Order

// 주문 내역 조회
getOrders(token: string)
  → GET /api/orders (Authorization: Bearer {token})
  → 응답: Order[]
```

---

## adminApi.ts

```typescript
// 관리자 로그인
login(storeId: string, username: string, password: string)
  → POST /api/auth/login
  → 응답: { access_token, token_type }

// 주문 목록 (전체)
getOrders(token: string)
  → GET /api/orders (Authorization: Bearer {token})
  → 응답: Order[]

// 주문 상태 변경
updateOrderStatus(orderId: number, status: OrderStatus, token: string)
  → PATCH /api/orders/{orderId}/status (Authorization: Bearer {token})
  → 응답: Order

// 주문 삭제
deleteOrder(orderId: number, token: string)
  → DELETE /api/orders/{orderId} (Authorization: Bearer {token})
  → 응답: 204 No Content

// 테이블 목록
getTables(token: string)
  → GET /api/tables (Authorization: Bearer {token})
  → 응답: TableInfo[]

// 테이블 생성
createTable(tableNumber: number, token: string)
  → POST /api/tables (Authorization: Bearer {token})
  → 응답: TableInfo

// 테이블 비밀번호 설정
setupTable(tableId: number, password: string, token: string)
  → POST /api/tables/{tableId}/setup (Authorization: Bearer {token})
  → 응답: TableInfo

// 세션 종료
completeSession(tableId: number, token: string)
  → POST /api/tables/{tableId}/complete (Authorization: Bearer {token})
  → 응답: 204 No Content

// 과거 주문 이력
getOrderHistory(token: string, tableId?: number)
  → GET /api/order-history[?table_id={tableId}] (Authorization: Bearer {token})
  → 응답: OrderHistory[]
```

---

## sseClient.ts

```typescript
class SSEClient {
  private eventSource: EventSource | null = null

  connect(token: string, onEvent: (event: SSEEvent) => void): void
  // GET /api/sse/orders (Authorization 헤더는 URL 파라미터로 전달)
  // EventSource는 커스텀 헤더 미지원 → ?token={token} 쿼리 파라미터 방식

  disconnect(): void

  // 이벤트 타입
  // order.created, order.status_changed, order.deleted, session.completed
}
```

**SSE 인증 처리**:
- `EventSource`는 커스텀 헤더를 지원하지 않으므로 URL 쿼리 파라미터로 토큰 전달
- 백엔드 SSE 라우터에서 `?token=` 파라미터도 허용하도록 처리 필요
