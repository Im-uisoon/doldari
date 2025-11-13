'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { apiGet } from '@/lib/api'
import { decodeJwt } from '@/utils/auth'

type TestApiResponse = {
  userId: number
  status: 'NONE' | 'PASS' | 'FAIL'
  testPassDate: string | null
}

type EducationApiResponse = {
  userId: number
  status: 'NONE' | 'PASS' | 'EXPIRE'
  educationDate: string | null
}

export default function EducationPage() {
  const [statusText, setStatusText] = useState<string>('로딩 중...')
  const [statusCode, setStatusCode] = useState<'NONE' | 'PASS' | 'FAIL'>('NONE')

  const [educationStatusCode, setEducationStatusCode] = useState<
    'NONE' | 'PASS' | 'EXPIRE'
  >('NONE')
  const [educationLoading, setEducationLoading] = useState<boolean>(true)
  const [testLoading, setTestLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('accessToken')
            : null
        if (!token) {
          setStatusText('미응시')
          setStatusCode('NONE')
          setTestLoading(false)
          setEducationLoading(false)
          return
        }

        const payload = decodeJwt(token)
        const usersId = payload?.usersId ?? payload?.userId
        if (!usersId) {
          setStatusText('미응시')
          setStatusCode('NONE')
          setTestLoading(false)
          setEducationLoading(false)
          return
        }

        // Fetch test status (안전 시험)
        try {
          const { data } = await apiGet(`/api/user/${usersId}/test`)
          const rawStatus = String(data?.status ?? '').toUpperCase()
          const hasTestDate = !!data?.testPassDate

          let normalizedStatus: 'NONE' | 'PASS' | 'FAIL' = 'NONE'
          if (rawStatus === 'PASS' || (rawStatus === '' && hasTestDate))
            normalizedStatus = 'PASS'
          else if (rawStatus === 'FAIL') normalizedStatus = 'FAIL'

          const map: Record<string, string> = {
            NONE: '미응시',
            PASS: '합격',
            FAIL: '불합격',
          }
          setStatusText(map[normalizedStatus])
          setStatusCode(normalizedStatus)
        } catch (err) {
          console.error('Failed to fetch safety test status', err)
          setStatusText('미응시')
          setStatusCode('NONE')
        } finally {
          setTestLoading(false)
        }

        // Fetch education status (교육)
        try {
          const { data: edu } = (await apiGet(
            `/api/user/${usersId}/education`,
          )) as { data: EducationApiResponse }

          const rawEduStatus = String(edu?.status ?? '').toUpperCase()
          const hasEduDate = !!edu?.educationDate

          let normalizedEdu: 'NONE' | 'PASS' | 'EXPIRE' = 'NONE'
          if (rawEduStatus === 'PASS' || (rawEduStatus === '' && hasEduDate))
            normalizedEdu = 'PASS'
          else if (rawEduStatus === 'EXPIRE') normalizedEdu = 'EXPIRE'

          setEducationStatusCode(normalizedEdu)
        } catch (err) {
          console.error('Failed to fetch education status', err)
          setEducationStatusCode('NONE')
        } finally {
          setEducationLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch safety test status', err)
        setStatusText('미응시')
        setStatusCode('NONE')
        setTestLoading(false)
        setEducationLoading(false)
      }
    }

    run()
  }, [])

  const handleTestClick = () => {
    if (testLoading) {
      alert('상태를 불러오는 중입니다. 잠시만 기다려주세요.')
      return
    }
    if (statusCode === 'PASS') {
      alert('이미 합격하여 시험에 응시할 수 없습니다.')
      return
    }
    router.push('/main/education/test')
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <div className="mt-2 py-5 text-center">
        <h1 className="text-3xl font-bold text-zinc-700">안전 교육</h1>
      </div>

      <main className="max-w-4xl mx-auto p-5">
        <div className="grid gap-4">
          <div className="block">
            <button
              type="button"
              onClick={() => router.push('/main/education/safe')}
              className="flex items-center justify-between p-6 rounded-lg bg-zinc-900 text-yellow-400 w-full text-left hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="건설업 기초안전보건교육 상세"
            >
              <div>
                <p className="text-lg font-bold">건설업 기초안전보건교육</p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    educationStatusCode === 'PASS' ||
                    educationStatusCode === 'EXPIRE'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  {educationLoading
                    ? '로딩 중...'
                    : educationStatusCode === 'PASS' ||
                        educationStatusCode === 'EXPIRE'
                      ? '이수'
                      : '미이수'}
                </p>
              </div>
            </button>
          </div>

          <div className="block">
            <button
              type="button"
              onClick={() => router.push('/main/education/safe')}
              className="flex items-center justify-between p-6 rounded-lg bg-zinc-900 text-yellow-400 w-full text-left hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="정기 안전보건교육 상세"
            >
              <div>
                <p className="text-lg font-bold">정기 안전보건교육</p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    educationStatusCode === 'PASS'
                      ? 'text-blue-600'
                      : educationStatusCode === 'EXPIRE'
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {educationLoading
                    ? '로딩 중...'
                    : educationStatusCode === 'PASS'
                      ? '이수'
                      : educationStatusCode === 'EXPIRE'
                        ? '재이수'
                        : '미이수'}
                </p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestClick}
            className="mt-30 flex items-center justify-between p-6 rounded-lg bg-yellow-300 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer w-full"
          >
            <div className="text-left">
              <p className="text-lg font-bold text-zinc-900">안전 시험</p>
              <p
                className={`text-sm font-bold mt-1 ${
                  statusCode === 'PASS'
                    ? 'text-blue-600'
                    : statusCode === 'FAIL'
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                {statusText}
              </p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
