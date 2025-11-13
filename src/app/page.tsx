// src/app/page.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// --- 1. 데이터 정의 ---
const courseData = [
  {
    num: 1,
    title: '안전관리 가능',
    desc: '현장의 안전 상황을 실시간으로 모니터링하고 체계적으로 관리할 수 있습니다.',
  },
  {
    num: 2,
    title: '사고시 즉각 대응',
    desc: '응급상황 발생 시 신속한 대응체계를 통해 피해를 최소화할 수 있습니다.',
  },
  {
    num: 3,
    title: '현장 관리',
    desc: '다양한 현장의 상황을 통합적으로 관리하고 효율적으로 운영할 수 있습니다.',
  },
  {
    num: 4,
    title: '사고 예방·신속 대응',
    desc: '산업 현장의 각종 안전사고를 예방하고, 발생 시 즉각 대응하도록 설계된 온라인 플랫폼입니다.',
  },
  {
    num: 5,
    title: '현장 등록·통합 관리',
    desc: '현장을 단위별로 등록해 데이터를 한 곳에서 체계적으로 관리할 수 있습니다.',
  },
  {
    num: 6,
    title: '안전교육 온라인 시험',
    desc: '안전 교육과 온라인 시험으로 정기적인 교육 이수와 평가를 손쉽게 운영합니다.',
  },
  {
    num: 7,
    title: '즉각 신고 시스템',
    desc: '사고 발생 시 모바일로 즉시 신고하여 초기 대응 시간을 단축합니다.',
  },
  {
    num: 8,
    title: '사고 유형별 요령',
    desc: '사고 유형에 맞는 대응 절차를 안내해 현장에서 신속하고 올바르게 조치할 수 있게 돕습니다.',
  },
]

// --- 2. 컴포넌트 정의 ---
export default function WelcomePage() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Vue의 computed 대신 useMemo를 사용하여 현재 페이지 데이터 계산
  const currentPage = useMemo(
    () => courseData[currentPageIndex],
    [currentPageIndex],
  )
  const courseLength = courseData.length

  const isLastPage = currentPageIndex === courseLength - 1
  const isFirstPage = currentPageIndex === 0

  // 다음 페이지로 이동 (순환 로직)
  const nextPage = () => {
    setCurrentPageIndex(isLastPage ? 0 : currentPageIndex + 1)
  }

  // 이전 페이지로 이동 (순환 로직)
  const prevPage = () => {
    setCurrentPageIndex(isFirstPage ? courseLength - 1 : currentPageIndex - 1)
  }

  return (
    <section className="flex flex-col h-screen bg-neutral-100">
      {/* 1. 헤더 */}
      <nav className="h-1/20"></nav>
      {/* 2. 제목 */}
      <nav className="h-1/5 flex flex-col">
        <div className="flex flex-col gap-3 h-full text-center justify-center">
          <p className="text-4xl font-bold text-zinc-600">돌다리</p>
          <p className="text-zinc-500">안전하게 일하는 그날까지!</p>
        </div>
      </nav>
      {/* 3. 중앙 배너 */}
      <nav className="h-3/5 p-5">
        <div className="flex flex-col bg-zinc-800 h-full rounded-xl text-zinc-300 p-5">
          {/* 배너 내부 번호 및 제목 */}
          <div className="h-1/4">
            <div className="flex gap-3 items-center h-full">
              {/* 번호 */}
              <h1 className="bg-yellow-400 w-7 h-7 rounded-full flex items-center justify-center text-amber-900 font-bold">
                {currentPage.num}
              </h1>
              {/* 제목 */}
              <h1 className="text-2xl font-bold text-yellow-300">
                {currentPage.title}
              </h1>
            </div>
          </div>

          {/* 배너 내부 설명 */}
          <div className="h-2/4 text-xl">{currentPage.desc}</div>

          {/* 배너 내부 페이지네이션 */}
          <div className="h-1/4">
            <div className="h-full flex justify-between items-end">
              {/* 페이지 좌측 */}
              <button onClick={prevPage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* 페이지 인덱스 */}
              <p className="text-lg font-bold text-gray-300">
                {currentPageIndex + 1} / {courseLength}
              </p>

              {/* 페이지 우측 */}
              <button onClick={nextPage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* 4. 로그인 */}
      <nav className="h-1/5 px-5 flex items-center">
        <div className="w-full">
          <Link
            href="/login"
            className="rounded-xl border border-yellow-400 bg-yellow-300 hover:bg-yellow-400 text-black py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg transition-colors inline-flex items-center space-x-2 w-full justify-center"
          >
            <span className="text-lg">로그인</span>
          </Link>
        </div>
      </nav>
      {/* 5. 푸터 */}
      <nav className="h-1/10 border-t border-zinc-400">
        <p className="flex h-full items-center justify-center text-zinc-400 text-sm">
          &copy; 2025 돌다리. ALL RIGHTS RESERVED.
        </p>
      </nav>
    </section>
  )
}
