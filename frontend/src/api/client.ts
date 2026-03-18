import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// 고객용 클라이언트
export const customerClient = axios.create({ baseURL: BASE_URL })

customerClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('table_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// 관리자용 클라이언트
export const adminClient = axios.create({ baseURL: BASE_URL })

adminClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

adminClient.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_store_id')
            localStorage.removeItem('admin_token_exp')
            window.location.href = '/admin/login'
        }
        return Promise.reject(error)
    }
)

export const API_BASE_URL = BASE_URL
