'use client'

import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_BASE_URL, apiGet, apiPost } from '../lib/api'

interface Region {
  id: number
  name: string
}

interface Site {
  id: number
  name: string
  regionId?: number
}

export default function LoginPage() {
  const router = useRouter()

  const [regions, setRegions] = useState<Region[]>([])
  const [sites, setSites] = useState<Site[]>([])

  const [region, setRegion] = useState<number | null>(null)
  const [site, setSite] = useState<number | null>(null)
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(false)

  // 마운트 시 regions 불러오기
  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true)
      try {
        const { data } = await apiGet('/api/region')
        if (Array.isArray(data)) setRegions(data)
      } catch (e) {
        console.error('Failed to fetch regions', e)
        setRegions([])
      } finally {
        setIsLoadingRegions(false)
      }
    }
    fetchRegions()
  }, [])

  // region 선택 시 해당 region의 sites 불러오기
  useEffect(() => {
    setSite(null)
    setSites([])
    if (region === null) return
    const fetchSites = async () => {
      setIsLoadingSites(true)
      try {
        const { data } = await apiGet(`/api/region/${region}/sites`)
        if (Array.isArray(data)) setSites(data)
      } catch (e) {
        console.error('Failed to fetch sites', e)
        setSites([])
      } finally {
        setIsLoadingSites(false)
      }
    }
    fetchSites()
  }, [region])

  const normalizedPhone = useMemo(
    () => String(phone || '').replace(/\D/g, ''),
    [phone],
  )

  const formatPhone = (digits: string) => {
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }

  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    setPhone(formatPhone(digits))
  }, [])

  const isButtonDisabled = useMemo(() => {
    return (
      region === null ||
      site === null ||
      !name.trim() ||
      normalizedPhone.length !== 11 ||
      isLoading
    )
  }, [region, site, name, normalizedPhone.length, isLoading])

  const login = useCallback(async () => {
    if (isButtonDisabled) return
    setLoginError(false)
    setIsLoading(true)
    try {
      const selectedRegion = regions.find((r) => r.id === region)
      const selectedSite = sites.find((s) => s.id === site)

      const payload = {
        name: name,
        phone: phone, // hyphenated format
        siteId: site as number,
      }

      const { data } = await apiPost('/auth/login', payload)
      const accessToken = data?.accessToken || data?.token
      if (!accessToken) throw new Error('No access token in response')

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', accessToken)
        if (data?.refreshToken)
          window.localStorage.setItem('refreshToken', data.refreshToken)
        if (data?.tokenType)
          window.localStorage.setItem('tokenType', data.tokenType)
        const sessionUser = {
          ...(data?.user || {}),
          regionId: region,
          region: selectedRegion?.name,
          siteId: site,
          site: selectedSite?.name,
          name,
          phone,
        }
        sessionStorage.setItem('loggedInUser', JSON.stringify(sessionUser))
      }

      router.push('/main')
    } catch (e) {
      console.error('Login failed:', e)
      setLoginError(true)
    } finally {
      setIsLoading(false)
    }
  }, [
    isButtonDisabled,
    region,
    site,
    name,
    normalizedPhone,
    regions,
    sites,
    phone,
    router,
  ])

  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600 w-full">
      {/* 1. 헤더 */}
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Link href="/" className="flex h-1/2 items-center justify-center">
          <span className="text-xl">돌다리</span>
        </Link>
        <Link href="/admin" className="flex h-1/2 items-center justify-center">
          <span>관리자 로그인</span>
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
        {/* 지역/현장 */}
        <div className="h-1/3 flex justify-around items-center px-5 gap-15">
          {/* 지역 */}
          <div className="w-1/2 mr-4">
            {/* 너비 조정 */}
            <label
              htmlFor="region"
              className="mb-2 font-bold text-[#767676] w-full text-left block"
            >
              지역
            </label>
            <select
              id="region"
              name="region"
              value={region ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null
                setRegion(val)
                // region이 바뀌면 site 초기화
                setSite(null)
              }}
              className="p-2 border-b w-full text-[#767676] bg-neutral-100 border-zinc-400 relative z-50 pointer-events-auto"
              aria-label="지역 선택"
            >
              <option value="">지역 선택</option>
              {isLoadingRegions ? (
                <option disabled>로딩중...</option>
              ) : (
                regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))
              )}
            </select>
          </div>
          {/* 현장 */}
          <div className="w-1/2 ml-4">
            {/* 너비 조정 */}
            <label
              htmlFor="site"
              className="mb-2 font-bold text-[#767676] w-full text-left block"
            >
              현장
            </label>
            <select
              id="site"
              name="site"
              value={site ?? ''}
              onChange={(e) =>
                setSite(e.target.value ? Number(e.target.value) : null)
              }
              className={`p-2 border-b w-full text-[#767676] bg-neutral-100 border-zinc-400 relative z-40 pointer-events-auto ${region === null ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="현장 선택"
              disabled={region === null || isLoadingSites}
            >
              <option value="">현장 선택</option>
              {isLoadingSites ? (
                <option disabled>로딩중...</option>
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
        {/* 이름/전화번호 */}
        <div className="h-2/3">
          <div className="flex flex-col h-full justify-center px-5">
            {/* 이름 */}
            <div className="flex flex-col gap-3 w-full mb-4">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded-md border-zinc-400 focus:outline-none"
              />
            </div>
            {/* 전화번호 */}
            <div className="flex flex-col gap-3 w-full mb-4">
              <label htmlFor="phone">전화번호</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="01012345678"
                maxLength={13}
                value={phone}
                onChange={handlePhoneChange}
                className="p-2 border rounded-md border-zinc-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* 4. 로그인 버튼 */}
      <nav className="h-1/5 px-5 flex items-center">
        <div className="w-full">
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={login}
            className={`
              rounded-xl border text-black py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg transition-colors inline-flex items-center space-x-2 w-full justify-center
              ${isButtonDisabled ? 'bg-gray-300 border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-yellow-300 border-yellow-400 hover:bg-yellow-400'}
            `}
          >
            <span className="text-lg">
              {isLoading ? '로그인 중...' : '로그인'}
            </span>
          </button>
          {loginError && (
            <p className="mt-2 text-red-600 text-sm" role="alert">
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
