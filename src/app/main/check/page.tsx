'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { decodeJwt } from '@/utils/auth'
import { apiGet, apiPost } from '@/lib/api'
import { getTrainingById } from '@/utils/training'

type TaskItem = {
  id: number
  name: string
  trainingCodes: string[]
  completed?: boolean
}

function todayDateString(date?: Date) {
  const d = date ?? new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function CheckPage() {
  const today = todayDateString()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [siteIdState, setSiteIdState] = useState<number | null>(null)
  const [assignmentId, setAssignmentId] = useState<number | null>(null)
  const [completing, setCompleting] = useState<boolean>(false)

  // 완료 요청 처리 함수
  const handleComplete = async () => {
    if (!selectedTask) return
    if (!siteIdState || !assignmentId) {
      setError('완료 처리에 필요한 정보가 부족합니다.')
      return
    }
    setCompleting(true)
    try {
      const body = {
        taskTypeIds: [selectedTask.id],
        completedAt: new Date().toISOString(),
      }

      const { data: res } = await apiPost(
        `/api/site/${siteIdState}/assignments/${assignmentId}/complete`,
        body,
      )

      // 응답으로 받은 배열을 기반으로 task 상태를 갱신합니다.
      if (Array.isArray(res)) {
        const resultMap = new Map<number, any>()
        res.forEach((r: any) => resultMap.set(Number(r.taskTypeId), r))

        setTasks((prev) =>
          prev.map((t) => {
            const updated = resultMap.get(Number(t.id))
            if (updated) {
              return { ...t, completed: !!updated.completed }
            }
            return t
          }),
        )

        // 선택된 task도 업데이트
        const updatedForSelected = resultMap.get(Number(selectedTask.id))
        if (updatedForSelected) {
          setSelectedTask({
            ...selectedTask,
            completed: !!updatedForSelected.completed,
          })
        }
      }

      // 완료 후 모달 닫기
      setSelectedTask(null)
    } catch (err) {
      console.error('완료 처리 실패', err)
      setError('완료 처리에 실패했습니다.')
    } finally {
      setCompleting(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const loadTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const token =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('accessToken')
            : null
        if (!token) {
          setError('로그인이 필요합니다.')
          setTasks([])
          return
        }

        const payload = decodeJwt(token)
        // 토큰 구조에 따라 siteId 위치가 다를 수 있으므로 여러 경우를 확인합니다.
        const siteId =
          payload?.siteId ?? payload?.site?.id ?? payload?.site?.siteId ?? null

        if (!siteId) {
          setError('토큰에서 siteId를 찾을 수 없습니다.')
          setTasks([])
          return
        }

        if (siteId != null) setSiteIdState(Number(siteId))
        const path = `/api/site/${siteId}/tasks?date=${today}`
        const { data } = await apiGet(path)
        const items: TaskItem[] = data?.tasks ?? []
        const assignmentId = data?.id ?? null

        if (assignmentId != null) setAssignmentId(Number(assignmentId))

        // 기본적으로 완료 여부를 false로 두고, assignmentId가 있으면 별도 API로 상태를 조회해 병합합니다.
        let merged: TaskItem[] = items.map((it) => ({
          ...it,
          completed: false,
        }))

        if (assignmentId) {
          try {
            const compPath = `/api/site/${siteId}/tasks/completion?assignmentId=${assignmentId}`
            const { data: comps } = await apiGet(compPath)
            const compArray: Array<{ taskTypeId: number; completed: boolean }> =
              comps ?? []
            const compMap = new Map<number, boolean>()
            compArray.forEach((c) =>
              compMap.set(Number(c.taskTypeId), !!c.completed),
            )

            merged = items.map((it) => ({
              ...it,
              completed: compMap.get(Number(it.id)) ?? false,
            }))
          } catch (e) {
            console.error('Failed to fetch completion status', e)
            // 실패 시 기본 false 유지
          }
        }

        if (!mounted) return
        setTasks(merged)
      } catch (e) {
        console.error(e)
        if (!mounted) return
        setError('일일 점검 목록을 불러오지 못했습니다.')
        setTasks([])
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    loadTasks()
    return () => {
      mounted = false
    }
  }, [today])

  // modal 열릴 때 5초 카운트다운을 시작합니다. 0이 될 때까지 모달 닫기를 막습니다.
  useEffect(() => {
    if (!selectedTask) {
      setSecondsLeft(0)
      return
    }

    setSecondsLeft(5)
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [selectedTask])

  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <div className="mt-2 py-5 text-center">
        <h1 className="text-3xl font-bold text-zinc-700">오늘의 점검</h1>
        <p className="text-sm text-zinc-500 mt-1">
          일일 교육을 확인할 수 있는 페이지입니다.
        </p>
      </div>

      <main className="max-w-4xl mx-auto p-5">
        {loading && (
          <div className="p-8 text-center text-zinc-500">로딩 중...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded mb-4">{error}</div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-zinc-500">
            현재 확인할 일일 교육이 없습니다.
          </div>
        )}

        <div className="grid gap-4">
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTask(t)}
              className="flex items-center justify-between p-6 rounded-lg bg-white shadow-sm hover:shadow-md border border-zinc-200 text-left"
            >
              <div>
                <p className="text-lg font-bold text-zinc-700">{t.name}</p>
                <p
                  className={`text-sm mt-1 font-bold ${
                    t.completed ? 'text-blue-600' : 'text-red-600'
                  }`}
                >
                  {t.completed ? '이수' : '미이수'}
                </p>
              </div>
              <div className="text-zinc-400">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </button>
          ))}
        </div>

        {/* Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full mx-auto p-6 overflow-auto max-h-[90vh]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-800">
                      {selectedTask.name}
                    </h2>
                    <span
                      className={`text-sm font-medium ${
                        selectedTask.completed
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedTask.completed ? '이수' : '미이수'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">교육 자료</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    secondsLeft === 0 && !completing && handleComplete()
                  }
                  disabled={secondsLeft !== 0 || completing}
                  className={`rounded p-1 ${
                    secondsLeft !== 0 || completing
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-zinc-100'
                  }`}
                  aria-label={
                    secondsLeft === 0 ? '완료' : '읽기 중 - 닫기 비활성'
                  }
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                {selectedTask.trainingCodes?.map((code) => {
                  const normalized = String(code)
                    .toLowerCase()
                    .replace(/-/g, '_')
                  const training = getTrainingById(normalized)
                  if (!training) {
                    return (
                      <div
                        key={code}
                        className="p-4 bg-zinc-50 rounded border text-zinc-500"
                      >
                        교육 자료를 찾을 수 없습니다. ({code})
                      </div>
                    )
                  }

                  return (
                    <article key={training.id} className="p-4 border rounded">
                      <h3 className="text-lg font-semibold text-zinc-800">
                        {training.title}
                      </h3>
                      <p className="text-sm text-zinc-500 mb-2">
                        {training.subtitle}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-600">
                        {training.content.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                      {training.footer && (
                        <p className="text-xs text-zinc-400 mt-2">
                          {training.footer}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>

              <div className="mt-4 flex justify-end items-center gap-3">
                {secondsLeft > 0 ? (
                  <div className="text-sm text-zinc-500">
                    완료까지 {secondsLeft}초
                  </div>
                ) : (
                  <div className="text-sm text-green-600 font-medium">완료</div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    secondsLeft === 0 && !completing && handleComplete()
                  }
                  disabled={secondsLeft !== 0 || completing}
                  className={`px-4 py-2 rounded ${
                    secondsLeft === 0 && !completing
                      ? 'bg-yellow-400 text-zinc-900 hover:brightness-95'
                      : 'bg-zinc-200 text-zinc-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {completing ? '처리중...' : '완료'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
