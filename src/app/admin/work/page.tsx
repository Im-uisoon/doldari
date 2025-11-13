'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

export default function AdminWorkPage() {
  const [taskTypes, setTaskTypes] = useState<any[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())

  const toggleTask = (id: number) => {
    setSelectedTasks((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  useEffect(() => {
    const fetchTaskTypes = async () => {
      setIsLoadingTasks(true)
      try {
        const { data } = await apiGet('/api/task/types')
        if (Array.isArray(data)) setTaskTypes(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load task types', e)
        setTasksError('작업 유형을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoadingTasks(false)
      }
    }
    fetchTaskTypes()
  }, [])

  const [regions, setRegions] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)

  const [sites, setSites] = useState<any[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [sitesError, setSitesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true)
      try {
        const { data } = await apiGet('/api/region')
        if (Array.isArray(data)) setRegions(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load regions', e)
      } finally {
        setIsLoadingRegions(false)
      }
    }
    fetchRegions()
  }, [])

  useEffect(() => {
    setSites([])
    setSelectedSiteId(null)
    setSitesError(null)
    if (!selectedRegionId) return

    const fetchSites = async () => {
      setIsLoadingSites(true)
      try {
        const { data } = await apiGet(`/api/region/${selectedRegionId}/sites`)
        if (Array.isArray(data)) setSites(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load sites', e)
        setSitesError('팀 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoadingSites(false)
      }
    }
    fetchSites()
  }, [selectedRegionId])

  const [taskDate, setTaskDate] = useState<string | null>(null) // YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const getDateKey = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatDateDisplay = (key: string | null) => {
    if (!key) return null
    const [y, m, d] = key.split('-').map((v) => Number(v))
    const dt = new Date(y, m - 1, d)
    const dow = ['일', '월', '화', '수', '목', '금', '토'][dt.getDay()]
    return `${key} (${dow})`
  }

  const pickToday = () => setTaskDate(getDateKey(new Date()))
  const pickTomorrow = () => {
    const t = new Date()
    t.setDate(t.getDate() + 1)
    setTaskDate(getDateKey(t))
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitMessage(null)
    if (!selectedSiteId) {
      setSubmitError('팀을 선택해주세요.')
      return
    }
    if (!taskDate) {
      setSubmitError('작업 날짜를 선택해주세요.')
      return
    }
    if (selectedTasks.size === 0) {
      setSubmitError('적어도 하나의 작업을 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        date: taskDate,
        taskTypeIds: Array.from(selectedTasks),
      }
      await apiPost(`/api/site/${selectedSiteId}/tasks`, payload)
      setSubmitMessage('작업이 저장되었습니다.')
      if (typeof window !== 'undefined') window.alert('작업이 저장되었습니다.')
      // setSelectedTasks(new Set())
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to save tasks', err)
      const msg = err?.message ?? ''
      if (typeof msg === 'string' && msg.includes('401')) {
        setSubmitError('인증이 필요합니다. 다시 로그인해주세요.')
        if (typeof window !== 'undefined')
          window.alert('인증이 필요합니다. 다시 로그인해주세요.')
      } else if (typeof msg === 'string' && msg.includes('403')) {
        setSubmitError('권한이 없습니다.')
        if (typeof window !== 'undefined') window.alert('권한이 없습니다.')
      } else if (typeof msg === 'string' && msg.includes('409')) {
        setSubmitError('이미 존재하는 작업 배정입니다.')
        if (typeof window !== 'undefined')
          window.alert('이미 존재하는 작업 배정입니다.')
      } else {
        setSubmitError('작업 저장 중 오류가 발생했습니다.')
        if (typeof window !== 'undefined')
          window.alert('작업 저장 중 오류가 발생했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const todayKey = getDateKey(new Date())
  const tomorrowKey = getDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000))

  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-13 min-h-[52px] bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <nav className="h-1/10 border-b-1 flex items-center px-5 justify-center">
        <span className="text-2xl">작업 지정</span>
      </nav>

      <nav className="max-h-[70vh] overflow-y-auto border-b-1 flex flex-col p-3">
        <main className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* 1) 현장/팀 선택 */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">
              현장과 팀 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <div>
                <select
                  value={selectedRegionId ?? ''}
                  onChange={(e) =>
                    setSelectedRegionId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="border border-zinc-500 rounded-md w-full p-2"
                >
                  <option value="">현장 선택</option>
                  {isLoadingRegions ? (
                    <option disabled>로딩중...</option>
                  ) : regions.length === 0 ? (
                    <option disabled>등록된 현장이 없습니다.</option>
                  ) : (
                    regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <select
                  value={selectedSiteId ?? ''}
                  onChange={(e) =>
                    setSelectedSiteId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="border border-zinc-500 rounded-md w-full p-2"
                  disabled={!selectedRegionId}
                >
                  <option value="">팀 선택</option>
                  {isLoadingSites ? (
                    <option disabled>로딩중...</option>
                  ) : !selectedRegionId ? (
                    <option disabled>현장을 먼저 선택해주세요.</option>
                  ) : sitesError ? (
                    <option disabled>{sitesError}</option>
                  ) : sites.length === 0 ? (
                    <option disabled>등록된 팀이 없습니다.</option>
                  ) : (
                    sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              현장과 팀을 선택하면 지정 준비가 완료됩니다.
            </p>
          </section>

          {/* 2) 날짜 선택 (오늘/내일) */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">
              작업 날짜 선택
            </h2>
            <div className="flex gap-3 w-full justify-center">
              <button
                type="button"
                onClick={pickToday}
                className={`px-8 py-2 rounded-md border ${taskDate === todayKey ? 'bg-yellow-300 text-black border-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
              >
                금일
              </button>
              <button
                type="button"
                onClick={pickTomorrow}
                className={`px-8 py-2 rounded-md border ${taskDate === tomorrowKey ? 'bg-yellow-300 text-black border-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
              >
                익일
              </button>
            </div>
            <div className="mt-3 text-center text-zinc-700 text-sm">
              선택된 날짜: {formatDateDisplay(taskDate) ?? '미선택'}
            </div>
          </section>

          {/* 3) 작업 선택 (멀티) */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">작업 선택</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {isLoadingTasks ? (
                <div className="col-span-2 md:col-span-4 text-center p-3">
                  작업 유형 로딩중...
                </div>
              ) : tasksError ? (
                <div className="col-span-2 md:col-span-4 text-center p-3 text-red-600">
                  {tasksError}
                </div>
              ) : taskTypes.length === 0 ? (
                <div className="col-span-2 md:col-span-4 text-center p-3">
                  등록된 작업 유형이 없습니다.
                </div>
              ) : (
                taskTypes.map((tt: any) => (
                  <button
                    key={tt.id}
                    type="button"
                    onClick={() => toggleTask(tt.id)}
                    title={
                      Array.isArray(tt.trainingCodes)
                        ? tt.trainingCodes.join(', ')
                        : ''
                    }
                    className={`px-3 py-2 rounded-md border font-medium ${selectedTasks.has(tt.id) ? 'bg-yellow-300 text-black border-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
                  >
                    {tt.name}
                  </button>
                ))
              )}
            </div>
            <p className="text-xs text-center text-zinc-600 mt-2">
              여러 개를 선택할 수 있습니다.
            </p>
          </section>

          {/* 전송 버튼 */}
        </main>
      </nav>

      <nav className="px-8 py-4 flex items-start">
        <div className="w-full">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !selectedSiteId ||
              !taskDate ||
              selectedTasks.size === 0 ||
              isSubmitting
            }
            className="w-full bg-yellow-300 text-black p-2 mt-2 rounded-md border font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '작업 지정 전송'}
          </button>

          {/* 메시지는 alert로 표시하므로 인라인 텍스트는 표시하지 않습니다. */}
        </div>
      </nav>
    </section>
  )
}
