export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
    const spinner = (
        <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
    if (fullScreen) {
        return <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">{spinner}</div>
    }
    return <div className="py-8">{spinner}</div>
}
