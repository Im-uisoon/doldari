'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { apiGet, API_BASE_URL } from '@/lib/api'

export default function AdminMembersPage() {
  const [regions, setRegions] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [newRegionName, setNewRegionName] = useState('')
  const [isAddingRegion, setIsAddingRegion] = useState(false)
  const [newRegionError, setNewRegionError] = useState<string | null>(null)
  const [isDeletingRegion, setIsDeletingRegion] = useState(false)
  const [deleteRegionError, setDeleteRegionError] = useState<string | null>(
    null,
  )
  const [isDeletingSite, setIsDeletingSite] = useState(false)
  const [deleteSiteError, setDeleteSiteError] = useState<string | null>(null)
  const [sites, setSites] = useState<any[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [sitesError, setSitesError] = useState<string | null>(null)
  const [newSiteName, setNewSiteName] = useState('')
  const [isAddingSite, setIsAddingSite] = useState(false)
  const [newSiteError, setNewSiteError] = useState<string | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUserError, setNewUserError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set())
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [isDeletingUsers, setIsDeletingUsers] = useState(false)
  const [deleteUsersError, setDeleteUsersError] = useState<string | null>(null)

  const formatServerError = (errBody: any, defaultMsg: string) => {
    const raw =
      typeof errBody === 'string'
        ? errBody
        : errBody && typeof errBody === 'object'
          ? errBody.error || null
          : null

    if (typeof raw === 'string') {
      const lower = raw.toLowerCase()
      // Map English API message to Korean
      if (lower.includes('region') && lower.includes('exists')) {
        return '이미 존재하는 현장입니다.'
      }
      if (lower.includes('site') && lower.includes('exists')) {
        // 사용자 요청에 따라 정확한 문구로 치환
        return '이미 존재하는 팀 입니다'
      }
      if (lower.includes('user') && lower.includes('exists')) {
        return '이미 존재하는 팀원입니다.'
      }
      if (
        lower.includes('site') &&
        lower.includes('not') &&
        lower.includes('found')
      ) {
        return '팀을 찾을 수 없습니다.'
      }
      return raw
    }
    return defaultMsg
  }

  // Format phone numbers for display and sending
  const formatPhone = (digits: string) => {
    const only = digits.replace(/\D/g, '').slice(0, 11)
    if (only.length <= 3) return only
    if (only.length <= 7) return `${only.slice(0, 3)}-${only.slice(3)}`
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`
  }

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
    // reset sites when region changes
    setSites([])
    setSelectedSiteId(null)
    setSitesError(null)
    if (selectedRegionId === null) return

    const fetchSites = async () => {
      setIsLoadingSites(true)
      try {
        const { data } = await apiGet(`/api/region/${selectedRegionId}/sites`)
        if (Array.isArray(data)) setSites(data)
        else setSites([])
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

  useEffect(() => {
    // When site changes, reset users and fetch for selected site
    setUsers([])
    setSelectedUserIds(new Set())
    setUsersError(null)
    if (selectedSiteId === null || selectedRegionId === null) return

    const fetchUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const { data } = await apiGet(
          `/api/region/${selectedRegionId}/sites/${selectedSiteId}/users`,
        )
        if (Array.isArray(data)) setUsers(data)
        else setUsers([])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users', e)
        setUsersError('팀원 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [selectedSiteId, selectedRegionId])

  const deleteSelectedRegion = async () => {
    if (!selectedRegionId) return
    if (
      !confirm(
        '선택된 현장을 삭제하시겠습니까? 관련 팀 및 팀원이 모두 삭제될 수 있습니다.',
      )
    )
      return

    setIsDeletingRegion(true)
    setDeleteRegionError(null)
    try {
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/api/region/${selectedRegionId}`,
        {
          method: 'DELETE',
          headers,
        },
      )

      if (res.status === 204) {
        setRegions((prev) => prev.filter((r) => r.id !== selectedRegionId))
        setSelectedRegionId(null)
        return
      }

      if (res.status === 401) {
        const errBody = await res.json().catch(() => null)
        setDeleteRegionError(
          formatServerError(errBody, '인증이 필요합니다. 다시 로그인해주세요.'),
        )
        return
      }

      const errBody = await res.json().catch(() => null)
      setDeleteRegionError(
        formatServerError(errBody, `삭제 실패: ${res.status}`),
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete region', e)
      setDeleteRegionError('현장 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeletingRegion(false)
    }
  }

  const deleteSelectedSite = async () => {
    if (!selectedSiteId) return
    if (!confirm('선택된 팀을 삭제하시겠습니까? 관련 팀원도 함께 삭제됩니다.'))
      return

    setIsDeletingSite(true)
    setDeleteSiteError(null)
    try {
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_BASE_URL}/api/site/${selectedSiteId}`, {
        method: 'DELETE',
        headers,
      })

      if (res.status === 204) {
        setSites((prev) => prev.filter((s) => s.id !== selectedSiteId))
        setSelectedSiteId(null)
        return
      }

      if (res.status === 404) {
        const errBody = await res.json().catch(() => null)
        setDeleteSiteError(formatServerError(errBody, '팀을 찾을 수 없습니다.'))
        return
      }

      if (res.status === 401) {
        const errBody = await res.json().catch(() => null)
        setDeleteSiteError(
          formatServerError(errBody, '인증이 필요합니다. 다시 로그인해주세요.'),
        )
        return
      }

      const errBody = await res.json().catch(() => null)
      setDeleteSiteError(formatServerError(errBody, `삭제 실패: ${res.status}`))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete site', e)
      setDeleteSiteError('팀 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeletingSite(false)
    }
  }

  const onSelectUser = (u: any) => {
    setSelectedUserIds((prev) => {
      const n = new Set(prev)
      if (n.has(u.id)) n.delete(u.id)
      else n.add(u.id)
      return n
    })
  }

  const deleteSelectedUsers = async () => {
    if (selectedUserIds.size === 0) return
    if (!confirm(`선택한 ${selectedUserIds.size}명의 팀원을 삭제하시겠습니까?`))
      return

    setIsDeletingUsers(true)
    setDeleteUsersError(null)
    try {
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (token) headers.Authorization = `Bearer ${token}`

      const ids = Array.from(selectedUserIds)

      // Prefer region/site-scoped bulk delete endpoint when available
      if (selectedRegionId && selectedSiteId) {
        const res = await fetch(
          `${API_BASE_URL}/api/region/${selectedRegionId}/sites/${selectedSiteId}/users`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify(ids),
          },
        )

        if (res.status === 200 || res.ok) {
          const body = await res.json().catch(() => null)
          const deletedIds: number[] = Array.isArray(body?.deletedIds)
            ? body.deletedIds
            : []
          const notDeletedIds: number[] = Array.isArray(body?.notDeletedIds)
            ? body.notDeletedIds
            : []

          if (deletedIds.length > 0) {
            setUsers((prev) => prev.filter((u) => !deletedIds.includes(u.id)))
          }
          // Keep not deleted ids selected
          setSelectedUserIds(new Set(notDeletedIds))

          if (notDeletedIds.length > 0) {
            setDeleteUsersError(
              `일부 팀원을 삭제하지 못했습니다: ${notDeletedIds.join(', ')}`,
            )
          }
          return
        }

        if (res.status === 401) {
          const errBody = await res.json().catch(() => null)
          setDeleteUsersError(
            formatServerError(
              errBody,
              '인증이 필요합니다. 다시 로그인해주세요.',
            ),
          )
          return
        }

        const errBody = await res.json().catch(() => null)
        setDeleteUsersError(
          formatServerError(errBody, `삭제 실패: ${res.status}`),
        )
        return
      }

      // Fallback: older endpoint
      const res = await fetch(`${API_BASE_URL}/api/users/delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          const errBody = await res.json().catch(() => null)
          setDeleteUsersError(
            formatServerError(
              errBody,
              '인증이 필요합니다. 다시 로그인해주세요.',
            ),
          )
          return
        }
        const errBody = await res.json().catch(() => null)
        setDeleteUsersError(
          formatServerError(errBody, `삭제 실패: ${res.status}`),
        )
        return
      }

      // success (fallback)
      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)))
      setSelectedUserIds(new Set())
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete users', e)
      setDeleteUsersError('팀원 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeletingUsers(false)
    }
  }

  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-13 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <nav className="h-1/10 border-b-1 flex items-center px-5 justify-center">
        <span className="text-2xl">명단 관리</span>
      </nav>

      <nav className="max-h-[70vh] overflow-y-auto border-b-1 flex flex-col p-3">
        <main className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Regions panel */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">현장(지역)</h2>
            <div className="overflow-y-auto max-h-64 w-full flex flex-col gap-2">
              {isLoadingRegions ? (
                <div className="text-center p-3">로딩중...</div>
              ) : regions.length === 0 ? (
                <div className="text-center p-3">현장 목록이 없습니다.</div>
              ) : (
                regions.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-md border w-full ${selectedRegionId === r.id ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
                  >
                    <span className="truncate">{r.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRegionId((prev) =>
                          prev === r.id ? null : r.id,
                        )
                      }
                      className="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]"
                    >
                      {selectedRegionId === r.id ? '해제' : '선택'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <input
                value={newRegionName}
                onChange={(e) => {
                  setNewRegionName(e.target.value)
                  if (newRegionError) setNewRegionError(null)
                }}
                type="text"
                placeholder="새 현장 이름을 입력해주세요"
                className="border border-zinc-500 rounded-md w-full p-2"
              />
              {newRegionError && (
                <div className="text-sm text-red-600 mt-2">
                  {newRegionError}
                </div>
              )}
              <button
                onClick={async () => {
                  const name = newRegionName.trim()
                  if (!name) return
                  setIsAddingRegion(true)
                  setNewRegionError(null)
                  try {
                    const token =
                      typeof window !== 'undefined'
                        ? window.localStorage.getItem('accessToken')
                        : null
                    const headers: Record<string, string> = {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                    }
                    if (token) headers.Authorization = `Bearer ${token}`

                    const res = await fetch(`${API_BASE_URL}/api/region`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ name }),
                    })

                    if (res.status === 409) {
                      const errBody = await res.json().catch(() => null)
                      setNewRegionError(
                        formatServerError(errBody, '이미 존재하는 현장입니다.'),
                      )
                      return
                    }

                    if (res.status === 401) {
                      const errBody = await res.json().catch(() => null)
                      setNewRegionError(
                        formatServerError(
                          errBody,
                          '인증이 필요합니다. 다시 로그인해주세요.',
                        ),
                      )
                      return
                    }

                    if (!res.ok) {
                      const errBody = await res.json().catch(() => null)
                      setNewRegionError(
                        formatServerError(errBody, `서버 오류: ${res.status}`),
                      )
                      return
                    }

                    const data = await res.json().catch(() => null)
                    if (data && data.id) {
                      setRegions((prev) => [...prev, data])
                      setNewRegionName('')
                      setSelectedRegionId(data.id)
                    } else {
                      const temp = { id: Date.now(), name }
                      setRegions((prev) => [...prev, temp])
                      setNewRegionName('')
                      setSelectedRegionId(temp.id)
                    }
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to add region', e)
                    setNewRegionError('현장 추가 중 오류가 발생했습니다.')
                    const temp = { id: Date.now(), name }
                    setRegions((prev) => [...prev, temp])
                    setNewRegionName('')
                    setSelectedRegionId(temp.id)
                  } finally {
                    setIsAddingRegion(false)
                  }
                }}
                disabled={isAddingRegion || newRegionName.trim() === ''}
                className={`w-full mt-2 bg-yellow-300 text-black p-2 rounded-md border ${isAddingRegion || newRegionName.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAddingRegion ? '추가중...' : '현장 추가'}
              </button>
            </div>
          </section>

          {/* Sites panel */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">팀</h2>
            <div className="overflow-y-auto max-h-64 w-full flex flex-col gap-2">
              {isLoadingSites ? (
                <div className="text-center p-3">로딩중...</div>
              ) : !selectedRegionId ? (
                <div className="text-center p-3">현장을 선택해주세요.</div>
              ) : sitesError ? (
                <div className="text-center p-3 text-red-600">{sitesError}</div>
              ) : sites.length === 0 ? (
                <div className="text-center p-3">등록된 팀이 없습니다.</div>
              ) : (
                sites.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-3 rounded-md border w-full ${selectedSiteId === s.id ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
                  >
                    <span className="truncate">{s.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSiteId((prev) =>
                          prev === s.id ? null : s.id,
                        )
                      }
                      className="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]"
                    >
                      {selectedSiteId === s.id ? '해제' : '선택'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <input
                value={newSiteName}
                onChange={(e) => {
                  setNewSiteName(e.target.value)
                  if (newSiteError) setNewSiteError(null)
                }}
                type="text"
                placeholder="새 팀 이름을 입력해주세요"
                className="border border-zinc-500 rounded-md w-full p-2"
                disabled={!selectedRegionId}
              />
              {newSiteError && (
                <div className="text-sm text-red-600 mt-2">{newSiteError}</div>
              )}
              <button
                onClick={async () => {
                  if (!selectedRegionId) return
                  const name = newSiteName.trim()
                  if (!name) return
                  setIsAddingSite(true)
                  setNewSiteError(null)
                  try {
                    const token =
                      typeof window !== 'undefined'
                        ? window.localStorage.getItem('accessToken')
                        : null
                    const headers: Record<string, string> = {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                    }
                    if (token) headers.Authorization = `Bearer ${token}`

                    const res = await fetch(
                      `${API_BASE_URL}/api/region/${selectedRegionId}/sites`,
                      {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ name }),
                      },
                    )

                    if (res.status === 409) {
                      const errBody = await res.json().catch(() => null)
                      setNewSiteError(
                        formatServerError(errBody, '이미 존재하는 팀 입니다'),
                      )
                      return
                    }

                    if (res.status === 401) {
                      const errBody = await res.json().catch(() => null)
                      setNewSiteError(
                        formatServerError(
                          errBody,
                          '인증이 필요합니다. 다시 로그인해주세요.',
                        ),
                      )
                      return
                    }

                    if (!res.ok) {
                      const errBody = await res.json().catch(() => null)
                      setNewSiteError(
                        formatServerError(errBody, `서버 오류: ${res.status}`),
                      )
                      return
                    }

                    const data = await res.json().catch(() => null)
                    if (data && data.id) {
                      setSites((prev) => [...prev, data])
                      setNewSiteName('')
                      setSelectedSiteId(data.id)
                    } else {
                      const temp = {
                        id: Date.now(),
                        name,
                        regionId: selectedRegionId,
                      }
                      setSites((prev) => [...prev, temp])
                      setNewSiteName('')
                      setSelectedSiteId(temp.id)
                    }
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to add site', e)
                    setNewSiteError('팀 추가 중 오류가 발생했습니다.')
                    const temp = {
                      id: Date.now(),
                      name: newSiteName.trim(),
                      regionId: selectedRegionId,
                    }
                    setSites((prev) => [...prev, temp])
                    setNewSiteName('')
                    setSelectedSiteId(temp.id)
                  } finally {
                    setIsAddingSite(false)
                  }
                }}
                disabled={
                  !selectedRegionId || isAddingSite || newSiteName.trim() === ''
                }
                className={`w-full mt-2 bg-yellow-300 text-black p-2 rounded-md border ${!selectedRegionId || isAddingSite || newSiteName.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAddingSite ? '추가중...' : '팀 추가'}
              </button>
            </div>
          </section>

          {/* Users panel */}
          <section className="bg-gray-300 p-4 flex flex-col rounded-md border">
            <h2 className="text-xl font-bold mb-3 text-center">팀원</h2>
            <div className="overflow-y-auto max-h-64 w-full flex flex-col gap-2">
              {isLoadingUsers ? (
                <div className="text-center p-3">로딩중...</div>
              ) : !selectedSiteId ? (
                <div className="text-center p-3">팀을 선택해주세요.</div>
              ) : usersError ? (
                <div className="text-center p-3 text-red-600">{usersError}</div>
              ) : users.length === 0 ? (
                <div className="text-center p-3">등록된 팀원이 없습니다.</div>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`flex items-center justify-between p-3 rounded-md border w-full ${selectedUserIds.has(u.id) ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-gray-400'}`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{u.name}</div>
                      <div className="text-xs text-gray-700 truncate">
                        {u.role} · {u.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectUser(u)
                      }}
                      className="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]"
                    >
                      {selectedUserIds.has(u.id) ? '해제' : '선택'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 w-full">
              <button
                onClick={() => setShowUserForm((s) => !s)}
                disabled={!selectedSiteId}
                className={`w-full mt-2 p-2 rounded-md border ${!selectedSiteId ? 'bg-gray-300 text-black' : 'bg-yellow-300 text-black'}`}
              >
                팀원 추가하기
              </button>

              <Link
                href="/admin/members/exel"
                className="w-full mt-3 p-2 rounded-md border border-dashed border-black bg-lime-100 text-lime-800 flex items-center justify-center"
              >
                엑셀로 추가
              </Link>

              {showUserForm && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    type="text"
                    placeholder="이름을 입력해주세요"
                    className="border border-zinc-500 rounded-md w-full p-2"
                  />
                  <input
                    value={newUserPhone}
                    onChange={(e) =>
                      setNewUserPhone(formatPhone(e.target.value))
                    }
                    type="text"
                    placeholder="전화번호를 입력해주세요"
                    className="border border-zinc-500 rounded-md w-full p-2"
                  />
                  {newUserError && (
                    <div className="text-sm text-red-600">{newUserError}</div>
                  )}
                  <button
                    onClick={async () => {
                      if (!selectedSiteId) return
                      const name = newUserName.trim()
                      const phone = formatPhone(newUserPhone)
                      if (!name || !phone) return
                      setIsAddingUser(true)
                      setNewUserError(null)
                      try {
                        const token =
                          typeof window !== 'undefined'
                            ? window.localStorage.getItem('accessToken')
                            : null
                        const headers: Record<string, string> = {
                          'Content-Type': 'application/json',
                          Accept: 'application/json',
                        }
                        if (token) headers.Authorization = `Bearer ${token}`

                        const payload = { name, phone, role: 'WORKER' }
                        const res = await fetch(
                          `${API_BASE_URL}/api/site/${selectedSiteId}/users`,
                          {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(payload),
                          },
                        )

                        if (res.status === 409) {
                          const errBody = await res.json().catch(() => null)
                          setNewUserError(
                            formatServerError(
                              errBody,
                              '이미 존재하는 팀원입니다.',
                            ),
                          )
                          return
                        }

                        if (res.status === 401) {
                          const errBody = await res.json().catch(() => null)
                          setNewUserError(
                            formatServerError(
                              errBody,
                              '인증이 필요합니다. 다시 로그인해주세요.',
                            ),
                          )
                          return
                        }

                        if (!res.ok) {
                          const errBody = await res.json().catch(() => null)
                          setNewUserError(
                            formatServerError(
                              errBody,
                              `서버 오류: ${res.status}`,
                            ),
                          )
                          return
                        }

                        const data = await res.json().catch(() => null)
                        if (data && data.id) {
                          setUsers((u) => [...u, data])
                          setNewUserName('')
                          setNewUserPhone('')
                          setShowUserForm(false)
                        } else {
                          const temp = {
                            id: Date.now(),
                            name,
                            phone,
                            role: 'WORKER',
                          }
                          setUsers((u) => [...u, temp])
                          setNewUserName('')
                          setNewUserPhone('')
                          setShowUserForm(false)
                        }
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Failed to add user', e)
                        setNewUserError('팀원 추가 중 오류가 발생했습니다.')
                        const temp = {
                          id: Date.now(),
                          name: newUserName.trim(),
                          phone: newUserPhone.trim(),
                          role: 'WORKER',
                        }
                        setUsers((u) => [...u, temp])
                        setNewUserName('')
                        setNewUserPhone('')
                        setShowUserForm(false)
                      } finally {
                        setIsAddingUser(false)
                      }
                    }}
                    disabled={
                      isAddingUser ||
                      newUserName.trim() === '' ||
                      newUserPhone.trim() === ''
                    }
                    className={`w-full bg-yellow-300 text-black border border-black py-2 rounded-md ${isAddingUser || newUserName.trim() === '' || newUserPhone.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isAddingUser ? '추가중...' : '팀원 추가'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </nav>

      <nav className="h-16 px-8 flex items-center">
        {deleteUsersError && (
          <div className="text-sm text-red-600 mr-4">{deleteUsersError}</div>
        )}
        {deleteSiteError && (
          <div className="text-sm text-red-600 mr-4">{deleteSiteError}</div>
        )}
        {deleteRegionError && (
          <div className="text-sm text-red-600 mr-4">{deleteRegionError}</div>
        )}
        <button
          onClick={() => {
            if (selectedUserIds.size > 0) deleteSelectedUsers()
            else if (selectedSiteId) deleteSelectedSite()
            else deleteSelectedRegion()
          }}
          disabled={
            (selectedUserIds.size === 0 &&
              !selectedSiteId &&
              !selectedRegionId) ||
            isDeletingRegion ||
            isDeletingSite ||
            isDeletingUsers
          }
          className={`bg-red-500 p-2 mt-2 w-full border rounded-md text-lg font-bold text-zinc-100 border-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed ${(selectedUserIds.size === 0 && !selectedSiteId && !selectedRegionId) || isDeletingRegion || isDeletingSite || isDeletingUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDeletingRegion || isDeletingSite || isDeletingUsers
            ? '삭제중...'
            : selectedUserIds.size > 0
              ? `선택한 팀원 삭제 (${selectedUserIds.size})`
              : selectedSiteId
                ? '선택된 팀 삭제'
                : selectedRegionId
                  ? '선택된 현장 삭제'
                  : '삭제하기'}
        </button>
      </nav>
    </section>
  )
}
