'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'
import { decodeJwt } from '@/utils/auth'

type Question = {
  question: string
  options: string[]
  correct: number
}

const QUESTIONS: Question[] = [
  {
    question:
      '강관비계 작업 시 떨어짐 사고는 불가피하다. 안전대는 실질적으로 아무 필요 없다.',
    options: ['O', 'X'],
    correct: 1,
  },
  {
    question: '기계 운전원에 의한 부딪힘 재해는 지게차 운전자의 100% 과실이다.',
    options: ['O', 'X'],
    correct: 1,
  },
  {
    question: '작업 경력이 많은 사람이라고해서 재해발생이 적은것은 아니다.',
    options: ['O', 'X'],
    correct: 0,
  },
  {
    question: '제조업 종사자도 떨어짐 재해를 겪을 수 있다',
    options: ['O', 'X'],
    correct: 0,
  },
  {
    question: '가장 사고가 많이 발생하는 연령대는?',
    options: ['20대', '30대', '40대', '50대'],
    correct: 3,
  },
  {
    question: '재해는 주로 근무일수가 많은 평일에 발생한다.',
    options: ['O', 'X'],
    correct: 1,
  },
  {
    question: '보호구가 아닌 것은?',
    options: ['안전모', '안전화', '장갑', '작업복'],
    correct: 3,
  },
  {
    question: '작업장 내 정해진 통로 이름은?',
    options: ['고속도로', '안전통로', '작업통로', '가설통로'],
    correct: 1,
  },
  {
    question:
      '날씨가 더운 날 안전관리자의 허가 아래 맥주 한 캔(도수 최대 6%)까지는 허용 범위이다',
    options: ['O', 'X'],
    correct: 1,
  },
  {
    question:
      '현장 경력이 많은 작업자의 판단 아래 더 효율적인 작업 순서로 변경하는 것이 안전하다',
    options: ['O', 'X'],
    correct: 1,
  },
]

export default function EducationTestPage() {
  const router = useRouter()

  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  )

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [autoSubmitting, setAutoSubmitting] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)

  const isFinished = currentQuestion >= QUESTIONS.length
  const isPass = score >= 80

  useEffect(() => {
    // If the user finished and failed, auto-submit the result so backend
    // stores the failed attempt. For passed attempts we require the user
    // to press the confirm button to submit and navigate back.
    if (isFinished && !saved && !isPass) {
      ;(async () => {
        setAutoSubmitting(true)
        try {
          await submitResult(false)
        } catch (e) {
          console.error('Auto-save failed', e)
        } finally {
          setAutoSubmitting(false)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  const checkAnswer = (index: number) => {
    setSelectedOptionIndex(index)
  }

  const nextQuestion = () => {
    if (selectedOptionIndex !== null) {
      if (selectedOptionIndex === QUESTIONS[currentQuestion].correct) {
        setScore((s) => s + 10)
      }
      setCurrentQuestion((q) => q + 1)
      setSelectedOptionIndex(null)
    }
  }

  function formatTodayYYYYMMDD() {
    const d = new Date()
    const y = String(d.getFullYear())
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  const submitResult = async (shouldNavigate: boolean) => {
    // prevent double submits
    if (submitting || autoSubmitting) return

    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    if (!token) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const payload = {
      score,
      date: formatTodayYYYYMMDD(),
    }

    // find userId from token payload; fall back to sessionStorage.loggedInUser
    const payloadDecoded = decodeJwt(token)
    let userId: string | number | null =
      payloadDecoded?.usersId ?? payloadDecoded?.userId ?? null
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
      await apiPost(`/api/user/${userId}/test`, payload)

      // sync local session copy if present
      const storedUser = sessionStorage.getItem('loggedInUser')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          user.test = isPass ? 'pass' : 'fail'
          if (isPass) user.pass_date = payload.date
          sessionStorage.setItem('loggedInUser', JSON.stringify(user))
        } catch (e) {
          // ignore
        }
      }

      setSaved(true)

      if (shouldNavigate) {
        router.push('/main/education')
      }
    } catch (err) {
      console.error('Failed to save test result', err)
      alert('시험 결과 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <div className="mx-auto p-5">
        <header className="flex items-center justify-between mb-8">
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

          <h1 className="text-3xl font-bold">안전 시험</h1>

          <div style={{ width: 32 }} />
        </header>

        <main className="flex flex-col h-130">
          {!isFinished ? (
            <>
              <div className="mb-5 bg-zinc-900 text-white px-5 py-15 rounded-md select-none">
                <h2 className="text-2xl font-bold">
                  {QUESTIONS[currentQuestion].question}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 mb-5">
                {QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => checkAnswer(idx)}
                    className={`flex items-center justify-center border rounded-md cursor-pointer md:text-lg px-4 ${
                      selectedOptionIndex === idx
                        ? ' bg-black text-[#3A9CFF] border-[#3A9CFF]'
                        : ' bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextQuestion}
                disabled={selectedOptionIndex === null}
                className="w-full px-5 py-3 bg-black text-[#3A9CFF] rounded-md border border-[#3A9CFF] disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed mt-auto"
              >
                다음 문제
              </button>
            </>
          ) : (
            <div className="flex flex-col justify-between h-[60vh]">
              <div className="text-center my-auto">
                <h2 className="text-4xl font-bold mb-4">시험 완료!</h2>
                <p className="text-3xl font-semibold">최종 점수 : {score}점</p>
                <p
                  className={`text-5xl font-extrabold mt-5 ${isPass ? 'text-blue-500' : 'text-red-500'}`}
                >
                  {isPass ? '합격' : '불합격'}
                </p>

                <p className="text-xl mt-4">
                  {isPass ? '합격 축하드립니다' : '불합격 재시험 대상자입니다'}
                </p>
              </div>

              <div>
                {isPass ? (
                  <button
                    type="button"
                    onClick={() => submitResult(true)}
                    disabled={submitting}
                    className="flex justify-center items-center text-lg w-full mt-6 p-3 border bg-[#FFEC17] font-bold rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? '저장 중...' : '교육으로 돌아가기'}
                  </button>
                ) : (
                  <div className="text-center mt-6">
                    {autoSubmitting ? <p>결과 저장 중...</p> : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
