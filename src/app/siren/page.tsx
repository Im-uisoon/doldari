// src/app/siren/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Report } from '@/types/report'
import { fetchReports } from '@/services/report'
import { useSSE } from '@/components/emergency/hooks/useSSE'
import MapContainer from '@/components/emergency/MapContainer'
import ReportListDrawer from '@/components/emergency/ReportListDrawer'
import ReportModal from '@/components/emergency/ReportModal'
import { logout } from '@/lib/api'

export default function SirenPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true)
  const [focused, setFocused] = useState<Report | null>(null)
  const [selected, setSelected] = useState<Report | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = await fetchReports()
      setReports(list)
    } catch (e: any) {
      toast.error(`불러오기 실패: ${e?.message ?? 'unknown'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useSSE(() => {
    toast('🚨 새 신고가 도착했습니다!')
    load()
  })

  const handleSelect = (r: Report) => {
    setFocused(r)
    setSelected(r)
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(v => !v)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 180)
  }

  return (
    // ✅ 전체 화면 고정 + 세로 배치 기본
    <main className="h-screen overflow-hidden flex flex-col">
      {/* 상단바 */}
      <header className="flex items-center justify-between bg-white/90 backdrop-blur rounded-lg shadow px-3 py-2 m-3">
        <div className="flex items-center gap-2">
          <button onClick={toggleDrawer} className="px-3 py-1 rounded hover:bg-black/5 text-sm">
            📋 목록 토글
          </button>
        </div>
        <button onClick={() => logout('/')} className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600">
          로그아웃
        </button>
      </header>

      {/* ✅ 본문: 모바일은 세로, 데스크톱은 가로 */}
      <section className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 지도 */}
        <div className="flex-1 relative bg-white shadow rounded-t-xl md:rounded-xl overflow-hidden">
          <MapContainer
            reports={reports}
            focusedReport={focused}
            onMarkerClick={handleSelect}
            onMapClick={() => setSelected(null)}
          />

          {loading && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
              불러오는 중…
            </div>
          )}
        </div>

        {/* ✅ 리스트: 데스크톱=오른쪽 패널, 모바일=아래쪽 패널 */}
        {isDrawerOpen && (
          <div className="md:w-[360px] w-full md:h-full h-[40vh] shrink-0 bg-white shadow-inner">
            <ReportListDrawer
              isOpen={true}
              reports={reports}
              onSelect={handleSelect}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>
        )}
      </section>

      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
      <Toaster position="top-center" />
    </main>
  )
}
