import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerApi } from '../../api/customerApi'
import { useCart } from '../../hooks/useCart'
import { CartItem } from '../../components/CartItem'

export default function CartPage() {
    const navigate = useNavigate()
    const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [orderNumber, setOrderNumber] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        if (!orderNumber) return
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timer)
                    clearCart()
                    navigate('/customer')
                }
                return c - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [orderNumber, clearCart, navigate])

    const handleSubmit = async () => {
        if (isSubmitting || items.length === 0) return
        setIsSubmitting(true)
        setError(null)
        try {
            const order = await customerApi.createOrder(
                items.map((i) => ({ menu_id: i.menuId, quantity: i.quantity }))
            )
            setOrderNumber(order.order_number)
        } catch {
            setError('주문에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (orderNumber) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow p-8 text-center w-full max-w-sm">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-bold mb-2">주문 완료!</h2>
                    <p className="text-gray-600 mb-1">주문 번호</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">{orderNumber}</p>
                    <p className="text-gray-400 text-sm">{countdown}초 후 메뉴 화면으로 이동합니다</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white shadow-sm px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-600 min-h-[44px] min-w-[44px]">←</button>
                <h1 className="text-lg font-bold">장바구니</h1>
            </div>

            <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm px-4">
                {items.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">장바구니가 비어있습니다</p>
                ) : (
                    items.map((item) => (
                        <CartItem key={item.menuId} item={item} onUpdate={updateQuantity} onRemove={removeItem} />
                    ))
                )}
            </div>

            {error && <p className="mx-4 mt-3 text-red-500 text-sm text-center">{error}</p>}

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
                    <div className="flex justify-between font-bold text-lg px-1">
                        <span>합계</span>
                        <span>₩{totalAmount.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        data-testid="cart-submit-button"
                        className="w-full bg-blue-500 text-white rounded-xl py-4 font-semibold min-h-[56px] disabled:opacity-50"
                    >
                        {isSubmitting ? '주문 중...' : '주문 확정'}
                    </button>
                </div>
            )}
        </div>
    )
}
