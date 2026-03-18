import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { CartItem, Menu } from '../types'

interface CartContextValue {
    items: CartItem[]
    totalAmount: number
    totalCount: number
    addItem: (menu: Menu, quantity?: number) => void
    removeItem: (menuId: number) => void
    updateQuantity: (menuId: number, quantity: number) => void
    clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
    try {
        const saved = localStorage.getItem('cart_items')
        return saved ? (JSON.parse(saved) as CartItem[]) : []
    } catch {
        return []
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem('cart_items', JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart)

    const update = useCallback((next: CartItem[]) => {
        setItems(next)
        saveCart(next)
    }, [])

    const addItem = useCallback((menu: Menu, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.menuId === menu.id)
            const next = existing
                ? prev.map((i) => i.menuId === menu.id ? { ...i, quantity: i.quantity + quantity } : i)
                : [...prev, { menuId: menu.id, menuName: menu.name, unitPrice: menu.price, quantity }]
            saveCart(next)
            return next
        })
    }, [])

    const removeItem = useCallback((menuId: number) => {
        setItems((prev) => { const next = prev.filter((i) => i.menuId !== menuId); saveCart(next); return next })
    }, [])

    const updateQuantity = useCallback((menuId: number, quantity: number) => {
        setItems((prev) => {
            const next = quantity <= 0
                ? prev.filter((i) => i.menuId !== menuId)
                : prev.map((i) => i.menuId === menuId ? { ...i, quantity } : i)
            saveCart(next)
            return next
        })
    }, [])

    const clearCart = useCallback(() => { update([]) }, [update])

    const totalAmount = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0), [items])
    const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])

    return (
        <CartContext.Provider value={{ items, totalAmount, totalCount, addItem, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}
