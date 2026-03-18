import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { customerApi } from '../api/customerApi'

interface AuthState {
    isAuthenticated: boolean
    storeId: string | null
    tableId: number | null
    tableNumber: number | null
    sessionId: string | null
    token: string | null
}

interface AuthContextValue extends AuthState {
    login: (storeId: string, tableNumber: number, password: string) => Promise<void>
    autoLogin: () => Promise<boolean>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        storeId: null,
        tableId: null,
        tableNumber: null,
        sessionId: null,
        token: null,
    })

    const login = useCallback(async (storeId: string, tableNumber: number, password: string) => {
        const data = await customerApi.authenticateTable(storeId, tableNumber, password)
        localStorage.setItem('table_store_id', storeId)
        localStorage.setItem('table_number', String(tableNumber))
        localStorage.setItem('table_password', password)
        localStorage.setItem('table_token', data.access_token)
        localStorage.setItem('table_session_id', data.session_id)
        localStorage.setItem('table_id', String(data.table_id))
        setState({
            isAuthenticated: true,
            storeId,
            tableId: data.table_id,
            tableNumber: data.table_number,
            sessionId: data.session_id,
            token: data.access_token,
        })
    }, [])

    const autoLogin = useCallback(async (): Promise<boolean> => {
        const storeId = localStorage.getItem('table_store_id')
        const tableNumber = localStorage.getItem('table_number')
        const password = localStorage.getItem('table_password')
        if (!storeId || !tableNumber || !password) return false
        try {
            await login(storeId, Number(tableNumber), password)
            return true
        } catch {
            return false
        }
    }, [login])

    const logout = useCallback(() => {
        localStorage.removeItem('table_token')
        localStorage.removeItem('table_session_id')
        localStorage.removeItem('table_id')
        setState({ isAuthenticated: false, storeId: null, tableId: null, tableNumber: null, sessionId: null, token: null })
    }, [])

    useEffect(() => {
        autoLogin()
    }, [autoLogin])

    return (
        <AuthContext.Provider value={{ ...state, login, autoLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
