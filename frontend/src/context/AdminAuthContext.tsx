import { createContext, useState, useCallback, type ReactNode } from 'react'
import { adminApi } from '../api/adminApi'

interface AdminAuthState {
    isAuthenticated: boolean
    token: string | null
    storeId: string | null
}

interface AdminAuthContextValue extends AdminAuthState {
    login: (storeId: string, username: string, password: string) => Promise<void>
    logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

function loadAdminAuth(): AdminAuthState {
    const token = localStorage.getItem('admin_token')
    const storeId = localStorage.getItem('admin_store_id')
    const exp = localStorage.getItem('admin_token_exp')
    if (token && storeId && exp && new Date(exp) > new Date()) {
        return { isAuthenticated: true, token, storeId }
    }
    // 만료된 경우 정리
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_store_id')
    localStorage.removeItem('admin_token_exp')
    return { isAuthenticated: false, token: null, storeId: null }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AdminAuthState>(loadAdminAuth)

    const login = useCallback(async (storeId: string, username: string, password: string) => {
        const data = await adminApi.login(storeId, username, password)
        const exp = new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString()
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_store_id', storeId)
        localStorage.setItem('admin_token_exp', exp)
        setState({ isAuthenticated: true, token: data.access_token, storeId })
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_store_id')
        localStorage.removeItem('admin_token_exp')
        setState({ isAuthenticated: false, token: null, storeId: null })
    }, [])

    return (
        <AdminAuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    )
}
