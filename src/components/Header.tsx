'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRoleFromToken, getNameFromToken, clearAuth } from '../utils/auth'
import { API_BASE_URL } from '../lib/api'

export default function Header() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState<string | null>(null)

  // 클라이언트에서만 로컬 스토리지/세션을 읽어 displayName을 설정
  useEffect(() => {
    setDisplayName(getNameFromToken())
  }, [])

  const goHomeByRole = useCallback(() => {
    const role = (getRoleFromToken() || '').toLowerCase()
    if (role === 'admin') {
      router.push('/admin-main')
    } else if (role === 'siren') {
      router.push('/siren')
    } else {
      router.push('/main')
    }
  }, [router])

  const onLogout = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      })
    } catch (e) {
      // 서버 로그아웃 실패해도 클라이언트 로그아웃은 계속 진행
      console.error('Logout request failed', e)
    } finally {
      clearAuth()
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('loggedInUser')
        sessionStorage.removeItem('loggedInAdmin')
      }
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex justify-between items-center w-full">
      <button
        type="button"
        onClick={goHomeByRole}
        className="rounded hover:bg-zinc-200"
        aria-label="메인으로"
      >
        <span className="text-xl">돌다리</span>
      </button>

      <div className="flex gap-3 items-center">
        {displayName && (
          <span className="text-zinc-700 text-lg">{displayName} 님</span>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center rounded hover:bg-zinc-200"
          title="로그아웃"
          aria-label="로그아웃"
        >
          <span className="material-symbols-outlined text-zinc-700">
            logout
          </span>
        </button>
      </div>
    </div>
  )
}
