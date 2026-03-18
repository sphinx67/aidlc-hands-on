# 비즈니스 로직 모델 - 백엔드

## 핵심 비즈니스 흐름

### 1. 테이블 자동 로그인 흐름

```
[고객 브라우저 시작]
        |
        v
localStorage에 저장된 정보 확인
(store_id, table_number, password)
        |
   저장됨? ----No----> [초기 설정 화면 표시]
        |
       Yes
        |
        v
POST /api/tables/{id}/auth
        |
        v
TableService.authenticate_table()
  1. store_id로 Store 조회
  2. table_number로 Table 조회
  3. bcrypt.verify(password, table.password_hash)
  4. current_session_id 확인
     - null이면: UUID v4 생성 → Table.current_session_id 저장
     - 있으면: 기존 session_id 유지
  5. 테이블 토큰(JWT) 발급
        |
        v
[메뉴 화면으로 이동]
```

---

### 2. 주문 생성 흐름

```
[고객: 주문 확정 버튼 클릭]
        |
        v
POST /api/orders
Body: { table_id, session_id, items: [{menu_id, quantity}] }
        |
        v
OrderService.create_order()
  1. 각 menu_id로 Menu 조회 (is_available 검증)
  2. OrderItem 목록 구성 (menu_name, unit_price 스냅샷)
  3. total_amount 계산
  4. 주문 번호 생성 (ORD-YYYYMMDD-NNNN)
  5. Order + OrderItem DB 저장
  6. SSEService.broadcast("order.created", order_data)
        |
        v
[주문 번호 반환 → 프론트엔드 5초 표시 후 메뉴 화면]
```

---

### 3. 실시간 주문 모니터링 흐름

```
[관리자: 대시보드 접속]
        |
        v
GET /api/sse/orders?store_id={store_id}
(Authorization: Bearer {admin_jwt})
        |
        v
SSEService.event_generator(store_id)
  1. asyncio.Queue 생성 → store_id별 connections에 등록
  2. 초기 데이터: 현재 활성 주문 전체 전송
  3. 루프: Queue에서 이벤트 꺼내 SSE 형식으로 전송
     data: {"type": "order.created", "data": {...}}\n\n
  4. 연결 종료 시: Queue 제거
        |
        v
[주문 생성/변경/삭제 시 OrderService → SSEService.broadcast()]
  → 해당 store_id의 모든 Queue에 이벤트 push
  → 연결된 모든 관리자 브라우저에 실시간 전달
```

---

### 4. 테이블 세션 종료 흐름

```
[관리자: 이용 완료 버튼 클릭]
        |
        v
POST /api/tables/{table_id}/complete
(Authorization: Bearer {admin_jwt})
        |
        v
TableService.complete_session()
  1. Table 조회 → current_session_id 확인 (null이면 HTTP 400)
  2. OrderHistoryService.move_to_history(table_id, session_id)
     a. 해당 session_id의 Order 목록 조회
     b. 각 Order → OrderHistory 복사 (completed_at = now())
     c. 각 OrderItem → OrderHistoryItem 복사
     d. 원본 OrderItem 삭제
     e. 원본 Order 삭제
  3. Table.current_session_id = null
  4. SSEService.broadcast("session.completed", {table_id})
        |
        v
[테이블 리셋 완료 → 새 고객 이용 가능]
```

---

### 5. SSE 이벤트 구조

```json
// 신규 주문
{
  "type": "order.created",
  "data": {
    "order_id": 1,
    "order_number": "ORD-20260318-0001",
    "table_id": 1,
    "table_number": 3,
    "session_id": "uuid-v4",
    "status": "PENDING",
    "total_amount": 25000,
    "items": [{"menu_name": "아메리카노", "quantity": 2, "unit_price": 5000}],
    "created_at": "2026-03-18T10:00:00"
  }
}

// 상태 변경
{
  "type": "order.status_changed",
  "data": {
    "order_id": 1,
    "order_number": "ORD-20260318-0001",
    "table_id": 1,
    "status": "PREPARING"
  }
}

// 주문 삭제
{
  "type": "order.deleted",
  "data": {
    "order_id": 1,
    "table_id": 1
  }
}

// 세션 종료
{
  "type": "session.completed",
  "data": {
    "table_id": 1,
    "table_number": 3
  }
}
```

---

## 주문 번호 생성 알고리즘

```python
def generate_order_number(db: Session, today: date) -> str:
    prefix = f"ORD-{today.strftime('%Y%m%d')}-"
    # 오늘 날짜의 마지막 주문 번호 조회
    last_order = db.query(Order)\
        .filter(Order.order_number.like(f"{prefix}%"))\
        .order_by(Order.order_number.desc())\
        .first()
    if last_order:
        last_seq = int(last_order.order_number.split("-")[-1])
        seq = last_seq + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"
```

---

## 에러 처리 전략

| 상황 | HTTP 상태 | 응답 |
|------|-----------|------|
| 리소스 없음 | 404 | `{"detail": "Not found"}` |
| 인증 실패 | 401 | `{"detail": "Unauthorized"}` |
| 권한 없음 | 403 | `{"detail": "Forbidden"}` |
| 중복 데이터 | 409 | `{"detail": "Conflict"}` |
| 잘못된 요청 | 400 | `{"detail": "설명"}` |
| 유효성 검증 실패 | 422 | Pydantic 자동 처리 |
