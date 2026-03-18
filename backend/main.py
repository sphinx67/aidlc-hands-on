from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from services.sse_service import SSEService
from routers import auth, tables, menus, orders, order_history, sse

# 앱 초기화
app = FastAPI(title="테이블오더 API", version="1.0.0")

# CORS 미들웨어
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SSE 싱글톤 생성 및 라우터에 주입
sse_service = SSEService()
tables.set_sse_service(sse_service)
orders.set_sse_service(sse_service)
sse.set_sse_service(sse_service)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tables.router, prefix="/api/tables", tags=["tables"])
app.include_router(menus.router, prefix="/api/menus", tags=["menus"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(order_history.router, prefix="/api/order-history", tags=["order-history"])
app.include_router(sse.router, prefix="/api/sse", tags=["sse"])


@app.on_event("startup")
async def startup():
    """앱 시작 시 DB 테이블 자동 생성"""
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok"}
