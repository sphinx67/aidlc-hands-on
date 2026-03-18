# 애플리케이션 설계 계획

## 설계 범위
테이블 오더 시스템의 컴포넌트 구조, 서비스 레이어, 컴포넌트 간 의존 관계를 설계합니다.

---

## 실행 체크리스트

- [x] 컴포넌트 식별 및 책임 정의 → `components.md`
- [x] 컴포넌트 메서드 시그니처 정의 → `component-methods.md`
- [x] 서비스 레이어 설계 → `services.md`
- [x] 컴포넌트 의존 관계 정의 → `component-dependency.md`
- [x] 설계 완전성 검증

---

## 설계 질문

아래 질문들에 답변해 주세요. 각 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.

---

## Question 1
백엔드 API 구조를 어떻게 구성하시겠습니까?

A) 기능별 라우터 분리 (예: `/api/customer/`, `/api/admin/`, `/api/sse/`)
B) 리소스별 라우터 분리 (예: `/api/orders/`, `/api/menus/`, `/api/tables/`)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
백엔드 데이터베이스 접근 방식을 어떻게 하시겠습니까?

A) SQLAlchemy ORM (모델 클래스 기반)
B) SQLite 직접 쿼리 (sqlite3 모듈)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
프론트엔드 상태 관리 방식을 어떻게 하시겠습니까?

A) React Context API + useReducer (외부 라이브러리 없음)
B) Zustand (경량 상태 관리 라이브러리)
C) Redux Toolkit
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
프론트엔드 스타일링 방식을 어떻게 하시겠습니까?

A) Tailwind CSS
B) CSS Modules
C) styled-components
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
백엔드와 프론트엔드 간 API 통신 시 CORS 처리를 어떻게 하시겠습니까?
(개발 환경에서 백엔드는 보통 8000번, 프론트엔드는 3000번 포트를 사용합니다)

A) FastAPI CORS 미들웨어로 처리 (개발 시 모든 오리진 허용)
B) 프론트엔드 개발 서버 프록시 설정으로 처리
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

모든 질문에 답변하신 후 "완료"라고 알려주세요.
