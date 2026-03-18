# 비기능 요구사항 - 백엔드

## 성능 요구사항

### NFR-PERF-01: 실시간 주문 전달
- SSE 이벤트: 주문 생성 후 **2초 이내** 관리자 대시보드에 표시
- 구현: asyncio 기반 비동기 처리, Queue를 통한 즉시 push

### NFR-PERF-02: API 응답 시간
- 메뉴 목록 조회: **3초 이내**
- 주문 생성: **3초 이내**
- 기타 API: **5초 이내**
- 구현: SQLite 인덱스 활용, 불필요한 N+1 쿼리 방지 (SQLAlchemy joinedload)

### NFR-PERF-03: 동시 SSE 연결
- MVP 기준 소규모 매장 (테이블 10~20개) 지원
- 관리자 동시 접속 수: 최대 5명 가정
- asyncio 기반으로 다수 SSE 연결 처리

---

## 보안 요구사항

### NFR-SEC-01: 비밀번호 저장
- 모든 비밀번호(관리자, 테이블)는 **bcrypt** 해싱 후 저장
- 평문 비밀번호는 어디에도 저장하지 않음
- bcrypt work factor: 12 (기본값)

### NFR-SEC-02: JWT 토큰
- 알고리즘: **HS256**
- 시크릿 키: 환경 변수(`SECRET_KEY`)로 관리 (코드에 하드코딩 금지)
- 관리자 토큰 만료: **16시간**
- 테이블 토큰 만료: **24시간** (자동 로그인 유지)
- 토큰 페이로드: `sub`(식별자), `type`(admin/table), `exp`(만료 시각)

### NFR-SEC-03: CORS
- 허용 오리진: 환경 변수(`ALLOWED_ORIGINS`)로 관리
- 개발 환경: `http://localhost:3000` 허용
- 허용 메서드: GET, POST, PATCH, DELETE, OPTIONS
- 허용 헤더: Authorization, Content-Type

### NFR-SEC-04: 입력 검증
- 모든 요청 데이터는 Pydantic 스키마로 자동 검증
- SQL Injection: SQLAlchemy ORM 사용으로 방지
- 민감 정보(비밀번호 해시 등)는 응답 스키마에서 제외

---

## 가용성 요구사항

### NFR-AVAIL-01: 서버 재시작 복구
- SQLite 파일 기반으로 서버 재시작 후 데이터 유지
- SSE 연결은 재시작 시 클라이언트가 자동 재연결 (프론트엔드 처리)

### NFR-AVAIL-02: 에러 격리
- 단일 요청 실패가 다른 요청에 영향 없음
- SSE 연결 중 에러 발생 시 해당 연결만 종료, 다른 연결 유지

---

## 유지보수성 요구사항

### NFR-MAINT-01: 코드 구조
- 레이어 분리: Router → Service → Model (단방향 의존)
- 서비스 간 직접 DB 접근 금지 (반드시 서비스 레이어 통해 접근)
- 환경 변수: `.env` 파일 + `python-dotenv` 사용

### NFR-MAINT-02: 로깅
- FastAPI 기본 로거 사용
- 요청/응답 로그: uvicorn 기본 로그
- 에러 로그: Python logging 모듈

---

## 데이터 무결성 요구사항

### NFR-DATA-01: 트랜잭션
- 세션 종료(이용 완료) 처리는 단일 DB 트랜잭션으로 처리
  (OrderHistory 생성 + Order 삭제 + Table 업데이트 원자적 처리)
- 주문 생성도 단일 트랜잭션 (Order + OrderItem 동시 저장)

### NFR-DATA-02: 데이터 일관성
- OrderItem의 menu_name, unit_price는 주문 시점 스냅샷 저장
  (이후 메뉴 가격 변경 시 기존 주문 영향 없음)
