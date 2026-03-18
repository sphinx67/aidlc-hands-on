import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAuth } from '../hooks/useAuth'

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAdminAuth()
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />
    return <>{children}</>
}

interface TableSetupScreenProps {
    onSetup: (storeId: string, tableNumber: number, password: string) => Promise<void>
}

function TableSetupScreen({ onSetup }: TableSetupScreenProps) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        await onSetup(
            fd.get('storeId') as string,
            Number(fd.get('tableNumber')),
            fd.get('password') as string
        )
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4 text-center">테이블 초기 설정</h1>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input name="storeId" placeholder="매장 ID" required className="w-full border rounded-lg px-3 py-2 min-h-[44px]" />
                    <input name="tableNumber" type="number" placeholder="테이블 번호" required className="w-full border rounded-lg px-3 py-2 min-h-[44px]" />
                    <input name="password" type="password" placeholder="비밀번호" required className="w-full border rounded-lg px-3 py-2 min-h-[44px]" />
                    <button type="submit" className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold min-h-[44px]">
                        시작하기
                    </button>
                </form>
            </div>
        </div>
    )
}

export function ProtectedCustomerRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, login } = useAuth()
    if (!isAuthenticated) return <TableSetupScreen onSetup={login} />
    return <>{children}</>
}
