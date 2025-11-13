// app/admin/login/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiPost } from '../lib/api'
import { clearAuth } from '../utils/auth'

interface AdminSession {
  userId?: string
  name: string
  role: string
}

const AdminLoginPage = () => {
  const router = useRouter()

  const [name, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginError, setLoginError] = useState<boolean>(false)

  const isButtonDisabled = useMemo(() => {
    return !name || !password
  }, [name, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isButtonDisabled) return
    setLoginError(false)

    try {
      const payload = { name, password }
      const { data } = await apiPost('/api/auth/admin-login', payload)

      const accessToken = data?.accessToken || data?.token
      if (!accessToken) throw new Error('No access token in response')

      // 토큰 저장
      window.localStorage.setItem('accessToken', accessToken)
      if (data?.refreshToken) {
        window.localStorage.setItem('refreshToken', data.refreshToken)
      }
      if (data?.tokenType) {
        window.localStorage.setItem('tokenType', data.tokenType)
      }
      if (data?.role) {
        window.localStorage.setItem('role', data.role)
      }

      // 관리자 정보 세션 저장
      const adminSession: AdminSession = {
        userId: data?.userId,
        name: data?.name ?? name,
        role: data?.role ?? 'ADMIN',
      }
      sessionStorage.setItem('loggedInAdmin', JSON.stringify(adminSession))

      // 이동 경로: role에 따라 다른 대시보드로 보냄
      const role = (data?.role ?? '').toLowerCase()
      if (role === 'admin') {
        router.push('/admin-main')
      } else if (role === 'siren') {
        router.push('/siren')
      } else {
        // 권한이 맞지 않으면 토큰 정리하고 로그인 실패
        clearAuth()
        sessionStorage.removeItem('loggedInAdmin')
        setLoginError(true)
      }
    } catch (e) {
      setLoginError(true)
    }
  }

  return (
    <section className="w-full flex flex-col h-screen bg-neutral-100 text-zinc-600">
      {/* 1. 헤더 */}
      <nav className="h-15 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Link href="/" className="flex h-1/2 items-center justify-center">
          <span className="text-xl">돌다리</span>
        </Link>
        <Link href="/login" className="flex h-1/2 items-center justify-center">
          <span>사용자 로그인</span>
        </Link>
      </nav>
      {/* 2. 로그인 메세지 */}
      <nav className="h-1/5 flex items-center px-5 justify-center">
        <div className="flex flex-col gap-3 h-full text-center justify-center mt-5">
          <p className="text-4xl font-bold text-zinc-600">돌다리</p>
          <p className="text-zinc-500">안전하게 일하는 그날까지!</p>
        </div>
      </nav>
      {/* 3. 로그인 폼 */}
      <nav className="h-3/5 flex flex-col">
        {/* 이름/전화번호 */}
        <div className="h-2/3">
          <form
            onSubmit={handleLogin}
            className="flex flex-col h-full justify-center px-5"
          >
            {/* 이름 */}
            <div className="flex flex-col gap-3 w-full mb-4">
              <label htmlFor="name" className="">
                이름
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="name"
                placeholder="홍길동"
                className="p-2 border-1 rounded-md"
              />
            </div>
            {/* 비밀번호 */}
            <div className="flex flex-col gap-3 w-full mb-4">
              <label htmlFor="password" className="">
                비밀번호
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="비밀번호"
                className="p-2 border-1 rounded-md"
              />
            </div>
          </form>
        </div>
      </nav>
      {/* 4. 로그인 버튼 */}
      <nav className="h-1/5 px-5 flex items-center">
        <div className="w-full">
          <button
            disabled={isButtonDisabled}
            onClick={handleLogin}
            className="rounded-xl border-1 border-gray-400 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg transition-colors inline-flex items-center space-x-2 w-full justify-center"
          >
            <span className="text-lg">로그인</span>
          </button>
          {loginError && (
            <p className="mt-2 text-red-600 text-sm">
              로그인에 실패했습니다. 정보를 확인해 주세요.
            </p>
          )}
        </div>
      </nav>
      {/* 5. 푸터 */}
      <nav className="h-1/10 border-t-1 border-zinc-400">
        <p className="flex h-full items-center justify-center text-zinc-400 text-sm">
          &copy; 2025 돌다리. ALL RIGHTS RESERVED.
        </p>
      </nav>
    </section>
  )
}

export default AdminLoginPage
