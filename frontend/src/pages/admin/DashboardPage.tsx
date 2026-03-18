import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useSSE } from '../../hooks/useSSE'
import { adminApi } from '../../api/adminApi'
import { OrderCard } from '../../components/OrderCard'
import { Modal } from '../../components/Modal'
import type { OrderStatus } from '../../types'

export default function DashboardPage() {
    const navigate = useNavigate()
    const { token, logout } = useAdminAuth()
    const { orders, setOrders, isConnected } = useSSE(token)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [filterTableId, setFilterTableId] = useState<number | null>(null)

    const tableIds = [...new Set(orders.map((o) => o.table_id))].sort((a, b) => a - b)
    const filtered = filterTableId == null ? orders : orders.filter((o) => o.table_id === filterTableId)

    const handleStatusChange = async (orderId: number, status: OrderStatus) => {
        const updated = await adminApi.updateOrderStatus(orderId, status)
        setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o))
    }

    const handleDelete = async () => {
        if (deleteTargetId == null) return
        await adminApi.deleteOrder(deleteTargetId)
        setOrders((prev) => prev.filter((o) => o.id !== deleteTargetId))
        setDeleteTargetId(null)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold">주문 대시보드</h1>
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isConnected ? '● 실시간' : '○ 연결 중...'}
                    </span>
                    <button onClick={() => navigate('/admin/tables')} className="text-sm text-blue-500 min-h-[44px]">테이블 관리</button>
                    <button onClick={logout} className="text-sm text-gray-500 min-h-[44px]">로그아웃</button>
                </div>
            </div>

            {/* 테이블 필터 */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b">
                <button
                    onClick={() => setFilterTableId(null)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap min-h-[44px] ${filterTableId == null ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                    전체
                </button>
                {tableIds.map((id) => (
                    <button
                        key={id}
                        onClick={() => setFilterTableId(id)}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap min-h-[44px] ${filterTableId === id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                        테이블 {id}
                    </button>
                ))}
            </div>

            <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.length === 0 && (
                    <p className="col-span-full text-center text-gray-400 py-8">현재 주문이 없습니다</p>
                )}
                {filtered.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        onDelete={(id) => setDeleteTargetId(id)}
                    />
                ))}
            </div>

            <Modal
                isOpen={deleteTargetId != null}
                title="주문 삭제"
                message="이 주문을 삭제하시겠습니까? 복구할 수 없습니다."
                confirmLabel="삭제"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    )
}
