// src/components/emergency/TopBar.tsx
'use client'
import { logout } from '@/lib/api'

interface Props {
  onToggleDrawer?: () => void
}

export default function TopBar({ onToggleDrawer }: Props) {
  return (
    <header className="flex items-center justify-between bg-white shadow-md p-3 rounded-lg mb-3">
      <button
        onClick={onToggleDrawer}
        className="px-3 py-1 rounded hover:bg-black/5 text-sm"
      >
        📋 목록 토글
      </button>
      <button
        onClick={() => logout('/')} // 로그아웃 후 메인으로
        className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
      >
        로그아웃
      </button>
    </header>
  )
}
