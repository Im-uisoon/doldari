'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Image from 'next/image'
import { apiPost, apiGet } from '@/lib/api'
import { decodeJwt } from '@/utils/auth'

const IMAGES = Array.from({ length: 9 }).map(
  (_, i) => `/education/education${i + 1}.jpg`,
)

export default function EducationSafePage() {
  const router = useRouter()
  // 마지막에 '교육완료' 페이지를 추가하므로 총 페이지 수는 이미지 수 + 1
  const total = IMAGES.length + 1
  const [index, setIndex] = useState<number>(0)

  // 다음/이전 동작: 첫 페이지에서 이전 누르면 아무 동작도 하지 않도록 변경
  const next = useCallback(() => {
    setIndex((i) => (i >= total - 1 ? total - 1 : i + 1))
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? 0 : i - 1))
  }, [])

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [educationStatus, setEducationStatus] = useState<
    'NONE' | 'PASS' | 'EXPIRE' | null
  >(null)
  const [educationLoading, setEducationLoading] = useState<boolean>(true)

  function formatTodayYYYYMMDD() {
    const d = new Date()
    const y = String(d.getFullYear())
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  // 완료 처리 로직을 별도 함수로 분리
  async function handleSubmitEducation() {
    if (submitting) return
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    if (!token) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    let userId: string | number | null = null
    try {
      const payload = decodeJwt(token)
      userId = payload?.usersId ?? payload?.userId ?? null
    } catch (e) {
      // ignore
    }

    if (!userId) {
      const storedUser = sessionStorage.getItem('loggedInUser')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          userId = parsed?.id ?? parsed?.userId ?? null
        } catch (e) {
          // ignore
        }
      }
    }

    if (!userId) {
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }

    try {
      setSubmitting(true)
      await apiPost(`/api/user/${userId}/education`, {
        date: formatTodayYYYYMMDD(),
      })
      router.push('/main/education')
    } catch (err) {
      console.error('Failed to save education', err)
      alert('교육 완료 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // 교육 이수 상태를 백엔드에서 조회하여 버튼 표시 여부 결정
  useEffect(() => {
    const run = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('accessToken')
            : null
        if (!token) {
          setEducationStatus(null)
          setEducationLoading(false)
          return
        }

        let userId: string | number | null = null
        try {
          const payload = decodeJwt(token)
          userId = payload?.usersId ?? payload?.userId ?? null
        } catch (e) {
          // ignore
        }

        if (!userId) {
          const storedUser = sessionStorage.getItem('loggedInUser')
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser)
              userId = parsed?.id ?? parsed?.userId ?? null
            } catch (e) {
              // ignore
            }
          }
        }

        if (!userId) {
          setEducationStatus(null)
          setEducationLoading(false)
          return
        }

        try {
          const { data } = await apiGet(`/api/user/${userId}/education`)
          const rawEduStatus = String(data?.status ?? '').toUpperCase()
          const hasEduDate = !!data?.educationDate
          let normalizedEdu: 'NONE' | 'PASS' | 'EXPIRE' = 'NONE'
          if (rawEduStatus === 'PASS' || (rawEduStatus === '' && hasEduDate))
            normalizedEdu = 'PASS'
          else if (rawEduStatus === 'EXPIRE') normalizedEdu = 'EXPIRE'

          setEducationStatus(normalizedEdu)
        } catch (err) {
          console.error('Failed to fetch education status', err)
          setEducationStatus(null)
        } finally {
          setEducationLoading(false)
        }
      } catch (err) {
        console.error('Failed to determine user education status', err)
        setEducationStatus(null)
        setEducationLoading(false)
      }
    }

    run()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <div className="py-2">
        <header className="flex items-center justify-between mb-1 border-b pb-2">
          <button
            type="button"
            aria-label="뒤로"
            onClick={() => router.push('/main/education')}
            className="rounded hover:bg-zinc-200 p-2"
          >
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
          </button>

          <h1 className="text-2xl font-bold">건설업 안전보건교육</h1>

          <div style={{ width: 32 }} />
        </header>

        <main>
          <div className="relative w-full h-[60vh] bg-gray-100 rounded-md overflow-hidden select-none">
            {index < IMAGES.length ? (
              <Image
                src={IMAGES[index]}
                alt={`교육자료 ${index + 1}`}
                fill
                priority
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <h2 className="text-3xl font-bold mb-2">교육완료</h2>
                <p className="text-lg text-zinc-700 mb-6">수고하셨습니다</p>
                {educationLoading ? (
                  <p className="text-sm text-gray-600">상태 확인 중...</p>
                ) : educationStatus === 'PASS' ? (
                  <div className="text-center">
                    <p className="text-sm text-blue-600 mb-4">
                      이미 이수된 상태입니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/main/education')}
                      className="px-4 py-2 bg-white rounded-md shadow"
                    >
                      교육으로 돌아가기
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitEducation}
                    disabled={submitting}
                    className="px-6 py-3 bg-yellow-300 rounded-md font-bold hover:brightness-95 disabled:opacity-60"
                  >
                    {submitting ? '완료 중...' : '완료하기'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 하단 페이지네이션: 좌우 버튼과 가운데 현재/총 페이지 표기 */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 페이지"
              onClick={prev}
              className="px-3 py-2 bg-white rounded-md shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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

            <div className="text-lg font-bold">{`${index + 1}/${total}`}</div>

            <button
              type="button"
              aria-label="다음 페이지"
              onClick={next}
              className="px-3 py-2 bg-white rounded-md shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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
        </main>
      </div>
    </div>
  )
}
