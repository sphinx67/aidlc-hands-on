import asyncio
import json
from typing import Dict, List


class SSEService:
    """SSE 실시간 이벤트 서비스 (싱글톤)
    store_id별 asyncio.Queue 목록을 관리하여 이벤트를 push 방식으로 전달합니다.
    """

    def __init__(self):
        self._connections: Dict[str, List[asyncio.Queue]] = {}

    def _add_connection(self, store_id: str, queue: asyncio.Queue) -> None:
        if store_id not in self._connections:
            self._connections[store_id] = []
        self._connections[store_id].append(queue)

    def _remove_connection(self, store_id: str, queue: asyncio.Queue) -> None:
        if store_id in self._connections:
            self._connections[store_id].discard(queue) if hasattr(
                self._connections[store_id], "discard"
            ) else None
            try:
                self._connections[store_id].remove(queue)
            except ValueError:
                pass
            if not self._connections[store_id]:
                del self._connections[store_id]

    async def broadcast(self, store_id: str, event: dict) -> None:
        """해당 store_id에 연결된 모든 클라이언트에 이벤트 전송"""
        if store_id in self._connections:
            for queue in list(self._connections[store_id]):
                await queue.put(event)

    async def event_generator(self, store_id: str):
        """SSE 이벤트 스트림 제너레이터"""
        queue: asyncio.Queue = asyncio.Queue()
        self._add_connection(store_id, queue)
        try:
            yield f"data: {json.dumps({'type': 'connected', 'store_id': store_id})}\n\n"
            while True:
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self._remove_connection(store_id, queue)
