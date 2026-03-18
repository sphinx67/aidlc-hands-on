# 서비스 레이어 설계

## 서비스 아키텍처 개요

```
[클라이언트]
     |
     v
[FastAPI 라우터]  ←→  [FastAPI 의존성 주입 (get_db, get_current_admin, get_current_table)]
     |
     v
[서비스 레이어]   ←→  [SSEService (비동기 이벤트 브로드캐스트)]
     |
     v
[SQLAlchemy ORM]
     |
     v
[SQLite DB]
```

---

## 서비스별 상세 설계

### AuthService
**역할**: 인증/인가 전담

**주요 흐름**:
1. 관리자 로그인: 매장 식별자 + 사용자명 + 비밀번호 검증 → bcrypt 비교 → JWT 발급 (16시간 만료)
2. 테이블 인증: 매장 식별자 + 테이블 번호 + 비밀번호 검증 → 테이블 토큰 발급
3. 토큰 검증: FastAPI Depends를 통해 모든 보호된 엔드포인트에서 자동 실행

**의존성**: 없음 (독립 서비스)

---

### TableService
**역할**: 테이블 생명주기 관리

**주요 흐름**:
1. 테이블 초기 설정: 테이블 번호 + 비밀번호 저장 (비밀번호는 bcrypt 해싱)
2. 테이블 인증: 저장된 해시와 비교 → 성공 시 세션 ID(UUID) 생성 및 저장
3. 세션 종료(이용 완료):
   - OrderHistoryService.move_to_history() 호출
   - 테이블의 current_session_id 초기화
   - 완료 피드백 반환

**의존성**: OrderHistoryService, AuthService

---

### MenuService
**역할**: 메뉴 데이터 조회 전담 (읽기 전용, MVP 기준)

**주요 흐름**:
1. 카테고리 목록: store_id 기준 카테고리 조회, display_order 정렬
2. 메뉴 목록: store_id + category_id(선택) 기준 조회, display_order 정렬
3. 메뉴 상세: menu_id 기준 단건 조회

**의존성**: 없음 (독립 서비스)

---

### OrderService
**역할**: 주문 생성/조회/상태 변경/삭제 + SSE 이벤트 발행

**주요 흐름**:
1. 주문 생성:
   - OrderItem 목록으로 총 금액 계산
   - Order + OrderItem DB 저장
   - SSEService.broadcast()로 신규 주문 이벤트 발행
2. 주문 조회 (고객용): table_id + session_id 기준 현재 세션 주문만 반환
3. 주문 조회 (관리자용): store_id 기준 전체 활성 주문 반환 (테이블별 그룹화)
4. 상태 변경: 상태 업데이트 → SSEService.broadcast()로 상태 변경 이벤트 발행
5. 주문 삭제: 삭제 → SSEService.broadcast()로 삭제 이벤트 발행

**의존성**: SSEService

---

### OrderHistoryService
**역할**: 세션 종료 시 주문 이력 이동 및 과거 이력 조회

**주요 흐름**:
1. 이력 이동 (TableService에서 호출):
   - 해당 세션의 Order + OrderItem 조회
   - OrderHistory + OrderHistoryItem으로 복사
   - 원본 Order + OrderItem 삭제
   - completed_at 기록
2. 과거 이력 조회: table_id + 날짜 범위 기준 OrderHistory 조회

**의존성**: 없음 (독립 서비스)

---

### SSEService
**역할**: 관리자 대시보드 실시간 업데이트를 위한 SSE 연결 관리

**주요 흐름**:
1. 연결 등록: 관리자가 SSE 엔드포인트 접속 시 store_id별 큐(Queue) 등록
2. 이벤트 발행: OrderService에서 주문 변경 시 해당 store_id의 모든 큐에 이벤트 push
3. 이벤트 스트림: 큐에서 이벤트를 꺼내 SSE 형식(`data: {...}\n\n`)으로 클라이언트에 전송
4. 연결 해제: 클라이언트 연결 종료 시 큐 제거

**이벤트 타입**:
- `order.created`: 신규 주문 생성
- `order.status_changed`: 주문 상태 변경
- `order.deleted`: 주문 삭제

**의존성**: 없음 (독립 서비스, 싱글톤 패턴)

---

## 프론트엔드 서비스 설계

### apiClient (공통)
- axios 인스턴스, baseURL: `http://localhost:8000`
- 요청 인터셉터: Authorization 헤더 자동 주입 (localStorage 토큰)
- 응답 인터셉터: 401 시 로그아웃 처리

### customerApi
- `getCategories(storeId)` → GET /api/menus/categories
- `getMenus(storeId, categoryId?)` → GET /api/menus
- `authenticateTable(storeId, tableNumber, password)` → POST /api/tables/{id}/auth
- `createOrder(tableId, sessionId, items)` → POST /api/orders
- `getOrders(tableId, sessionId)` → GET /api/orders

### adminApi
- `login(storeId, username, password)` → POST /api/auth/login
- `getTables(storeId)` → GET /api/tables
- `setupTable(tableId, tableNumber, password)` → POST /api/tables/{id}/setup
- `completeSession(tableId)` → POST /api/tables/{id}/complete
- `updateOrderStatus(orderId, status)` → PATCH /api/orders/{id}/status
- `deleteOrder(orderId)` → DELETE /api/orders/{id}
- `getOrderHistory(tableId, dateFrom?, dateTo?)` → GET /api/order-history

### sseClient
- `connect(storeId, token, onEvent)` → EventSource 연결
- `disconnect()` → EventSource 닫기
- 자동 재연결 로직 포함
