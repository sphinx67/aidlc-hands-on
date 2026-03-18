import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ProtectedAdminRoute, ProtectedCustomerRoute } from './components/ProtectedRoute'
import { LoadingSpinner } from './components/LoadingSpinner'

const MenuPage = lazy(() => import('./pages/customer/MenuPage'))
const CartPage = lazy(() => import('./pages/customer/CartPage'))
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'))
const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const TablesPage = lazy(() => import('./pages/admin/TablesPage'))

export default function App() {
    return (
        <AdminAuthProvider>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                        <Suspense fallback={<LoadingSpinner fullScreen />}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/customer" replace />} />

                                {/* 고객 라우트 */}
                                <Route path="/customer" element={
                                    <ProtectedCustomerRoute><MenuPage /></ProtectedCustomerRoute>
                                } />
                                <Route path="/customer/cart" element={
                                    <ProtectedCustomerRoute><CartPage /></ProtectedCustomerRoute>
                                } />
                                <Route path="/customer/orders" element={
                                    <ProtectedCustomerRoute><OrdersPage /></ProtectedCustomerRoute>
                                } />

                                {/* 관리자 라우트 */}
                                <Route path="/admin/login" element={<LoginPage />} />
                                <Route path="/admin/dashboard" element={
                                    <ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>
                                } />
                                <Route path="/admin/tables" element={
                                    <ProtectedAdminRoute><TablesPage /></ProtectedAdminRoute>
                                } />

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </AdminAuthProvider>
    )
}
