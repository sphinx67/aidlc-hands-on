import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import { OrderCard } from '../../components/OrderCard'
import { LoadingSpinner } from '../../components/LoadingSpinner'

export default function OrdersPage() {
    const navigate = useNavigate()
    const { orders, isLoading, error, refetch } = useOrders()

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-white shadow-sm px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-600 min-h-[44px] min-w-[44px]">←</button>
                <h1 className="text-lg font-bold">주문 내역</h1>
                <button onClick={refetch} className="ml-auto text-blue-500 text-sm min-h-[44px]">새로고침</button>
            </div>

            <div className="p-4 space-y-3">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!isLoading && orders.length === 0 && (
                    <p className="text-center text-gray-400 py-8">주문 내역이 없습니다</p>
                )}
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    )
}
