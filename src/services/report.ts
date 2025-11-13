// src/services/report.ts
import { apiGet, apiPut, apiPost } from '@/lib/api'
import type { Report } from '@/types/report'

export type ReportStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED'

export async function fetchReports() {
  const { data } = await apiGet('/api/admin/reports')
  return data as Report[]
}

export async function updateReportStatus(id: number, status: ReportStatus) {
  const path = `/api/admin/reports/${id}/status/${status}`
  await apiPut(path) // 204 또는 200 대응
}

export async function createReport(payload: { addressRoad: string }) {
  const { data } = await apiPost('/api/report', payload)
  return data as number // 생성된 reportId
}
