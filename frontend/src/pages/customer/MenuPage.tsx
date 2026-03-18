import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerApi } from '../../api/customerApi'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { MenuCard } from '../../components/MenuCard'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import type { Category, Menu } from '../../types'

export default function MenuPage() {
    const { storeId } = useAuth()
    const { addItem, totalCount, totalAmount } = useCart()
    const navigate = useNavigate()

    const [categories, setCategories] = useState<Category[]>([])
    const [menus, setMenus] = useState<Menu[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!storeId) return
        Promise.all([
            customerApi.getCategories(storeId),
            customerApi.getMenus(storeId),
        ]).then(([cats, ms]) => {
            setCategories(cats)
            setMenus(ms)
        }).finally(() => setIsLoading(false))
    }, [storeId])

    const filtered = selectedCategoryId == null
        ? menus
        : menus.filter((m) => m.category_id === selectedCategoryId)

    if (isLoading) return <LoadingSpinner fullScreen />

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* 카테고리 탭 */}
            <div className="sticky top-0 bg-white shadow-sm z-10 flex gap-2 px-4 py-3 overflow-x-auto">
                <button
                    onClick={() => setSelectedCategoryId(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] ${selectedCategoryId == null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    전체
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] ${selectedCategoryId === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* 메뉴 그리드 */}
            <div className="grid grid-cols-2 gap-3 p-4">
                {filtered.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} onAdd={addItem} />
                ))}
            </div>

            {/* 장바구니 버튼 */}
            {totalCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                    <button
                        onClick={() => navigate('/customer/cart')}
                        className="w-full bg-blue-500 text-white rounded-xl py-4 font-semibold flex justify-between items-center px-4 min-h-[56px]"
                    >
                        <span className="bg-blue-400 rounded-full px-2 py-0.5 text-sm">{totalCount}</span>
                        <span>장바구니 보기</span>
                        <span>₩{totalAmount.toLocaleString()}</span>
                    </button>
                </div>
            )}
        </div>
    )
}
