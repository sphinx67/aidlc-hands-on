interface ModalProps {
    isOpen: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function Modal({ isOpen, title, message, confirmLabel = '확인', cancelLabel = '취소', onConfirm, onCancel }: ModalProps) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                {message && <p className="text-gray-600 text-sm mb-4">{message}</p>}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        data-testid="modal-cancel-button"
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 min-h-[44px]"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        data-testid="modal-confirm-button"
                        className="px-4 py-2 rounded-lg bg-red-500 text-white min-h-[44px]"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
