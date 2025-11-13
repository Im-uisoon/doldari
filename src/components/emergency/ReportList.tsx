// src/components/emergency/ReportList.tsx
'use client'
import type { Report } from '@/types/report'

type Props = {
  reports: Report[]
  selectedId?: number | null
  onSelect: (r: Report) => void
}

export default function ReportList({ reports, selectedId, onSelect }: Props) {
  if (reports.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        표시할 신고가 없습니다.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {reports.map((r) => {
        const active = r.id === selectedId
        return (
          <li
            key={r.id}
            onClick={() => onSelect(r)}
            className={[
              'border rounded-lg p-3 cursor-pointer transition',
              active ? 'bg-black/5 border-black/20' : 'hover:bg-black/5'
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">#{r.id}</div>
              <span className={[
                'text-xs px-2 py-0.5 rounded-full border',
                r.status === 'NEW' ? 'border-red-300 text-red-600' :
                r.status === 'IN_PROGRESS' ? 'border-amber-300 text-amber-700' :
                'border-green-300 text-green-700'
              ].join(' ')}>
                {r.status}
              </span>
            </div>
            <div className="mt-1 font-medium">{r.addressRoad}</div>
            <div className="text-sm text-gray-500">{r.regionName ?? '-'} / {r.siteName ?? '-'}</div>
            <div className="text-xs text-gray-400">{r.createdAt?.replace('T',' ').slice(0,16)}</div>
          </li>
        )
      })}
    </ul>
  )
}
