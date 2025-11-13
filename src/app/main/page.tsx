// src/app/main/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import WeatherBanner from '@/components/WeatherBanner'
import Link from 'next/link'
import EmergencyButton from '@/components/EmergencyButton'
import { getRoleFromToken, decodeJwt, getNameFromToken } from '@/utils/auth'
import { apiGet } from '@/lib/api'

export default function MainPage() {
  const router = useRouter()
  const [blockCode, setBlockCode] = useState<number | null>(null)
  const [blockLoading, setBlockLoading] = useState<boolean>(true)
  const [blockError, setBlockError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setBlockLoading(true)
      try {
        const { data } = await apiGet('/api/blockcode')
        if (!mounted) return
        const code = Number(data?.BlockCode ?? data?.blockCode ?? 4)
        setBlockCode(code)
      } catch (e) {
        console.error('Failed to load block code', e)
        if (!mounted) return
        setBlockError('상단 알림을 불러오지 못했습니다.')
      } finally {
        if (!mounted) return
        setBlockLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])
  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600">
      {/* 1. 헤더 */}
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      {/* 2. 날씨 배너 칸 */}
      <nav className="h-1/4 flex items-center px-5 justify-center">
        <div className="w-full border border-blue-300 rounded-xl">
          <WeatherBanner />
        </div>
      </nav>

      {/* 3. 메인 이동 박스 */}
      <div className="grid gap-4">
        {/* 안전교육 버튼 */}
        <div className="px-5 py-2">
          <Link
            href="/main/education"
            className="py-5 h-full w-full flex items-center justify-center bg-gray-300 border border-gray-400 rounded-lg text-4xl"
          >
            안전교육
          </Link>
        </div>
        {/* 안전조치 버튼 */}
        <div className="px-5 py-2">
          <Link
            href="/main/clear"
            className="py-5 h-full w-full flex items-center justify-center bg-gray-300 border border-gray-400 rounded-lg text-4xl"
          >
            안전조치
          </Link>
        </div>
        {/* 오늘의점검 버튼 */}
        <div className="px-5 py-2">
          {/* LEADER 권한이면 버튼을 좌우로 분할해 우측 "미완료" 클릭 시 모달을 연다. */}
          <LeaderSplitCheck />
        </div>
      </div>

      {/* 4. 응급전화 버튼 */}
      <div className="flex-1 px-5 py-3 select-none">
        <EmergencyButton phoneNumber="01039407145" holdDuration={2000} />
      </div>
      {blockCode && blockCode >= 1 && blockCode <= 3 && (
        <BlockModal code={blockCode} onClose={() => setBlockCode(null)} />
      )}
    </section>
  )
}

function BlockModal({ code, onClose }: { code: number; onClose: () => void }) {
  const router = useRouter()
  const name = getNameFromToken() ?? ''

  const map: Record<
    number,
    { title: string; body: string; action?: { label: string; href: string } }
  > = {
    1: {
      title: '필수 안내',
      body: `${name}님, 안전교육을 먼저 이수해주세요.`,
      action: { label: '안전교육으로 이동', href: '/main/education' },
    },
    2: {
      title: '필수 안내',
      body: `${name}님, 안전시험을 먼저 통과해주세요.`,
      action: { label: '안전시험으로 이동', href: '/main/education/test' },
    },
    3: {
      title: '필수 안내',
      body: `${name}님, 일일교육을 완료해주세요.`,
      action: { label: '오늘의 점검으로 이동', href: '/main/check' },
    },
  }

  const item = map[code]
  if (!item) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-zinc-100"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-zinc-700">{item.body}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 rounded hover:brightness-95"
          >
            닫기
          </button>
          {item.action && (
            <button
              type="button"
              onClick={() => router.push(item.action!.href)}
              className="px-4 py-2 bg-yellow-400 rounded hover:brightness-95 text-zinc-900"
            >
              {item.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function LeaderSplitCheck() {
  const [isLeader, setIsLeader] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [siteId, setSiteId] = useState<number | null>(null)
  const [membersCount, setMembersCount] = useState<number | null>(null)
  const [membersETag, setMembersETag] = useState<string | null>(null)
  const [highlightCount, setHighlightCount] = useState<boolean>(false)
  const [bgFetching, setBgFetching] = useState<boolean>(false)

  useEffect(() => {
    const role = getRoleFromToken()
    setIsLeader((role || '').toLowerCase() === 'leader')
    // token에서 siteId 추출
    try {
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null
      if (token) {
        const payload = decodeJwt(token)
        const sId =
          payload?.siteId ?? payload?.site?.id ?? payload?.site?.siteId ?? null
        if (sId != null) setSiteId(Number(sId))
      }
    } catch (e) {
      console.error('토큰 파싱 실패', e)
    }
  }, [])

  // leaders 전용: 백그라운드로 미완료자 수를 폴링하여 표시합니다.
  useEffect(() => {
    if (!isLeader || siteId == null) return
    let mounted = true
    const storageKey = `membersNotCompletedCount_${siteId}`

    const parseCount = (data: any): number => {
      if (data == null) return 0
      if (typeof data === 'number') return data
      if (Array.isArray(data)) {
        // 응답이 배열일 경우 미완료 항목의 수를 계산
        let counted = 0
        for (const it of data) {
          if (it && typeof it === 'object') {
            if ('completedAll' in it) {
              if (!it.completedAll) counted++
              continue
            }
            if ('completed' in it) {
              if (!it.completed) counted++
              continue
            }
          }
        }
        return counted > 0 ? counted : data.length
      }
      if (typeof data === 'object') {
        if (typeof data.membersNotCompletedAll === 'number')
          return data.membersNotCompletedAll
        if (typeof data.incompleteCount === 'number')
          return data.incompleteCount
        if (typeof data.notCompletedCount === 'number')
          return data.notCompletedCount
      }
      return 0
    }

    // 이전 세션 캐시(값 + ETag)를 우선 표시
    const etagKey = `membersNotCompletedETag_${siteId}`
    try {
      const cached = sessionStorage.getItem(storageKey)
      if (cached != null) setMembersCount(Number(cached))
      const cachedEtag = sessionStorage.getItem(etagKey)
      if (cachedEtag != null) setMembersETag(cachedEtag)
    } catch (e) {
      // ignore
    }

    const fetchOnce = async (silent = false) => {
      try {
        if (!silent) setBgFetching(true)

        const extraHeaders: Record<string, string> | undefined =
          membersETag != null ? { 'If-None-Match': membersETag } : undefined

        const res = (await apiGet(`/api/site/${siteId}/members/completion`, {
          returnHeaders: true,
          extraHeaders,
        })) as { data: any; headers?: Record<string, string>; status?: number }

        if (!mounted) return

        // 304: 변경 없음 -> 아무 작업도 하지 않음
        if (res.status === 304) return

        const count = parseCount(res.data)

        // ETag가 있으면 저장
        const newEtag = res.headers?.['etag'] ?? res.headers?.['ETag'] ?? null

        // 값이 실제로 변경된 경우에만 상태를 업데이트해서 깜빡임을 방지
        const prev = membersCount
        if (prev === null || count !== prev) {
          setMembersCount(count)
          setHighlightCount(true)
          // 하이라이트는 잠깐 유지
          setTimeout(() => setHighlightCount(false), 700)
        }

        if (newEtag) {
          setMembersETag(newEtag)
          try {
            sessionStorage.setItem(etagKey, newEtag)
          } catch (e) {
            // ignore
          }
        }

        try {
          sessionStorage.setItem(storageKey, String(count))
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('멤버 완료 상태 조회 실패', err)
      } finally {
        if (!silent) setBgFetching(false)
      }
    }

    // 초기에는 silent로 표시된 캐시만 보여주고, 이후 폴링은 백그라운드로
    fetchOnce(true)
    const id = setInterval(() => fetchOnce(false), 10000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [isLeader, siteId])

  if (!isLeader) {
    return (
      <Link
        href="/main/check"
        className="py-5 h-full w-full flex items-center justify-center bg-gray-300 border border-gray-400 rounded-lg text-4xl"
      >
        오늘의 점검
      </Link>
    )
  }

  return (
    <>
      <div className="h-full w-full flex items-stretch bg-gray-300 border border-gray-400 rounded-lg text-2xl font-semibold">
        <Link
          href="/main/check"
          className="w-1/2 h-full flex items-center justify-center border-r border-gray-400 py-5 min-h-20"
          aria-label="오늘의 점검 이동"
        >
          오늘의 점검
        </Link>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-1/2 h-full flex items-center justify-center py-5 min-h-20"
          aria-label="미완료 목록 열기"
        >
          미완료 [
          <span
            aria-live="polite"
            className={`inline-block mx-1 transition-transform duration-300 ${
              highlightCount ? 'transform' : ''
            }`}
          >
            {membersCount ?? '-'}
          </span>
          ]
        </button>
      </div>

      {showModal && (
        <MembersModal siteId={siteId} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

function MembersModal({
  siteId,
  onClose,
}: {
  siteId: number | null
  onClose: () => void
}) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!siteId) {
        setError('현장 정보가 없습니다.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const { data: res } = await apiGet(
          `/api/site/${siteId}/members/completion`,
        )
        if (!mounted) return
        setData(res)
      } catch (e) {
        console.error('Failed to load members completion', e)
        if (!mounted) return
        setError('미완료자 목록을 불러오지 못했습니다.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [siteId])

  const formatDateTime = (iso: string | null) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString()
    } catch (e) {
      return iso
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">팀 일일교육 현황표</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-zinc-100"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading && (
          <div className="p-4 text-center text-zinc-500">로딩 중...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded mb-4">{error}</div>
        )}

        {!loading && !error && data && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-2 text-center">
              <div className="p-3 bg-zinc-50 rounded">
                <div className="text-xl font-bold">{data.totalMembers}</div>
                <div className="text-sm text-zinc-500">전체</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded">
                <div className="text-xl font-bold text-blue-600">
                  {data.membersCompletedAll}
                </div>
                <div className="text-sm text-zinc-500">완료</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded">
                <div className="text-xl font-bold text-red-600">
                  {data.membersNotCompletedAll}
                </div>
                <div className="text-sm text-zinc-500">미완료</div>
              </div>
            </div>

            <div className="space-y-2">
              {Array.isArray(data.members) &&
                data.members.map((m: any) => (
                  <div key={m.userId} className="p-4 border rounded bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold">{m.name}</p>
                        <p className="text-sm text-zinc-500">{m.phone}</p>
                      </div>

                      <div
                        className={`text-sm font-medium ${
                          m.completedAll ? 'text-blue-600' : 'text-red-600'
                        }`}
                      >
                        {m.completedAll ? '이수' : '미이수'}
                      </div>
                    </div>

                    <div className="mt-3">
                      {Array.isArray(m.tasks) &&
                        m.tasks.map((t: any) => (
                          <div
                            key={t.taskTypeId}
                            className="flex items-center justify-between p-3 bg-zinc-50 rounded"
                          >
                            <div className="text-sm font-medium">
                              {t.taskName}
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                t.completed ? 'text-blue-600' : 'text-red-600'
                              }`}
                            >
                              {t.completed ? '이수' : '미이수'}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
