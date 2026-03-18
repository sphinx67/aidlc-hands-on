# 기술 스택 결정 - 프론트엔드

## 확정된 기술 스택

| 항목 | 선택 | 근거 |
|------|------|------|
| 언어 | TypeScript | 타입 안전성, IDE 지원 |
| UI 프레임워크 | React 18 | 사용자 선택, 생태계 |
| 빌드 도구 | Vite | 빠른 HMR, 간단한 설정 |
| 스타일링 | Tailwind CSS | 사용자 선택, 유틸리티 클래스 |
| 라우팅 | React Router v6 | React 표준 라우팅 |
| HTTP 클라이언트 | axios | 인터셉터, 에러 처리 편의성 |
| 상태 관리 | Context API | 사용자 선택, 외부 라이브러리 불필요 |
| 실시간 | EventSource (SSE) | 브라우저 내장, 단방향 스트림에 적합 |

## 주요 패키지 버전

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 백엔드 API 기본 URL |

## 디렉토리 구조

```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── index.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── customerApi.ts
│   │   ├── adminApi.ts
│   │   └── sseClient.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── AdminAuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAdminAuth.ts
│   │   ├── useCart.ts
│   │   ├── useOrders.ts
│   │   └── useSSE.ts
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── OrdersPage.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       └── TablesPage.tsx
│   └── components/
│       ├── MenuCard.tsx
│       ├── CartItem.tsx
│       ├── OrderCard.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## SSE 인증 처리 방식

EventSource는 커스텀 헤더를 지원하지 않으므로 토큰을 URL 쿼리 파라미터로 전달합니다.

```
GET /api/sse/orders?token={jwt_token}
```

백엔드 SSE 라우터에서 `?token=` 파라미터를 허용하도록 수정이 필요합니다.
(현재 백엔드는 Bearer 헤더만 지원 → NFR Design 단계에서 처리)

## 코드 스플리팅 전략

```typescript
// App.tsx에서 lazy import
const CustomerMenuPage = lazy(() => import('./pages/customer/MenuPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
```

고객 페이지 번들과 관리자 페이지 번들을 분리하여 초기 로딩 최적화.
