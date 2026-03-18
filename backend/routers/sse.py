from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from services.auth_service import decode_admin_token
from services.sse_service import SSEService

router = APIRouter()
_sse: SSEService = None


def set_sse_service(sse: SSEService):
    global _sse
    _sse = sse


@router.get("/orders")
async def sse_orders(token: str = Query(...)):
    """SSE 실시간 스트림 - EventSource는 헤더 미지원으로 쿼리 파라미터 토큰 사용"""
    admin = decode_admin_token(token)
    return StreamingResponse(
        _sse.event_generator(admin.store_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
