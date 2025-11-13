export type ReportStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

export interface Report {
  id: number;

  // 신고자 표시용
  name: string;
  phone: string;

  // 주소/상태/생성시각
  addressRoad: string;
  status: ReportStatus;
  createdAt: string; // ISO 문자열

  // 현장/지역 (스냅샷 우선 표시가 서버에서 처리됨)
  siteId: number;
  siteName: string;
  regionId: number;
  regionName: string;

  lat?: number;
  lng?: number;
}
