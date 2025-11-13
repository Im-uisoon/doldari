// src/hooks/useSSE.ts
import { useEffect } from 'react'
import { API_BASE_URL, getAccessToken } from '@/lib/api'

export function useSSE(onNewReport: (id: number) => void) {
  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    const url = `${API_BASE_URL}/api/admin/report/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url) // 헤더X, 토큰은 쿼리스트링으로

    es.addEventListener('new-report', (e: MessageEvent) => {
      const id = Number(e.data)
      if (!Number.isNaN(id)) onNewReport(id)
    })
    es.onerror = () => { /* 재시도는 기본 */ }
    return () => es.close()
  }, [onNewReport])
}