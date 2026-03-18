# 논리 컴포넌트 - 프론트엔드

## 컴포넌트 구성도

```
[App.tsx]
    |
    +-- [AuthProvider]          # 고객 인증 상태
    +-- [CartProvider]          # 장바구니 상태
    +-- [AdminAuthProvider]     # 관리자 인증 상태
    |
    +-- [Router]
          |
          +-- /customer/*  → [ProtectedCustomerRoute]
          |       |
          |       +-- /customer        → MenuPage
          |       +-- /customer/cart   → CartPage
          |       +-- /customer/orders → OrdersPage
          |
          +-- /admin/login → LoginPage
          |
          +-- /admin/*  → [ProtectedAdminRoute]
                  |
                  +-- /admin/dashboard → DashboardPage
                  +-- /admin/tables    → TablesPage
```

---

## 레이어별 책임

### API 레이어 (`src/api/`)

```
client.ts          # axios 인스턴스 (baseURL, 인터셉터)
customerApi.ts     # 고객용 API 함수 (테이블 인증, 메뉴, 주문)
adminApi.ts        # 관리자용 API 함수 (로그인, 주문 관리, 테이블 관리)
sseClient.ts       # SSEClient 클래스 (EventSource 래퍼, 자동 재연결)
```

**axios 인스턴스 분리**:
- `customerClient`: 고객 API 전용 (table_token 주입)
- `adminClient`: 관리자 API 전용 (admin_token 주입, 401 자동 로그아웃)

---

### Context 레이어 (`src/context/`)

```
AuthContext.tsx
  - 상태: isAuthenticated, storeId, tableId, tableNumber, sessionId, token
  - 액션: login(), autoLogin(), logout()
  - 초기화: 앱 마운트 시 autoLogin() 자동 실행

CartContext.tsx
  - 상태: items[], totalAmount, totalCount
  - 액션: addItem(), removeItem(), updateQuantity(), clearCart()
  - 초기화: localStorage 'cart_items'에서 복원

AdminAuthContext.tsx
  - 상태: isAuthenticated, token, storeId
  - 액션: login(), logout()
  - 초기화: localStorage 토큰 만료 여부 확인
```

---

### Hook 레이어 (`src/hooks/`)

```
useAuth.ts         # AuthContext 소비
useAdminAuth.ts    # AdminAuthContext 소비
useCart.ts         # CartContext 소비
useOrders.ts       # 고객 주문 목록 조회 (API 호출 + 상태 관리)
useSSE.ts          # SSE 연결 + 실시간 주문 상태 관리
```

**useSSE 내부 구조**:
```typescript
function useSSE(storeId: string, token: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const sseClientRef = useRef<SSEClient | null>(null)

  useEffect(() => {
    // 1. 초기 주문 목록 로드
    adminApi.getOrders(token).then(setOrders)

    // 2. SSE 연결
    sseClientRef.current = new SSEClient()
    sseClientRef.current.connect(token, handleSSEEvent)
    setIsConnected(true)

    return () => {
      sseClientRef.current?.disconnect()
      setIsConnected(false)
    }
  }, [storeId, token])

  return { orders, setOrders, isConnected }
}
```

---

### Page 레이어 (`src/pages/`)

각 페이지는 훅을 통해 데이터를 가져오고 컴포넌트를 조합합니다.

```
MenuPage
  - useAuth() → storeId 획득
  - useState(categories, menus, selectedCategoryId)
  - useCart() → addItem
  - 렌더: 카테고리 탭 + MenuCard 그리드 + 장바구니 버튼

CartPage
  - useCart() → items, totalAmount, clearCart
  - useAuth() → token
  - useState(isSubmitting, orderNumber, countdown)
  - 렌더: CartItem 목록 + 총 금액 + 주문 확정 버튼

OrdersPage
  - useOrders() → orders, isLoading, refetch
  - 렌더: OrderCard 목록

LoginPage (Admin)
  - useAdminAuth() → login
  - useState(form, error, isLoading)
  - 렌더: 로그인 폼

DashboardPage (Admin)
  - useAdminAuth() → token, storeId
  - useSSE(storeId, token) → orders, isConnected
  - 렌더: 테이블 필터 + OrderCard 그리드

TablesPage (Admin)
  - useAdminAuth() → token
  - useState(tables, selectedTable, modals)
  - 렌더: 테이블 카드 목록 + Modal들
```

---

## SSE 인증 처리 (백엔드 수정 사항)

EventSource는 커스텀 헤더를 지원하지 않으므로, 백엔드 SSE 라우터에서 쿼리 파라미터 토큰도 허용해야 합니다.

```python
# routers/sse.py 수정
from fastapi import Query
from services.auth_service import decode_admin_token

@router.get("/orders")
async def sse_orders(token: str = Query(...)):
    admin = decode_admin_token(token)
    return StreamingResponse(
        _sse.event_generator(admin.store_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

---

## 앱 초기화 시퀀스

```
1. main.tsx: ReactDOM.createRoot().render(<App />)
2. App.tsx: Provider 트리 구성
   - AdminAuthProvider (localStorage 토큰 만료 확인)
   - AuthProvider (autoLogin 실행)
   - CartProvider (localStorage 장바구니 복원)
3. Router: 현재 경로에 맞는 페이지 렌더링
4. ProtectedRoute: 인증 상태 확인 후 리다이렉트 또는 렌더링
```

---

## 에러 처리 전략

| 상황 | 처리 방식 |
|------|-----------|
| API 네트워크 오류 | 에러 메시지 표시, 재시도 버튼 |
| 401 Unauthorized | 자동 로그아웃 + 로그인 화면 리다이렉트 |
| 주문 생성 실패 | 에러 토스트, 장바구니 유지 |
| SSE 연결 끊김 | 자동 재연결 (지수 백오프) + 연결 상태 표시 |
| 자동 로그인 실패 | 초기 설정 화면 표시 |
