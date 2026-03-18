# 상태 관리 설계 - 프론트엔드

## 상태 관리 전략

Context API + localStorage 조합으로 전역 상태를 관리합니다.
서버 상태(API 데이터)는 각 페이지/훅에서 직접 관리합니다.

---

## Context 정의

### AuthContext (고객 인증)

**관리 상태**:
```typescript
interface AuthState {
  isAuthenticated: boolean
  storeId: string | null
  tableId: number | null
  tableNumber: number | null
  sessionId: string | null
  token: string | null
}
```

**localStorage 키**:
- `table_store_id`: 매장 식별자
- `table_number`: 테이블 번호
- `table_password`: 테이블 비밀번호 (자동 로그인용)
- `table_token`: JWT 토큰
- `table_session_id`: 세션 ID
- `table_id`: 테이블 ID

**제공 메서드**:
```typescript
interface AuthContextValue extends AuthState {
  login: (storeId: string, tableNumber: number, password: string) => Promise<void>
  autoLogin: () => Promise<boolean>  // localStorage 정보로 자동 로그인
  logout: () => void
}
```

**동작 규칙**:
- 앱 시작 시 `autoLogin()` 자동 호출
- 로그인 성공 시 모든 정보 localStorage 저장
- 로그아웃 시 token, session_id만 삭제 (store_id, table_number, password 유지 → 재자동로그인 가능)

---

### CartContext (장바구니)

**관리 상태**:
```typescript
interface CartItem {
  menuId: number
  menuName: string
  unitPrice: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  totalCount: number
}
```

**localStorage 키**:
- `cart_items`: JSON 직렬화된 CartItem 배열

**제공 메서드**:
```typescript
interface CartContextValue extends CartState {
  addItem: (menu: Menu, quantity?: number) => void
  removeItem: (menuId: number) => void
  updateQuantity: (menuId: number, quantity: number) => void
  clearCart: () => void
}
```

**동작 규칙**:
- 모든 변경 즉시 localStorage 동기화
- `addItem`: 이미 있는 메뉴면 수량 증가
- `updateQuantity(id, 0)`: 해당 항목 삭제
- `totalAmount`: items 변경 시 자동 재계산

---

### AdminAuthContext (관리자 인증)

**관리 상태**:
```typescript
interface AdminAuthState {
  isAuthenticated: boolean
  token: string | null
  storeId: string | null
}
```

**localStorage 키**:
- `admin_token`: JWT 토큰
- `admin_store_id`: 매장 식별자
- `admin_token_exp`: 만료 시각 (ISO 8601)

**제공 메서드**:
```typescript
interface AdminAuthContextValue extends AdminAuthState {
  login: (storeId: string, username: string, password: string) => Promise<void>
  logout: () => void
}
```

**동작 규칙**:
- 앱 시작 시 localStorage 토큰 만료 여부 확인
- 만료된 경우 자동 로그아웃 처리
- 16시간 후 자동 만료

---

## 커스텀 훅

### useAuth
AuthContext를 소비하는 편의 훅.
```typescript
const { isAuthenticated, storeId, tableId, sessionId, token, login, autoLogin } = useAuth()
```

### useAdminAuth
AdminAuthContext를 소비하는 편의 훅.
```typescript
const { isAuthenticated, token, storeId, login, logout } = useAdminAuth()
```

### useCart
CartContext를 소비하는 편의 훅.
```typescript
const { items, totalAmount, totalCount, addItem, removeItem, updateQuantity, clearCart } = useCart()
```

### useOrders (고객용)
현재 세션 주문 목록 조회.
```typescript
function useOrders(): {
  orders: Order[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}
```
- AuthContext에서 tableId, sessionId, token 자동 획득
- 마운트 시 자동 조회

### useSSE (관리자용)
SSE 연결 및 주문 실시간 업데이트.
```typescript
function useSSE(storeId: string, token: string): {
  orders: Order[]
  isConnected: boolean
}
```

**동작**:
1. 마운트 시 초기 주문 목록 GET /api/orders
2. SSE 연결 GET /api/sse/orders
3. `order.created` → orders 배열에 추가
4. `order.status_changed` → 해당 주문 status 업데이트
5. `order.deleted` → 해당 주문 제거
6. `session.completed` → 해당 테이블 주문 전체 제거
7. 언마운트 시 SSE 연결 해제

---

## 데이터 흐름 다이어그램

```
[localStorage]
     │
     ▼
[AuthContext] ──────────────────────────────────┐
     │                                          │
     ▼                                          ▼
[useAuth hook]                          [useAdminAuth hook]
     │                                          │
     ▼                                          ▼
[CustomerMenuPage]                      [AdminDashboardPage]
[CustomerCartPage]  ←── [CartContext]   [AdminTablesPage]
[CustomerOrdersPage] ── [useOrders]     [useSSE hook]
```
