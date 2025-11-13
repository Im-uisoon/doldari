'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { kakao: any }
}

type UseKakaoMapOpts = {
  containerId?: string
  center?: { lat: number; lng: number }
  level?: number
  onMapClick?: (lat: number, lng: number) => void
}

export function useKakaoMap(opts: UseKakaoMapOpts = {}) {
  const {
    containerId = 'map',
    center = { lat: 37.5665, lng: 126.9780 },
    level = 5,
    onMapClick,
  } = opts

  const mapRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let resizeHandler: (() => void) | null = null
    let ro: ResizeObserver | null = null
    const onLoaded = () => { if (!mapRef.current) initMap() }

    // 이미 로드돼 있으면 즉시 init
    if (window.kakao?.maps && !mapRef.current) {
      initMap()
      return
    }

    // 스크립트가 이미 붙어있으면 load 이벤트만 걸고 종료
    const existed = document.querySelector<HTMLScriptElement>('script[data-kakao="true"]')
    if (existed) {
      existed.addEventListener('load', onLoaded, { once: true })
      if (window.kakao?.maps && !mapRef.current) initMap()
      return () => existed.removeEventListener('load', onLoaded)
    }

    // 새로 주입
    const script = document.createElement('script')
    script.dataset.kakao = 'true'
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`
    script.onload = () => window.kakao.maps.load(() => initMap())
    document.head.appendChild(script)

    function initMap() {
      const container = document.getElementById(containerId)
      if (!container || mapRef.current) return
      const kakao = window.kakao

      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level,
      })
      const geocoder = new kakao.maps.services.Geocoder()
      mapRef.current = map
      geocoderRef.current = geocoder
      setLoaded(true)

      if (onMapClick) {
        kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
          const latlng = mouseEvent?.latLng
          if (latlng?.getLat) onMapClick(latlng.getLat(), latlng.getLng())
          else onMapClick(center.lat, center.lng)
        })
      }

      // ✅ 컨테이너 크기 변화/회전에 대응해 재배치
      resizeHandler = () => mapRef.current?.relayout?.()
      window.addEventListener('resize', resizeHandler)

      ro = new ResizeObserver(() => mapRef.current?.relayout?.())
      ro.observe(container)
    }

    // ✅ cleanup
    return () => {
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      if (ro) { try { ro.disconnect() } catch {} }
    }
  }, [containerId, center.lat, center.lng, level, onMapClick])

  return { mapRef, geocoderRef, loaded }
}
