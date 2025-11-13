import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { educationData, type EducationKey } from '@/utils/clear'

type Props = {
  searchParams?: { type?: string }
}

export default function ClearDetailPage({ searchParams }: Props) {
  const typeParam = (searchParams?.type ?? '') as EducationKey | ''
  const pageData =
    typeParam && (educationData as Record<string, any>)[typeParam]

  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <div className="mt-2 py-5 text-center">
        <h1 className="text-3xl font-bold text-zinc-700">안전조치 상세</h1>
      </div>

      <main className="max-w-4xl mx-auto p-5">
        <header className="flex items-center justify-between mb-4">
          <Link href="/main/clear" className="rounded hover:bg-zinc-200 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Link>

          <h2 className="text-2xl font-bold">
            {pageData?.title ?? '내용을 찾을 수 없습니다.'}
          </h2>

          <div style={{ width: 32 }} />
        </header>

        <div className="relative w-full bg-zinc-900 rounded-3xl p-6 shadow-lg">
          <p className="text-lg font-bold text-yellow-300 text-center mb-6">
            {pageData?.subtitle ?? ''}
          </p>

          <div className="space-y-4 text-base text-zinc-200">
            {pageData?.content && pageData.content.length > 0 ? (
              pageData.content.map((line: string, idx: number) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))
            ) : (
              <p>해당 항목의 상세 정보를 찾을 수 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
