import { API_BASE_URL } from './client'
import type { SSEEvent } from '../types'

export class SSEClient {
    private eventSource: EventSource | null = null
    private retryDelay = 1000
    private readonly maxRetryDelay = 30000
    private stopped = false

    connect(token: string, onEvent: (e: SSEEvent) => void, onStatusChange?: (connected: boolean) => void): void {
        if (this.stopped) return
        const url = `${API_BASE_URL}/api/sse/orders?token=${encodeURIComponent(token)}`
        this.eventSource = new EventSource(url)

        this.eventSource.onopen = () => {
            this.retryDelay = 1000
            onStatusChange?.(true)
        }

        this.eventSource.onmessage = (e: MessageEvent) => {
            try {
                const event = JSON.parse(e.data) as SSEEvent
                onEvent(event)
            } catch {
                // 파싱 실패 무시
            }
        }

        this.eventSource.onerror = () => {
            this.eventSource?.close()
            onStatusChange?.(false)
            if (!this.stopped) {
                setTimeout(() => this.connect(token, onEvent, onStatusChange), this.retryDelay)
                this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay)
            }
        }
    }

    disconnect(): void {
        this.stopped = true
        this.eventSource?.close()
        this.eventSource = null
    }
}
