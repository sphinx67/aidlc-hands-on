import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAdminAuth()
    const [form, setForm] = useState({ storeId: '', username: '', password: '' })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            await login(form.storeId, form.username, form.password)
            navigate('/admin/dashboard')
        } catch {
            setError('로그인에 실패했습니다. 입력 정보를 확인해주세요.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center mb-6">관리자 로그인</h1>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        value={form.storeId}
                        onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                        placeholder="매장 ID"
                        required
                        data-testid="login-store-id-input"
                        className="w-full border rounded-lg px-3 py-2 min-h-[44px]"
                    />
                    <input
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        placeholder="사용자명"
                        required
                        data-testid="login-username-input"
                        className="w-full border rounded-lg px-3 py-2 min-h-[44px]"
                    />
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="비밀번호"
                        required
                        data-testid="login-password-input"
                        className="w-full border rounded-lg px-3 py-2 min-h-[44px]"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        data-testid="login-submit-button"
                        className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold min-h-[44px] disabled:opacity-50"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    )
}
