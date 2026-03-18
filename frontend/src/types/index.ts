export interface Category {
    id: number
    name: string
    display_order: number
}

export interface Menu {
    id: number
    category_id: number
    name: string
    price: number
    description: string | null
    image_url: string | null
    display_order: number
    is_available: boolean
}

export interface CartItem {
    menuId: number
    menuName: string
    unitPrice: number
    quantity: number
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING: '대기중',
    PREPARING: '준비중',
    COMPLETED: '완료',
}

export const ORDER_STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: 'PREPARING',
    PREPARING: 'COMPLETED',
}

export interface OrderItem {
    id: number
    menu_id: number
    menu_name: string
    unit_price: number
    quantity: number
}

export interface Order {
    id: number
    order_number: string
    table_id: number
    session_id: string
    status: OrderStatus
    total_amount: number
    items: OrderItem[]
    created_at: string
}

export interface OrderHistoryItem {
    id: number
    menu_name: string
    unit_price: number
    quantity: number
}

export interface OrderHistory {
    id: number
    order_number: string
    table_id: number
    session_id: string
    status: OrderStatus
    total_amount: number
    items: OrderHistoryItem[]
    ordered_at: string
    completed_at: string
}

export interface TableInfo {
    id: number
    table_number: number
    current_session_id: string | null
    is_active: boolean
    has_password: boolean
    created_at: string
}

export interface SSEEvent {
    type: 'connected' | 'order.created' | 'order.status_changed' | 'order.deleted' | 'session.completed'
    data?: Record<string, unknown>
}
