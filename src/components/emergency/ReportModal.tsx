// src/components/emergency/ReportModal.tsx
'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Report, ReportStatus } from '@/types/report'
import { updateReportStatus } from '@/services/report'

interface ReportModalProps {
  report: Report
  onClose: () => void
  onUpdated?: () => void 
}

export default function ReportModal({ report, onClose, onUpdated }: ReportModalProps) {
  const [loading, setLoading] = useState<'IN_PROGRESS' | 'COMPLETED' | null>(null)

  async function handleChangeStatus(next: ReportStatus) {
    try {
      setLoading(next as any)
      await updateReportStatus(report.id, next)
      toast.success('상태가 업데이트되었습니다.')
      onClose()
      onUpdated?.() // ✅ 부모에서 목록 새로고침
    } catch (e: any) {
      toast.error(`업데이트 실패: ${e?.message ?? 'unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[520px] max-w-[92vw] rounded-xl bg-white shadow-lg p-5 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">신고 상세</h2>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-black/5">닫기</button>
        </header>

        <section className="space-y-2 text-sm">
          <div><span className="text-gray-500">신고번호</span> : {report.id}</div>
          <div><span className="text-gray-500">상태</span> : {report.status}</div>
          <div><span className="text-gray-500">주소</span> : {report.addressRoad}</div>
          <div><span className="text-gray-500">신고자</span> : {report.name} ({report.phone})</div>
          <div><span className="text-gray-500">현장</span> : {report.regionName ?? '-'} / {report.siteName ?? '-'}</div>
        </section>

        <footer className="flex gap-2 justify-end pt-2">
          <button
            disabled={loading !== null}
            onClick={() => handleChangeStatus('IN_PROGRESS')}
            className="px-3 py-2 rounded-lg border hover:bg-black/5 disabled:opacity-50"
          >
            {loading === 'IN_PROGRESS' ? '처리 중…' : '출동 시작'}
          </button>
          <button
            disabled={loading !== null}
            onClick={() => handleChangeStatus('COMPLETED')}
            className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading === 'COMPLETED' ? '처리 중…' : '상황 종료'}
          </button>
        </footer>
      </div>
    </div>
  )
}
