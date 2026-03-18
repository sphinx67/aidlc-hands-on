import { adminClient } from './client'
import type { Order, OrderHistory, OrderStatus, TableInfo } from '../types'

export const adminApi = {
    async login(storeId: string, username: string, password: string) {
        const res = await adminClient.post('/api/auth/login', {
            store_id: storeId,
            username,
            password,
        })
        return res.data as { access_token: string; token_type: string }
    },

    async getOrders(): Promise<Order[]> {
        const res = await adminClient.get('/api/orders')
        return res.data
    },

    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
        const res = await adminClient.patch(`/api/orders/${orderId}/status`, { status })
        return res.data
    },

    async deleteOrder(orderId: number): Promise<void> {
        await adminClient.delete(`/api/orders/${orderId}`)
    },

    async getTables(): Promise<TableInfo[]> {
        const res = await adminClient.get('/api/tables')
        return res.data
    },

    async createTable(tableNumber: number): Promise<TableInfo> {
        const res = await adminClient.post('/api/tables', { table_number: tableNumber })
        return res.data
    },

    async setupTable(tableId: number, password: string): Promise<TableInfo> {
        const res = await adminClient.post(`/api/tables/${tableId}/setup`, { password })
        return res.data
    },

    async completeSession(tableId: number): Promise<void> {
        await adminClient.post(`/api/tables/${tableId}/complete`)
    },

    async getOrderHistory(tableId?: number): Promise<OrderHistory[]> {
        const res = await adminClient.get('/api/order-history', {
            params: tableId != null ? { table_id: tableId } : {},
        })
        return res.data
    },
}
