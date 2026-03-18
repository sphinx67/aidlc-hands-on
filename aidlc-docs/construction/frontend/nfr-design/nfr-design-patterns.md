# NFR 설계 패턴 - 프론트엔드

## 성능 패턴

### 패턴 1: 코드 스플리팅 (Lazy Loading)
**적용 NFR**: NFR-FE-PERF-01

고객 페이지와 관리자 페이지를 별도 청크로 분리하여 초기 번들 크기를 줄입니다.

```typescript
// App.tsx
import { lazy, Suspense } from 'react'

const MenuPage = lazy(() => import('./pages/customer/MenuPage'))
const CartPage = lazy(() => import('./pages/customer/CartPage'))
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'))
const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const TablesPage = lazy(() => import('./pages/admin/TablesPage'))

// Suspense로 로딩 중 폴백 표시
<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

---

### 패턴 2: SSE 이벤트 기반 상태 업데이트 (Immutable Update)
**적용 NFR**: NFR-FE-PERF-02

SSE 이벤트 수신 시 전체 목록을 재조회하지 않고 로컬 상태만 업데이트합니다.

```typescript
// useSSE.ts
const handleEvent = (event: SSEEvent) => {
  switch (event.type) {
    case 'order.created':
      setOrders(prev => [...prev, event.data])
      break
    case 'order.status_changed':
      setOrders(prev =>
        prev.map(o => o.id === event.data.order_id
          ? { ...o, status: event.data.status }
          : o
        )
      )
      break
    case 'order.deleted':
      setOrders(prev => prev.filter(o => o.id !== event.data.order_id))
      break
    case 'session.completed':
      setOrders(prev => prev.filter(o => o.table_id !== event.data.table_id))
      break
  }
}
```

---

## 보안 패턴

### 패턴 3: Protected Route (라우트 보호)
**적용 NFR**: NFR-FE-SEC-02

인증되지 않은 사용자의 보호된 경로 접근을 차단합니다.

```typescript
// components/ProtectedAdminRoute.tsx
function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

// components/ProtectedCustomerRoute.tsx
function ProtectedCustomerRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <TableSetupScreen />  // 초기 설정 화면
  }
  return <>{children}</>
}
```

---

### 패턴 4: 토큰 만료 자동 처리
**적용 NFR**: NFR-FE-SEC-01

axios 응답 인터셉터에서 401 수신 시 해당 토큰을 삭제하고 로그인 화면으로 리다이렉트합니다.

```typescript
// api/client.ts
adminClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_store_id')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 사용성 패턴

### 패턴 5: 중복 제출 방지 (Optimistic Lock)
**적용 NFR**: NFR-FE-UX-02

주문 제출 중 버튼을 비활성화하여 중복 요청을 방지합니다.

```typescript
// CartPage.tsx
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  if (isSubmitting) return
  setIsSubmitting(true)
  try {
    const order = await customerApi.createOrder(items, token)
    // 5초 카운트다운 후 리다이렉트
    startCountdown(order.order_number)
  } catch (err) {
    setError('주문에 실패했습니다. 다시 시도해주세요.')
  } finally {
    setIsSubmitting(false)
  }
}

// 버튼
<button
  onClick={handleSubmit}
  disabled={isSubmitting}
  data-testid="cart-submit-button"
>
  {isSubmitting ? '주문 중...' : '주문 확정'}
</button>
```

---

### 패턴 6: 5초 카운트다운 리다이렉트
**적용 NFR**: NFR-FE-UX-04

주문 성공 후 5초 카운트다운을 표시하고 자동으로 메뉴 화면으로 이동합니다.

```typescript
const startCountdown = (orderNumber: string) => {
  setOrderNumber(orderNumber)
  let count = 5
  const timer = setInterval(() => {
    count -= 1
    setCountdown(count)
    if (count === 0) {
      clearInterval(timer)
      clearCart()
      navigate('/customer')
    }
  }, 1000)
}
```

---

### 패턴 7: SSE 자동 재연결
**적용 NFR**: NFR-FE-UX-03

SSE 연결이 끊어지면 지수 백오프(exponential backoff)로 재연결을 시도합니다.

```typescript
// sseClient.ts
class SSEClient {
  private retryDelay = 1000  // 초기 1초
  private maxRetryDelay = 30000  // 최대 30초

  connect(token: string, onEvent: (e: SSEEvent) => void) {
    const url = `${API_BASE_URL}/api/sse/orders?token=${token}`
    this.eventSource = new EventSource(url)

    this.eventSource.onmessage = (e) => {
      this.retryDelay = 1000  // 성공 시 리셋
      onEvent(JSON.parse(e.data))
    }

    this.eventSource.onerror = () => {
      this.eventSource?.close()
      setTimeout(() => this.connect(token, onEvent), this.retryDelay)
      this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay)
    }
  }
}
```

---

## 유지보수성 패턴

### 패턴 8: Context + Hook 분리 패턴
**적용 NFR**: NFR-FE-MAINT-02

Context는 상태 저장소 역할만 하고, 비즈니스 로직은 커스텀 훅에 위임합니다.

```typescript
// context/CartContext.tsx - 상태만 관리
export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // localStorage에서 초기값 로드
    const saved = localStorage.getItem('cart_items')
    return saved ? JSON.parse(saved) : []
  })
  // ... 상태 변경 함수들
}

// hooks/useCart.ts - Context 소비 + 편의 로직
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```
