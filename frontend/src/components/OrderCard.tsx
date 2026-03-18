import type { Order, OrderStatus } from '../types'
import { ORDER_STATUS_LABEL, ORDER_STATUS_NEXT } from '../types'

const STATUS_COLOR: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PREPARING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
}

interface OrderCardProps {
    order: Order
    onStatusChange?: (orderId: number, status: OrderStatus) => void
    onDelete?: (orderId: number) => void
}

export function OrderCard({ order, onStatusChange, onDelete }: OrderCardProps) {
    const nextStatus = ORDER_STATUS_NEXT[order.status]

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            data-testid={`order-card-${order.id}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{order.order_number}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
                {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                {' · '}테이블 {order.table_id}
            </p>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
                {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                        <span>{item.menu_name} × {item.quantity}</span>
                        <span>₩{(item.unit_price * item.quantity).toLocaleString()}</span>
                    </li>
                ))}
            </ul>
            <div className="flex items-center justify-between border-t pt-2">
                <span className="font-bold text-gray-900">합계 ₩{order.total_amount.toLocaleString()}</span>
                <div className="flex gap-2">
                    {nextStatus && onStatusChange && (
                        <button
                            onClick={() => onStatusChange(order.id, nextStatus)}
                            className="text-xs px-3 py-2 bg-blue-500 text-white rounded-lg min-h-[44px]"
                        >
                            {ORDER_STATUS_LABEL[nextStatus]}으로 변경
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(order.id)}
                            className="text-xs px-3 py-2 bg-red-100 text-red-600 rounded-lg min-h-[44px]"
                        >
                            삭제
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
