// src/components/emergency/hooks/useReportMarkers.ts
'use client'
import { useEffect, useRef } from 'react'
import type { Report } from '@/types/report'

type KakaoNS = typeof window & { kakao?: any }

export function useReportMarkers(
  mapRef: any,
  reports: Report[],
  focusedReport: Report | null,
  onMarkerClick?: (r: Report) => void,
  loaded?: boolean,
  geocoderRef?: any,
) {
  const markersRef = useRef<Map<number, any>>(new Map())
  const cacheRef   = useRef<Map<string, {lat:number; lng:number}>>(new Map())
  const fittedOnceRef = useRef(false)        // ✅ auto-fit 1회 제한
  const lastFocusIdRef = useRef<number|null>(null)

  // reports 길이가 바뀌면 auto-fit 다시 1회 허용
  useEffect(() => {
    fittedOnceRef.current = false
  }, [reports.length])

  // 마커 생성/갱신
  useEffect(() => {
    const map = mapRef?.current
    const kakao = (window as KakaoNS).kakao
    const geocoder = geocoderRef?.current
    if (!loaded || !map || !kakao?.maps) return

    // 기존 마커 제거
    for (const m of markersRef.current.values()) m.setMap(null)
    markersRef.current.clear()

    const bounds = new kakao.maps.LatLngBounds()
    let placed = 0
    const pending: Promise<void>[] = []

    const makeMarker = (r: Report, lat: number, lng: number) => {
      const pos = new kakao.maps.LatLng(lat, lng)
      bounds.extend(pos)
      const marker = new kakao.maps.Marker({ position: pos, clickable: true })
      marker.setMap(map)
      if (onMarkerClick) kakao.maps.event.addListener(marker, 'click', () => onMarkerClick(r))
      markersRef.current.set(r.id, marker)
      placed++
    }

    for (const r of reports) {
      const hasCoord = typeof (r as any).lat === 'number' && typeof (r as any).lng === 'number'
      if (hasCoord) {
        makeMarker(r, (r as any).lat, (r as any).lng)
        continue
      }

      const addr = (r as any).addressRoad || (r as any).address_road
      if (!addr || !geocoder) continue

      const cached = cacheRef.current.get(addr)
      if (cached) {
        makeMarker(r, cached.lat, cached.lng)
      } else {
        pending.push(new Promise<void>((resolve) => {
          geocoder.addressSearch(addr, (result: any[], status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const lat = parseFloat(result[0].y)
              const lng = parseFloat(result[0].x)
              cacheRef.current.set(addr, { lat, lng })
              makeMarker(r, lat, lng)
            }
            resolve()
          })
        }))
      }
    }

    Promise.all(pending).then(() => {
      // ✅ 포커싱 중이거나 이미 한 번 맞춘 경우엔 setBounds 스킵
      if (
        placed > 0 &&
        !focusedReport &&
        !fittedOnceRef.current
      ) {
        map.setBounds(bounds)
        fittedOnceRef.current = true
      }
    })
  }, [reports, mapRef, onMarkerClick, loaded, geocoderRef, focusedReport])

  // 포커싱: 마커 좌표 우선 + relayout 이후 이동
  useEffect(() => {
    const map = mapRef?.current
    const kakao = (window as KakaoNS).kakao
    if (!loaded || !map || !kakao?.maps) return
    // zIndex 초기화
    markersRef.current.forEach((m) => m.setZIndex(0))
    if (!focusedReport) return

    const marker = markersRef.current.get(focusedReport.id)
    if (!marker) return
    marker.setZIndex(999)
    lastFocusIdRef.current = focusedReport.id

    const pos = marker.getPosition?.()
    if (!pos) return
    
    map.setLevel(3)

    if (map.relayout) map.relayout()
    requestAnimationFrame(() => setTimeout(() => map.panTo(pos), 0))
  }, [focusedReport, reports, mapRef, loaded])

  return { markersRef }
}
