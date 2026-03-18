import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { Modal } from '../../components/Modal'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import type { TableInfo, OrderHistory } from '../../types'

export default function TablesPage() {
    const navigate = useNavigate()
    const [tables, setTables] = useState<TableInfo[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // 모달 상태
    const [setupTarget, setSetupTarget] = useState<TableInfo | null>(null)
    const [setupPassword, setSetupPassword] = useState('')
    const [completeTarget, setCompleteTarget] = useState<TableInfo | null>(null)
    const [historyTarget, setHistoryTarget] = useState<TableInfo | null>(null)
    const [history, setHistory] = useState<OrderHistory[]>([])

    useEffect(() => {
        adminApi.getTables().then(setTables).finally(() => setIsLoading(false))
    }, [])

    const handleSetup = async () => {
        if (!setupTarget || !setupPassword) return
        await adminApi.setupTable(setupTarget.id, setupPassword)
        setTables((prev) => prev.map((t) => t.id === setupTarget.id ? { ...t, has_password: true } : t))
        setSetupTarget(null)
        setSetupPassword('')
    }

    const handleComplete = async () => {
        if (!completeTarget) return
        await adminApi.completeSession(completeTarget.id)
        setTables((prev) => prev.map((t) => t.id === completeTarget.id ? { ...t, current_session_id: null } : t))
        setCompleteTarget(null)
    }

    const handleViewHistory = async (table: TableInfo) => {
        setHistoryTarget(table)
        const data = await adminApi.getOrderHistory(table.id)
        setHistory(data)
    }

    if (isLoading) return <LoadingSpinner fullScreen />

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-600 min-h-[44px] min-w-[44px]">←</button>
                <h1 className="text-lg font-bold">테이블 관리</h1>
            </div>

            <div className="p-4 grid gap-3 sm:grid-cols-2">
                {tables.map((table) => (
                    <div key={table.id} className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg">테이블 {table.table_number}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${table.current_session_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {table.current_session_id ? '이용 중' : '비어있음'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {!table.has_password && (
                                <button
                                    onClick={() => setSetupTarget(table)}
                                    className="text-xs px-3 py-2 bg-blue-500 text-white rounded-lg min-h-[44px]"
                                >
                                    비밀번호 설정
                                </button>
                            )}
                            {table.current_session_id && (
                                <button
                                    onClick={() => setCompleteTarget(table)}
                                    className="text-xs px-3 py-2 bg-orange-500 text-white rounded-lg min-h-[44px]"
                                >
                                    이용 완료
                                </button>
                            )}
                            <button
                                onClick={() => handleViewHistory(table)}
                                className="text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg min-h-[44px]"
                            >
                                과거 내역
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 비밀번호 설정 모달 */}
            {setupTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
                        <h3 className="font-semibold mb-3">테이블 {setupTarget.table_number} 비밀번호 설정</h3>
                        <input
                            type="password"
                            value={setupPassword}
                            onChange={(e) => setSetupPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                            className="w-full border rounded-lg px-3 py-2 mb-4 min-h-[44px]"
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setSetupTarget(null)} className="px-4 py-2 border rounded-lg min-h-[44px]">취소</button>
                            <button onClick={handleSetup} className="px-4 py-2 bg-blue-500 text-white rounded-lg min-h-[44px]">설정</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 이용 완료 확인 모달 */}
            <Modal
                isOpen={completeTarget != null}
                title={`테이블 ${completeTarget?.table_number} 이용 완료`}
                message="현재 세션을 종료하고 주문 내역을 이력으로 이동합니다."
                confirmLabel="이용 완료"
                onConfirm={handleComplete}
                onCancel={() => setCompleteTarget(null)}
            />

            {/* 과거 내역 모달 */}
            {historyTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">테이블 {historyTarget.table_number} 과거 내역</h3>
                            <button onClick={() => setHistoryTarget(null)} className="text-gray-500 min-h-[44px] min-w-[44px]">✕</button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3">
                            {history.length === 0 && <p className="text-center text-gray-400">내역이 없습니다</p>}
                            {history.map((h) => (
                                <div key={h.id} className="border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between font-medium mb-1">
                                        <span>{h.order_number}</span>
                                        <span>₩{h.total_amount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        완료: {new Date(h.completed_at).toLocaleString('ko-KR')}
                                    </p>
                                    {h.items.map((item, idx) => (
                                        <p key={idx} className="text-gray-600">{item.menu_name} × {item.quantity}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
