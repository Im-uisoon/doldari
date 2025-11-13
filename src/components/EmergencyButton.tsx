// src/components/EmergencyButton.tsx
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { apiPost } from '@/lib/api'
import toast from 'react-hot-toast'

type Props = {
  /** 실패 시 전화로 바로 연결할지 여부 */
  fallbackCallOnFail?: boolean
  /** 전화번호 (fallback 시 사용) */
  phoneNumber?: string
  /** 길게 누르기 지속 시간(ms) */
  holdDuration?: number
}

export default function EmergencyButton({
  fallbackCallOnFail = true,
  phoneNumber = '01039407145',
  holdDuration = 1200,
}: Props) {
  const [gaugeWidth, setGaugeWidth] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTsRef = useRef<number | null>(null)
  const triggeredRef = useRef(false)

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // ────────────────────────────────────────────────────────────
  // 1) 현재 위치 → 도로명 주소 변환
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    const REST_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
    if (!REST_KEY) throw new Error('Kakao REST KEY가 설정되어 있지 않습니다.')

    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${REST_KEY}` },
    })
    if (!res.ok) throw new Error(`카카오 주소 변환 실패 (${res.status})`)
    const json = await res.json()

    const road =
      json?.documents?.[0]?.road_address?.address_name ??
      json?.documents?.[0]?.address?.address_name

    if (!road) throw new Error('도로명 주소를 확인할 수 없습니다.')
    return road as string
  }, [])

  // 2) 신고 전송
  const sendReport = useCallback(
    async (addressRoad: string) => {
      const payload = {
        addressRoad,
        detail: '응급 신고 (현위치 자동 전송)',
      }
      // 서버가 JWT 인증이면 api.ts가 자동으로 Bearer 붙여줌
      await apiPost('/api/report', payload)
    },
    [],
  )

  // 3) 전체 플로우
  const triggerEmergency = useCallback(async () => {
    try {
      if (!('geolocation' in navigator)) {
        throw new Error('이 브라우저는 위치 정보 접근을 지원하지 않습니다.')
      }

      toast.loading('현재 위치 파악 중…', { id: 'sos' })
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }),
      )

      const { latitude: lat, longitude: lon } = pos.coords
      toast.loading('주소 변환 중…', { id: 'sos' })
      const addressRoad = await reverseGeocode(lat, lon)

      toast.loading('서버로 신고 전송 중…', { id: 'sos' })
      await sendReport(addressRoad)
      window.location.href = `tel:${phoneNumber}`
      toast.success('신고가 접수되었습니다!', { id: 'sos' })
    } catch (err) {
      console.error(err)
      toast.dismiss('sos')
      toast.error(
        err instanceof Error ? err.message : '신고 중 알 수 없는 오류가 발생했습니다.',
      )
      // 옵션: 실패 시 전화 연결
      if (fallbackCallOnFail && phoneNumber) {
        try {
          window.location.href = `tel:${phoneNumber}`
        } catch {
          /* noop */
        }
      }
    }
  }, [reverseGeocode, sendReport, fallbackCallOnFail, phoneNumber])

  // ────────────────────────────────────────────────────────────
  // 길게 누르기 애니메이션 (기존 UX 유지)
  const cancel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    startTsRef.current = null
    if (!triggeredRef.current) setGaugeWidth(0)
  }, [])

  const start = useCallback(() => {
    triggeredRef.current = false
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    startTsRef.current = null

    const onFrame = (ts: number) => {
      if (!startTsRef.current) startTsRef.current = ts
      const elapsed = ts - (startTsRef.current || 0)
      const progress = Math.min(1, elapsed / holdDuration)
      setGaugeWidth(progress * 100)

      if (progress >= 1) {
        triggeredRef.current = true
        // ✅ 여기서 신고 트리거
        triggerEmergency()
        cancel()
        return
      }
      animationRef.current = requestAnimationFrame(onFrame)
    }

    animationRef.current = requestAnimationFrame(onFrame)
  }, [holdDuration, triggerEmergency, cancel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        start()
      }
    },
    [start],
  )

  return (
    <button
      type="button"
      className="relative overflow-hidden w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center text-2xl font-bold select-none"
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      onKeyDown={handleKeyDown}
      aria-label="응급 신고"
    >
      <div
        className="absolute left-0 top-0 h-full bg-red-800"
        style={{ width: `${gaugeWidth}%`, transition: 'width 0.06s linear' }}
      />
      <span className="relative z-10">응급신고</span>
    </button>
  )
}
