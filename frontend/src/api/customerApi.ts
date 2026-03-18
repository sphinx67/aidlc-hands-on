import { customerClient } from './client'
import type { Category, Menu, Order } from '../types'

export const customerApi = {
    async authenticateTable(storeId: string, tableNumber: number, password: string) {
        const res = await customerClient.post('/api/tables/auth', {
            store_id: storeId,
            table_number: tableNumber,
            password,
        })
        return res.data as {
            access_token: string
            table_id: number
            table_number: number
            session_id: string
        }
    },

    async getCategories(storeId: string): Promise<Category[]> {
        const res = await customerClient.get('/api/menus/categories', {
            params: { store_id: storeId },
        })
        return res.data
    },

    async getMenus(storeId: string, categoryId?: number): Promise<Menu[]> {
        const res = await customerClient.get('/api/menus', {
            params: { store_id: storeId, ...(categoryId != null && { category_id: categoryId }) },
        })
        return res.data
    },

    async createOrder(items: { menu_id: number; quantity: number }[]): Promise<Order> {
        const res = await customerClient.post('/api/orders', { items })
        return res.data
    },

    async getOrders(): Promise<Order[]> {
        const res = await customerClient.get('/api/orders')
        return res.data
    },
}
