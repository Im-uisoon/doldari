'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { apiGet, API_BASE_URL } from '@/lib/api'

type ParsedRow = {
  rowIndex: number
  name: string
  phone: string
  role: string
  raw: any
  // errorType: null = OK, 'duplicate' = duplicate entry, 'data' = data validation error
  errorType?: 'duplicate' | 'data' | null
  status?: 'pending' | 'success' | 'failed'
}

export default function MembersExcelPage() {
  const [regions, setRegions] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [isLoadingSites, setIsLoadingSites] = useState(false)

  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultSummary, setResultSummary] = useState<string | null>(null)

  const dropRef = useRef<HTMLDivElement | null>(null)

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
    if (!selectedRegionId) return
    const fetchSites = async () => {
      setIsLoadingSites(true)
      try {
        const { data } = await apiGet(`/api/region/${selectedRegionId}/sites`)
        if (Array.isArray(data)) setSites(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load sites', e)
      } finally {
        setIsLoadingSites(false)
      }
    }
    fetchSites()
  }, [selectedRegionId])

  // Helpers
  const nameKeys = ['name', '이름', 'fullname', 'full name', 'Name']
  const phoneKeys = ['phone', '전화번호', 'tel', 'mobile', 'Phone']
  const roleKeys = ['role', '권한', 'Role']

  const findField = (obj: any, keys: string[]) => {
    if (!obj || typeof obj !== 'object') return ''
    const lowerMap: Record<string, string> = {}
    Object.keys(obj).forEach((k) => {
      lowerMap[k.toLowerCase().trim()] = k
    })
    for (const k of keys) {
      const found = lowerMap[k.toLowerCase()]
      if (found && obj[found] !== undefined && obj[found] !== null)
        return String(obj[found]).trim()
    }
    return ''
  }

  const formatPhone = (digits: string) => {
    const only = String(digits || '')
      .replace(/\D/g, '')
      .slice(0, 11)
    if (!only) return ''
    if (only.length <= 3) return only
    if (only.length <= 7) return `${only.slice(0, 3)}-${only.slice(3)}`
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`
  }

  // Validate row data and return an error type (or null if valid)
  const validateRow = (r: ParsedRow): 'data' | null => {
    if (!r.name || r.name.trim() === '') return 'data'
    const digits = (r.phone || '').replace(/\D/g, '')
    if (digits.length < 7) return 'data'
    return null
  }

  const handleFiles = async (fileList: FileList | null) => {
    setParseError(null)
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    setFileName(file.name)
    try {
      const data = await file.arrayBuffer()
      // dynamic import so app still builds even if xlsx isn't installed yet
      const XLSX: any = await import('xlsx')
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const raw: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      if (!Array.isArray(raw) || raw.length === 0) {
        setParseError('시트에 데이터가 없습니다.')
        setRows([])
        return
      }

      const parsed: ParsedRow[] = raw.map((r, idx) => {
        const name = findField(r, nameKeys)
        const phoneRaw = findField(r, phoneKeys)
        const role = findField(r, roleKeys) || 'WORKER'
        const phone = formatPhone(phoneRaw)
        const pr: ParsedRow = {
          rowIndex: idx + 1,
          name: name || '',
          phone: phone || '',
          role: role || 'WORKER',
          raw: r,
          errorType: null,
          status: 'pending',
        }
        pr.errorType = validateRow(pr)
        return pr
      })

      // Detect duplicates among valid rows (based on phone or name)
      const keyCounts = new Map<string, number>()
      parsed.forEach((p) => {
        if (p.errorType == null) {
          const key =
            (p.phone || '').replace(/\D/g, '') || p.name.trim().toLowerCase()
          if (key) keyCounts.set(key, (keyCounts.get(key) || 0) + 1)
        }
      })
      parsed.forEach((p) => {
        if (p.errorType == null) {
          const key =
            (p.phone || '').replace(/\D/g, '') || p.name.trim().toLowerCase()
          if (key && (keyCounts.get(key) || 0) > 1) {
            p.errorType = 'duplicate'
          }
        }
      })

      setRows(parsed)
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse file', e)
      setParseError('파일을 파싱하는 동안 오류가 발생했습니다.')
      setRows([])
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const resetAll = () => {
    setRows([])
    setFileName(null)
    setParseError(null)
    setResultSummary(null)
  }

  const proceed = async () => {
    if (!selectedSiteId) {
      alert('먼저 팀(혹은 site)을 선택해주세요.')
      return
    }
    if (rows.length === 0) return

    const preInvalidCount = rows.filter((r) => r.errorType != null).length
    if (preInvalidCount > 0) {
      if (
        !confirm(
          `오류가 있는 항목이 ${preInvalidCount}개 있습니다. 진행하면 오류 항목은 등록되지 않습니다. 계속하시겠습니까?`,
        )
      )
        return
    }

    setIsProcessing(true)
    setResultSummary(null)

    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (token) headers.Authorization = `Bearer ${token}`

    const toSend = rows.filter((r) => !r.errorType)
    const results = await Promise.allSettled(
      toSend.map((r) =>
        fetch(`${API_BASE_URL}/api/site/${selectedSiteId}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: r.name,
            phone: r.phone,
            role: r.role || 'WORKER',
          }),
        }),
      ),
    )

    const succeeded: ParsedRow[] = []
    const failed: {
      row: ParsedRow
      reason: string
      reasonType?: 'duplicate' | 'data'
    }[] = []

    for (let i = 0; i < results.length; i++) {
      const res = results[i]
      const row = toSend[i]
      if (res.status === 'fulfilled') {
        const response = res.value
        if (response.ok) {
          row.status = 'success'
          succeeded.push(row)
        } else {
          const errBody = await response.json().catch(() => null)
          const msg =
            (errBody && errBody.error) || `서버 오류: ${response.status}`
          if (
            response.status === 409 ||
            (typeof msg === 'string' && msg.toLowerCase().includes('exists'))
          ) {
            row.status = 'failed'
            row.errorType = 'duplicate'
            failed.push({ row, reason: msg, reasonType: 'duplicate' })
          } else {
            row.status = 'failed'
            row.errorType = 'data'
            failed.push({ row, reason: msg, reasonType: 'data' })
          }
        }
      } else {
        row.status = 'failed'
        row.errorType = 'data'
        failed.push({
          row,
          reason: String(res.reason || '네트워크 오류'),
          reasonType: 'data',
        })
      }
    }

    setRows((prev) =>
      prev.map((r) => {
        const succ = succeeded.find((s) => s.rowIndex === r.rowIndex)
        if (succ) return { ...r, status: 'success', errorType: null }
        const fail = failed.find((f) => f.row.rowIndex === r.rowIndex)
        if (fail) return { ...r, status: 'failed', errorType: fail.reasonType }
        return r
      }),
    )

    setIsProcessing(false)
    const summaryParts: string[] = []
    summaryParts.push(`${succeeded.length}개 등록 성공`)
    if (failed.length > 0) summaryParts.push(`${failed.length}개 등록 실패`)
    if (preInvalidCount > 0)
      summaryParts.push(`${preInvalidCount}개 유효성 오류로 등록하지 않음`)
    setResultSummary(summaryParts.join(' · '))
  }

  return (
    <section className="flex flex-col h-screen bg-neutral-100 text-zinc-600">
      <nav className="min-h-[52px] py-2 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <main className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/admin/members"
            aria-label="목록으로 돌아가기"
            className="p-1 rounded hover:bg-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-zinc-700"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold m-0">엑셀 일괄 등록</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium">현장</label>
            <select
              value={selectedRegionId ?? ''}
              onChange={(e) =>
                setSelectedRegionId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="mt-1 block w-full rounded-md border p-2"
            >
              <option value="">현장 선택</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium">팀</label>
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) =>
                setSelectedSiteId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="mt-1 block w-full rounded-md border p-2"
              disabled={!selectedRegionId}
            >
              <option value="">팀 선택</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium">파일</label>
            <div
              ref={dropRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="mt-1 h-28 rounded-md border-2 border-dashed flex items-center justify-center bg-white"
            >
              <div className="text-center">
                <div className="text-sm">엑셀 파일을 여기에 드래그하거나</div>
                <div className="mt-2">
                  <label className="inline-block bg-yellow-300 px-3 py-1 rounded-md cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={onFileInput}
                    />
                    파일 선택
                  </label>
                </div>
                {fileName && <div className="text-xs mt-2">{fileName}</div>}
              </div>
            </div>
            {parseError && (
              <div className="text-sm text-red-600 mt-2">{parseError}</div>
            )}
          </div>
        </div>

        <section className="mt-6 bg-white rounded-md p-4 border">
          <h2 className="text-base font-semibold mb-2">엑셀 리스트</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">이름</th>
                  <th className="p-2">전화번호</th>
                  <th className="p-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.rowIndex}
                    className={`${r.errorType ? 'bg-red-50' : r.status === 'success' ? 'bg-green-50' : ''}`}
                  >
                    <td className="p-2">{r.rowIndex}</td>
                    <td className="p-2 truncate">{r.name}</td>
                    <td className="p-2 truncate">{r.phone}</td>
                    <td className="p-2">
                      {r.status === 'success' ? (
                        <span className="text-green-700">완료</span>
                      ) : r.errorType === 'duplicate' ? (
                        <span className="text-red-600">오류(중복)</span>
                      ) : r.errorType === 'data' ? (
                        <span className="text-red-600">오류(자료오류)</span>
                      ) : (
                        <span>준비</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-4 text-sm text-zinc-500"
                    >
                      엑셀을 드래그하거나 파일을 선택하면 항목이 표시됩니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 w-full flex gap-2">
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-md border bg-white w-1/2"
            >
              취소하기
            </button>
            <button
              onClick={proceed}
              disabled={rows.length === 0 || isProcessing}
              className={`px-4 py-2 rounded-md border bg-yellow-300 ${rows.length === 0 || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? '처리중...' : '진행하기'}
            </button>
          </div>

          {resultSummary && <div className="mt-3 text-sm">{resultSummary}</div>}
        </section>
      </main>
    </section>
  )
}
