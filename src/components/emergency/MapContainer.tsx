'use client'
import { useKakaoMap } from './hooks/useKakaoMap'
import { useReportMarkers } from './hooks/useReportMarkers'
import type { Report } from '@/types/report'

type Props = {
  reports: Report[]
  focusedReport?: Report | null
  onMarkerClick?: (r: Report) => void
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapContainer({
  reports,
  focusedReport,
  onMarkerClick,
  onMapClick,
}: Props) {
  const { mapRef, geocoderRef, loaded } = useKakaoMap({
    containerId: 'map',
    onMapClick,
  })

  useReportMarkers(
    mapRef,
    reports,
    focusedReport ?? null,
    onMarkerClick,
    loaded,
    geocoderRef,
  )

  // ✅ 지도는 항상 부모 높이 100% 채움
  return <div id="map" className="w-full h-full" />
}
