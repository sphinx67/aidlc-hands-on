# 테이블오더 앱

FastAPI + React(TypeScript) 기반 테이블 오더 시스템입니다.

## 구조

```
aidlc-hands-on/
├── backend/    # Python FastAPI 서버 (포트 8000)
└── frontend/   # React + Vite 앱 (포트 3000)
```

## 빠른 시작

### 백엔드

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py             # 초기 데이터 삽입
uvicorn main:app --reload --port 8000
```

### 프론트엔드

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # http://localhost:3000
```

## 접속

| 경로 | 설명 |
|------|------|
| http://localhost:3000/customer | 고객 메뉴 화면 |
| http://localhost:3000/admin/login | 관리자 로그인 |
| http://localhost:8000/docs | API 문서 (Swagger) |

## 기본 계정 (시드 데이터)

| 구분 | 값 |
|------|-----|
| 매장 ID | `demo-store` |
| 관리자 ID | `admin` |
| 관리자 비밀번호 | `admin1234` |
| 테이블 번호 | 1 ~ 5 |
| 테이블 비밀번호 | `table1234` |
