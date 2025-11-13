'use client'
import ReportList from './ReportList'
import type { Report } from '@/types/report'

type Props = {
  isOpen: boolean
  reports: Report[]
  selectedId?: number | null
  onSelect: (r: Report) => void
  onClose?: () => void
}

export default function ReportListDrawer({
  isOpen,
  reports,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  return (
    <aside
      className={[
        // ✅ 모바일: 지도 위에 고정, 데스크톱: 우측 고정
        'fixed md:static bottom-0 left-0 w-full md:w-[360px]',
        'h-[45vh] md:h-full bg-white rounded-t-xl md:rounded-xl shadow-lg flex flex-col z-20',
        'transition-transform duration-300 ease-out',
        // ✅ isOpen=false면 모바일에서는 아래로 숨기기
        isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
      ].join(' ')}
    >
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-10 bg-white p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">신고 목록 ({reports.length})</h3>
        {onClose && (
          <button
            className="text-sm px-2 py-1 rounded hover:bg-black/5"
            onClick={onClose}
          >
            닫기
          </button>
        )}
      </header>

      {/* 내부 스크롤 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 pr-2">
        {reports.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            표시할 신고가 없습니다.
          </div>
        ) : (
          <ReportList
            reports={reports}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      </div>
    </aside>
  )
}