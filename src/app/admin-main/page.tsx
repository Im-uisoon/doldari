// AdminPage.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getRoleFromToken } from '@/utils/auth'

export default function AdminMainPage() {
  const router = useRouter()

  useEffect(() => {
    const role = (getRoleFromToken() || '').toLowerCase()
    if (role === 'admin') return
    if (role === 'siren') {
      router.replace('/siren')
      return
    }
    router.replace('/admin')
  }, [router])

  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600">
      {/* 1. 헤더 */}
      <nav className="h-13.5 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      {/* 여백 */}
      <nav className="h-1/5 flex flex-col px-5 pt-12">
        <span className="text-2xl">관리자님, 환영합니다</span>
        <span>오늘도 안전작업 하세요</span>
      </nav>

      {/* 이동 버튼 */}
      <nav className="h-3/5 flex flex-col">
        {/* 인원 관리 버튼 */}
        <div className="h-1/2 flex p-5">
          <Link
            href="/admin/members"
            className="h-full w-full flex items-center justify-center bg-gray-300 border border-gray-400 rounded-lg text-4xl"
          >
            인원 관리
          </Link>
        </div>

        {/* 작업 관리 버튼 */}
        <div className="h-1/2 flex p-5">
          <Link
            href="/admin/work"
            className="h-full w-full flex items-center justify-center bg-gray-300 border border-gray-400 rounded-lg text-4xl"
          >
            작업 관리
          </Link>
        </div>
      </nav>

      {/* 여백 */}
      <nav className="h-1/5"></nav>
    </section>
  )
}
