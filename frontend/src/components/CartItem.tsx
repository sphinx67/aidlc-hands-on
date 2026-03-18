import type { CartItem as CartItemType } from '../types'

interface CartItemProps {
    item: CartItemType
    onUpdate: (menuId: number, quantity: number) => void
    onRemove: (menuId: number) => void
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <div className="flex-1">
                <p className="font-medium text-gray-900">{item.menuName}</p>
                <p className="text-sm text-gray-500">₩{item.unitPrice.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdate(item.menuId, item.quantity - 1)}
                    data-testid={`cart-item-decrease-${item.menuId}`}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center min-h-[44px] min-w-[44px]"
                >
                    −
                </button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button
                    onClick={() => onUpdate(item.menuId, item.quantity + 1)}
                    data-testid={`cart-item-increase-${item.menuId}`}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center min-h-[44px] min-w-[44px]"
                >
                    +
                </button>
            </div>
            <p className="w-20 text-right font-semibold text-gray-800">
                ₩{(item.unitPrice * item.quantity).toLocaleString()}
            </p>
            <button
                onClick={() => onRemove(item.menuId)}
                data-testid={`cart-item-remove-${item.menuId}`}
                className="text-red-400 text-sm min-h-[44px] min-w-[44px]"
            >
                삭제
            </button>
        </div>
    )
}
