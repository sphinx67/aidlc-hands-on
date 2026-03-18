import { useState, useEffect, useRef, useCallback } from 'react'
import { SSEClient } from '../api/sseClient'
import { adminApi } from '../api/adminApi'
import type { Order, SSEEvent } from '../types'

export function useSSE(token: string | null) {
    const [orders, setOrders] = useState<Order[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const clientRef = useRef<SSEClient | null>(null)

    const handleEvent = useCallback((event: SSEEvent) => {
        if (event.type === 'order.created') {
            const order = event.data as unknown as Order
            setOrders((prev) => [...prev, order])
        } else if (event.type === 'order.status_changed') {
            const { order_id, status } = event.data as { order_id: number; status: string }
            setOrders((prev) => prev.map((o) => o.id === order_id ? { ...o, status: status as Order['status'] } : o))
        } else if (event.type === 'order.deleted') {
            const { order_id } = event.data as { order_id: number }
            setOrders((prev) => prev.filter((o) => o.id !== order_id))
        } else if (event.type === 'session.completed') {
            const { table_id } = event.data as { table_id: number }
            setOrders((prev) => prev.filter((o) => o.table_id !== table_id))
        }
    }, [])

    useEffect(() => {
        if (!token) return

        // 초기 주문 목록 로드
        adminApi.getOrders().then(setOrders).catch(() => { })

        // SSE 연결
        const client = new SSEClient()
        clientRef.current = client
        client.connect(token, handleEvent, setIsConnected)

        return () => {
            client.disconnect()
            setIsConnected(false)
        }
    }, [token, handleEvent])

    return { orders, setOrders, isConnected }
}
