# 유닛 의존 관계

## 의존 관계 매트릭스

| 유닛 | backend | frontend |
|------|---------|----------|
| backend | - | 없음 |
| frontend | 의존 (REST API, SSE) | - |

## 의존 방향

```
[frontend] --HTTP REST API--> [backend]
[frontend] <--SSE 이벤트------ [backend]
```

- **frontend → backend**: 모든 데이터 요청 (메뉴, 주문, 인증 등)
- **backend → frontend**: SSE 이벤트 스트림 (실시간 주문 알림)

## 개발 순서

1. **backend 먼저 개발**: API 스펙 확정 후 프론트엔드 개발 가능
2. **frontend 이후 개발**: 백엔드 API에 의존하므로 API 스펙 기준으로 개발

## 통합 포인트

| 포인트 | 방식 | 설명 |
|--------|------|------|
| REST API | HTTP/JSON | 모든 CRUD 요청 |
| SSE | EventSource | 관리자 실시간 주문 수신 |
| CORS | FastAPI 미들웨어 | 개발 시 localhost:3000 허용 |

## 배포 구성

```
[사용자 브라우저]
      |
      +---> frontend (localhost:3000 / 정적 파일 서버)
      |
      +---> backend  (localhost:8000 / FastAPI 서버)
```
