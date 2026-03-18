# 비즈니스 규칙 - 백엔드

## 인증 규칙

### BR-AUTH-01: 관리자 로그인
- store_id + admin_username + password 세 가지 모두 일치해야 로그인 성공
- 비밀번호는 bcrypt로 검증 (평문 비교 금지)
- 성공 시 JWT 토큰 발급, 만료 시간: 발급 시각 + 16시간
- 실패 시 HTTP 401 반환 (구체적인 실패 원인 노출 금지)

### BR-AUTH-02: 테이블 인증
- store_id + table_number + password 세 가지 모두 일치해야 인증 성공
- 비밀번호는 bcrypt로 검증
- 성공 시 테이블 토큰 발급 + 새 session_id(UUID v4) 생성 및 Table.current_session_id 저장
- 이미 session_id가 있는 경우: 기존 session_id 유지 (재로그인 시 세션 유지)
- 테이블 비밀번호 미설정(password_hash = null) 시 HTTP 403 반환

### BR-AUTH-03: JWT 토큰 검증
- 모든 관리자 전용 엔드포인트는 Authorization: Bearer {token} 헤더 필수
- 만료된 토큰: HTTP 401 반환
- 유효하지 않은 토큰: HTTP 401 반환

---

## 주문 규칙

### BR-ORDER-01: 주문 생성
- 주문 항목(items)은 최소 1개 이상이어야 함
- 각 항목의 quantity는 1 이상이어야 함
- total_amount = sum(unit_price × quantity) for all items
- 주문 번호 형식: `ORD-YYYYMMDD-{4자리 순번}` (예: ORD-20260318-0001)
- 주문 생성 시 menu_name, unit_price는 Menu 테이블에서 조회하여 스냅샷으로 저장 (이후 메뉴 변경 영향 없음)
- 주문 생성 성공 시 SSE 이벤트 `order.created` 발행

### BR-ORDER-02: 주문 상태 전이
- 허용된 상태 전이: PENDING → PREPARING → COMPLETED
- 역방향 전이 불가 (COMPLETED → PREPARING 등)
- 상태 변경 성공 시 SSE 이벤트 `order.status_changed` 발행

### BR-ORDER-03: 주문 삭제
- 관리자만 삭제 가능
- 삭제 성공 시 SSE 이벤트 `order.deleted` 발행
- 삭제된 주문은 복구 불가 (소프트 삭제 없음)

### BR-ORDER-04: 고객 주문 조회 필터링
- table_id + session_id 기준으로 현재 세션 주문만 반환
- 세션 종료(이용 완료) 처리된 주문(OrderHistory로 이동된 주문)은 반환하지 않음
- 정렬: created_at ASC (오래된 주문 먼저)

### BR-ORDER-05: 관리자 주문 조회
- store_id 기준 현재 활성 주문 전체 반환 (모든 테이블)
- OrderHistory로 이동된 주문은 포함하지 않음

---

## 테이블 세션 규칙

### BR-TABLE-01: 테이블 초기 설정
- table_number는 해당 매장 내 유일해야 함 (중복 시 HTTP 409 반환)
- password는 bcrypt 해싱 후 저장
- 설정 완료 후 테이블 is_active = True

### BR-TABLE-02: 세션 종료(이용 완료)
- 현재 세션(current_session_id)의 모든 Order + OrderItem을 OrderHistory + OrderHistoryItem으로 복사
- 복사 완료 후 원본 Order + OrderItem 삭제
- Table.current_session_id = null로 초기화
- completed_at = 현재 시각 기록
- SSE 이벤트 `order.deleted` 발행 (해당 테이블의 모든 주문 삭제 알림)
- current_session_id가 null인 경우(활성 세션 없음): HTTP 400 반환

---

## 메뉴 규칙

### BR-MENU-01: 메뉴 조회
- is_available = True인 메뉴만 반환
- display_order ASC 정렬
- category_id 파라미터 없으면 전체 메뉴 반환

### BR-MENU-02: 카테고리 조회
- display_order ASC 정렬
- 메뉴가 없는 카테고리도 반환

---

## 데이터 검증 규칙

### BR-VALID-01: 공통
- store_id 존재 여부 검증 (없으면 HTTP 404)
- table_id 존재 여부 및 소속 매장 검증 (없거나 다른 매장이면 HTTP 404)

### BR-VALID-02: 주문 생성
- 각 menu_id가 해당 매장의 메뉴인지 검증
- is_available = False인 메뉴 주문 시 HTTP 400 반환
- quantity < 1 시 HTTP 422 반환

### BR-VALID-03: 가격 검증
- price >= 0 (음수 불가)
- quantity >= 1
