# 컴포넌트 메서드 시그니처

## 백엔드 서비스 메서드

### AuthService

```python
class AuthService:
    def hash_password(self, password: str) -> str
    def verify_password(self, plain: str, hashed: str) -> bool
    def create_access_token(self, data: dict, expires_delta: timedelta) -> str
    def verify_token(self, token: str) -> dict
    def login_admin(self, db: Session, store_id: str, username: str, password: str) -> TokenResponse
```

### TableService

```python
class TableService:
    def get_tables(self, db: Session, store_id: str) -> list[TableResponse]
    def setup_table(self, db: Session, store_id: str, table_number: int, password: str) -> TableSetupResponse
    def authenticate_table(self, db: Session, store_id: str, table_number: int, password: str) -> TableAuthResponse
    def complete_session(self, db: Session, table_id: int) -> SessionCompleteResponse
    # 세션 종료 시 현재 주문을 OrderHistory로 이동하고 테이블 리셋
```

### MenuService

```python
class MenuService:
    def get_categories(self, db: Session, store_id: str) -> list[CategoryResponse]
    def get_menus(self, db: Session, store_id: str, category_id: int | None) -> list[MenuResponse]
    def get_menu(self, db: Session, menu_id: int) -> MenuResponse
```

### OrderService

```python
class OrderService:
    def create_order(self, db: Session, table_id: int, session_id: str, items: list[OrderItemCreate]) -> OrderResponse
    def get_orders_by_session(self, db: Session, table_id: int, session_id: str) -> list[OrderResponse]
    def get_all_active_orders(self, db: Session, store_id: str) -> list[OrderResponse]
    def update_order_status(self, db: Session, order_id: int, status: OrderStatus) -> OrderResponse
    def delete_order(self, db: Session, order_id: int) -> None
    # 주문 생성/삭제 시 SSEService를 통해 이벤트 발행
```

### OrderHistoryService

```python
class OrderHistoryService:
    def move_to_history(self, db: Session, table_id: int, session_id: str, completed_at: datetime) -> None
    def get_history(self, db: Session, table_id: int, date_from: date | None, date_to: date | None) -> list[OrderHistoryResponse]
```

### SSEService

```python
class SSEService:
    def add_connection(self, store_id: str, queue: asyncio.Queue) -> None
    def remove_connection(self, store_id: str, queue: asyncio.Queue) -> None
    async def broadcast(self, store_id: str, event: dict) -> None
    async def event_generator(self, store_id: str) -> AsyncGenerator[str, None]
```

---

## 백엔드 라우터 엔드포인트

### AuthRouter
```python
POST /api/auth/login        # 관리자 로그인 → JWT 토큰 반환
POST /api/auth/logout       # 로그아웃 (클라이언트 토큰 삭제)
```

### TableRouter
```python
GET  /api/tables            # 테이블 목록 조회 (관리자 인증 필요)
POST /api/tables/{id}/setup # 테이블 초기 설정 (관리자 인증 필요)
POST /api/tables/{id}/auth  # 테이블 인증 (고객용, 자동 로그인)
POST /api/tables/{id}/complete  # 테이블 세션 종료 (관리자 인증 필요)
```

### MenuRouter
```python
GET /api/menus              # 메뉴 목록 (query: store_id, category_id)
GET /api/menus/categories   # 카테고리 목록 (query: store_id)
GET /api/menus/{id}         # 메뉴 상세
```

### OrderRouter
```python
POST   /api/orders                      # 주문 생성 (테이블 인증 필요)
GET    /api/orders                      # 주문 목록 (query: table_id, session_id 또는 store_id)
PATCH  /api/orders/{id}/status          # 주문 상태 변경 (관리자 인증 필요)
DELETE /api/orders/{id}                 # 주문 삭제 (관리자 인증 필요)
```

### OrderHistoryRouter
```python
GET /api/order-history      # 과거 주문 이력 (query: table_id, date_from, date_to, 관리자 인증 필요)
```

### SSERouter
```python
GET /api/sse/orders         # SSE 스트림 (query: store_id, 관리자 인증 필요)
```

---

## 프론트엔드 주요 훅 (Custom Hooks)

### useAuth (고객용)
```typescript
function useAuth(): {
  isAuthenticated: boolean
  storeId: string | null
  tableId: number | null
  sessionId: string | null
  login: (storeId: string, tableNumber: number, password: string) => Promise<void>
  autoLogin: () => Promise<boolean>
}
```

### useCart
```typescript
function useCart(): {
  items: CartItem[]
  totalAmount: number
  addItem: (menu: Menu, quantity: number) => void
  removeItem: (menuId: number) => void
  updateQuantity: (menuId: number, quantity: number) => void
  clearCart: () => void
}
```

### useAdminAuth
```typescript
function useAdminAuth(): {
  isAuthenticated: boolean
  token: string | null
  login: (storeId: string, username: string, password: string) => Promise<void>
  logout: () => void
}
```

### useSSE
```typescript
function useSSE(storeId: string, token: string): {
  orders: Order[]
  isConnected: boolean
}
```

### useOrders (고객용)
```typescript
function useOrders(tableId: number, sessionId: string): {
  orders: Order[]
  isLoading: boolean
  refetch: () => void
}
```
