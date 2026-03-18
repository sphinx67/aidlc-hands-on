# 기술 스택 결정 - 백엔드

## 확정된 기술 스택

| 항목 | 선택 | 근거 |
|------|------|------|
| 언어 | Python 3.11+ | 사용자 선택 |
| 웹 프레임워크 | FastAPI | 비동기 지원, 자동 OpenAPI 문서, Pydantic 통합 |
| ORM | SQLAlchemy 2.x | Python 표준 ORM, 타입 안전성 |
| DB | SQLite | 사용자 선택, 설정 간단, 파일 기반 |
| 인증 | python-jose + passlib | JWT 처리, bcrypt 해싱 |
| 비동기 서버 | uvicorn | FastAPI 공식 권장 ASGI 서버 |
| 환경 변수 | python-dotenv | `.env` 파일 관리 |
| 데이터 검증 | Pydantic v2 | FastAPI 내장, 자동 스키마 검증 |

## 주요 라이브러리 버전

```
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-dotenv>=1.0.0
pydantic>=2.0.0
```

## 환경 변수 목록

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `SECRET_KEY` | (필수) | JWT 서명 시크릿 키 |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS 허용 오리진 |
| `DATABASE_URL` | `sqlite:///./table_order.db` | SQLite DB 경로 |
| `ACCESS_TOKEN_EXPIRE_HOURS` | `16` | 관리자 JWT 만료 시간 |
| `TABLE_TOKEN_EXPIRE_HOURS` | `24` | 테이블 토큰 만료 시간 |

## SSE 구현 방식

- FastAPI `StreamingResponse` + `asyncio.Queue` 조합
- 싱글톤 `SSEService` 인스턴스로 store_id별 연결 관리
- `asyncio.Queue`를 통한 이벤트 전달 (스레드 안전)
- 연결 종료 감지: `asyncio.CancelledError` 처리

## DB 초기화 전략

- 앱 시작 시 `Base.metadata.create_all()` 자동 테이블 생성
- `seed.py` 스크립트로 초기 데이터 삽입:
  - 샘플 매장 1개 (store_id: `demo-store`)
  - 관리자 계정 (username: `admin`, password: `admin1234`)
  - 테이블 5개 (1~5번)
  - 카테고리 3개 (음료, 식사, 디저트)
  - 메뉴 10개 (카테고리별 샘플)
