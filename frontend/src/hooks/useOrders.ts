import { useState, useEffect, useCallback } from 'react'
import { customerApi } from '../api/customerApi'
import type { Order } from '../types'

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await customerApi.getOrders()
            setOrders(data)
        } catch {
            setError('주문 내역을 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetch() }, [fetch])

    return { orders, isLoading, error, refetch: fetch }
}
