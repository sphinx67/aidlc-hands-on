# 비기능 요구사항 - 프론트엔드

## NFR-FE-PERF: 성능

### NFR-FE-PERF-01: 초기 로딩
- 메뉴 화면 첫 렌더링: 3초 이내
- 코드 스플리팅으로 초기 번들 크기 최소화 (React.lazy + Suspense)
- 고객 페이지 / 관리자 페이지 번들 분리

### NFR-FE-PERF-02: 실시간 업데이트
- SSE 이벤트 수신 후 UI 반영: 500ms 이내
- 주문 상태 변경 시 해당 카드만 리렌더링 (불필요한 전체 리렌더 방지)

### NFR-FE-PERF-03: 장바구니 반응성
- 수량 조절, 항목 추가/삭제: 즉각 반응 (100ms 이내)
- localStorage 동기화는 비동기로 처리하지 않고 동기 처리 (데이터 일관성)

---

## NFR-FE-UX: 사용성

### NFR-FE-UX-01: 터치 친화적 UI
- 모든 인터랙티브 요소 최소 44×44px
- 버튼 간 충분한 간격 (최소 8px)
- 모바일 우선 레이아웃 (max-width: 480px 기준 고객 화면)

### NFR-FE-UX-02: 로딩 상태 표시
- API 호출 중 LoadingSpinner 표시
- 주문 제출 중 버튼 비활성화 + 로딩 표시 (중복 제출 방지)

### NFR-FE-UX-03: 에러 처리
- API 실패 시 사용자 친화적 에러 메시지 표시
- 네트워크 오류와 비즈니스 오류 구분 메시지
- SSE 연결 끊김 시 재연결 시도 + 상태 표시

### NFR-FE-UX-04: 주문 완료 피드백
- 주문 성공 시 주문 번호 5초 표시 후 자동 리다이렉트
- 카운트다운 표시 (5, 4, 3, 2, 1)

---

## NFR-FE-SEC: 보안

### NFR-FE-SEC-01: 토큰 관리
- JWT 토큰은 localStorage에 저장 (XSS 위험 인지, MVP 범위에서 허용)
- 토큰 만료 시 자동 로그아웃 처리
- 관리자 페이지 접근 시 토큰 유효성 검사

### NFR-FE-SEC-02: 라우트 보호
- `/admin/*` 경로: AdminAuthContext 인증 필수, 미인증 시 `/admin/login` 리다이렉트
- `/customer/*` 경로: AuthContext 인증 필수, 미인증 시 초기 설정 화면 표시

### NFR-FE-SEC-03: 민감 정보
- 테이블 비밀번호는 localStorage에 저장 (자동 로그인 목적, MVP 허용)
- 비밀번호 입력 필드 type="password" 적용

---

## NFR-FE-MAINT: 유지보수성

### NFR-FE-MAINT-01: 타입 안전성
- TypeScript strict 모드 사용
- API 응답 타입 명시적 정의 (types/index.ts 중앙 관리)
- any 타입 사용 금지

### NFR-FE-MAINT-02: 컴포넌트 구조
- 페이지 컴포넌트와 공통 컴포넌트 분리
- 비즈니스 로직은 커스텀 훅으로 분리 (컴포넌트는 UI만 담당)
- Context는 Provider 패턴으로 구현

### NFR-FE-MAINT-03: 환경 변수
- API 기본 URL은 환경 변수로 관리 (`VITE_API_BASE_URL`)
- `.env.example` 제공

---

## NFR-FE-COMPAT: 호환성

### NFR-FE-COMPAT-01: 브라우저 지원
- 최신 Chrome, Safari, Firefox (최근 2버전)
- iOS Safari 지원 (테이블 태블릿/스마트폰 사용 고려)

### NFR-FE-COMPAT-02: SSE 지원
- EventSource API 지원 브라우저 대상
- 미지원 브라우저 폴백: 폴링 방식 미구현 (MVP 범위 외)
