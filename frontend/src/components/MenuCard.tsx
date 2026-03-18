import type { Menu } from '../types'

interface MenuCardProps {
    menu: Menu
    onAdd: (menu: Menu) => void
}

export function MenuCard({ menu, onAdd }: MenuCardProps) {
    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            data-testid={`menu-card-${menu.id}`}
        >
            {menu.image_url ? (
                <img src={menu.image_url} alt={menu.name} className="w-full h-36 object-cover" />
            ) : (
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    이미지 없음
                </div>
            )}
            <div className="p-3">
                <p className="font-semibold text-gray-900">{menu.name}</p>
                {menu.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-blue-600">₩{menu.price.toLocaleString()}</span>
                    <button
                        onClick={() => onAdd(menu)}
                        data-testid={`menu-add-button-${menu.id}`}
                        className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg min-h-[44px] min-w-[44px]"
                    >
                        담기
                    </button>
                </div>
            </div>
        </div>
    )
}
