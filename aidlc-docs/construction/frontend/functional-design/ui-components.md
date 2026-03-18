# UI 컴포넌트 정의 - 프론트엔드

## 라우팅 구조

```
/                        → 루트 (자동 리다이렉트: 로그인 상태에 따라 분기)
/customer                → 고객 메뉴 화면 (기본 홈)
/customer/cart           → 장바구니
/customer/orders         → 주문 내역
/admin/login             → 관리자 로그인
/admin/dashboard         → 관리자 대시보드 (실시간 주문 모니터링)
/admin/tables            → 테이블 관리
```

---

## 페이지 컴포넌트

### CustomerMenuPage (`/customer`)
**책임**: 메뉴 목록 표시, 카테고리 탭 전환, 장바구니 진입

**렌더링 요소**:
- 카테고리 탭 바 (수평 스크롤)
- 메뉴 카드 그리드 (MenuCard 컴포넌트)
- 하단 고정 장바구니 버튼 (총 금액 + 아이템 수 표시)
- 로딩 스피너 (데이터 로딩 중)

**상태**:
- `selectedCategoryId: number | null` - 선택된 카테고리
- `categories: Category[]` - 카테고리 목록
- `menus: Menu[]` - 현재 카테고리 메뉴 목록

**동작**:
- 마운트 시 카테고리 + 메뉴 API 호출
- 카테고리 탭 클릭 → 해당 카테고리 메뉴 필터링
- 메뉴 카드 "담기" 클릭 → CartContext.addItem()

---

### CustomerCartPage (`/customer/cart`)
**책임**: 장바구니 목록 확인, 수량 조절, 주문 확정

**렌더링 요소**:
- CartItem 목록 (수량 조절 버튼 포함)
- 총 금액 표시
- 주문 확정 버튼 (data-testid="cart-submit-button")
- 장바구니 비우기 버튼
- 빈 장바구니 안내 메시지

**상태**:
- `isSubmitting: boolean` - 주문 제출 중
- `orderNumber: string | null` - 주문 성공 시 번호 (5초 표시)

**동작**:
- 주문 확정 → POST /api/orders → 성공 시 5초 카운트다운 → 장바구니 비우기 → /customer 리다이렉트
- 실패 시 에러 토스트 표시, 장바구니 유지

---

### CustomerOrdersPage (`/customer/orders`)
**책임**: 현재 세션 주문 내역 표시

**렌더링 요소**:
- OrderCard 목록 (주문 시간 오름차순)
- 주문 없음 안내 메시지
- 새로고침 버튼

**상태**:
- `orders: Order[]`
- `isLoading: boolean`

---

### AdminLoginPage (`/admin/login`)
**책임**: 관리자 로그인 폼

**렌더링 요소**:
- 매장 식별자 입력 (data-testid="login-store-id-input")
- 사용자명 입력 (data-testid="login-username-input")
- 비밀번호 입력 (data-testid="login-password-input")
- 로그인 버튼 (data-testid="login-submit-button")
- 에러 메시지

**동작**:
- 로그인 성공 → JWT 저장 → /admin/dashboard 리다이렉트
- 실패 → 에러 메시지 표시

---

### AdminDashboardPage (`/admin/dashboard`)
**책임**: 실시간 주문 모니터링 그리드

**렌더링 요소**:
- 테이블별 OrderCard 그리드
- SSE 연결 상태 표시
- 테이블 필터 탭
- 신규 주문 강조 애니메이션

**상태**:
- `orders: Order[]` - SSE로 실시간 업데이트
- `isConnected: boolean` - SSE 연결 상태
- `selectedTableId: number | null` - 필터

**동작**:
- 마운트 시 SSE 연결 + 초기 주문 목록 로드
- SSE 이벤트 수신 → 주문 목록 업데이트
- 주문 상태 변경 버튼 → PATCH /api/orders/{id}/status
- 주문 삭제 버튼 → Modal 확인 → DELETE /api/orders/{id}

---

### AdminTablesPage (`/admin/tables`)
**책임**: 테이블 관리 (초기 설정, 세션 종료, 과거 내역)

**렌더링 요소**:
- 테이블 목록 카드
- 테이블 초기 설정 Modal (비밀번호 입력)
- 세션 종료 확인 Modal
- 과거 주문 내역 Modal (OrderHistoryItem 목록)

**동작**:
- 초기 설정 → POST /api/tables/{id}/setup
- 세션 종료 → 확인 Modal → POST /api/tables/{id}/complete
- 과거 내역 → GET /api/order-history?table_id={id}

---

## 공통 컴포넌트

### MenuCard
**Props**: `menu: Menu`, `onAdd: (menu: Menu) => void`

```
┌─────────────────────┐
│  [이미지]           │
│  메뉴명             │
│  설명 (2줄 말줄임)  │
│  ₩4,500    [담기]   │
└─────────────────────┘
```
- data-testid="menu-card-{menu.id}"
- 담기 버튼: data-testid="menu-add-button-{menu.id}"

### CartItem
**Props**: `item: CartItem`, `onUpdate: (id, qty) => void`, `onRemove: (id) => void`

```
메뉴명          [-] 2 [+]    ₩9,000  [삭제]
```
- 수량 감소: data-testid="cart-item-decrease-{menuId}"
- 수량 증가: data-testid="cart-item-increase-{menuId}"
- 삭제: data-testid="cart-item-remove-{menuId}"

### OrderCard
**Props**: `order: Order`, `onStatusChange?: (id, status) => void`, `onDelete?: (id) => void`

```
┌─────────────────────────────────┐
│ ORD-20260318-0001  [PENDING]    │
│ 10:30              테이블 3     │
│ • 아메리카노 x2    ₩9,000       │
│ • 크로크무슈 x1    ₩9,000       │
│ 합계: ₩18,000                   │
│ [준비중으로 변경]  [삭제]        │
└─────────────────────────────────┘
```
- 상태 배지: PENDING=노란색, PREPARING=파란색, COMPLETED=초록색
- data-testid="order-card-{order.id}"

### Modal
**Props**: `isOpen: boolean`, `title: string`, `onConfirm: () => void`, `onCancel: () => void`

- 확인 버튼: data-testid="modal-confirm-button"
- 취소 버튼: data-testid="modal-cancel-button"

### LoadingSpinner
- 전체 화면 또는 인라인 로딩 표시

---

## 고객 화면 플로우

```
앱 접속
  │
  ▼
localStorage 확인
  │
  ├─ 없음 → 초기 설정 화면 (store_id, table_number, password 입력)
  │
  └─ 있음 → POST /api/tables/auth (자동 로그인)
              │
              ├─ 성공 → /customer (메뉴 화면)
              └─ 실패 → 초기 설정 화면
```
