export interface TrainingItem {
  id: string
  title: string
  subtitle: string
  content: string[]
  footer?: string
}

export const training01: TrainingItem = {
  id: 'training_01',
  title: '철근배근',
  subtitle: '안전수칙 및 작업 절차',
  content: [
    '1) 도면과 배근상세 확인 후 작업 순서 협의',
    '2) 철근 절단·가공부 비산물 정리 및 보호구 착용(안전모·장갑·보안경)',
    '3) 결속 시 손 끼임·찔림 예방, 결속선 잔여물 즉시 처리',
    '4) 이동/양중 시 신호수 배치, 낙하·전도 위험 구역 통제',
    '5) 완료 후 피복두께·간격 검측 및 사진 기록',
  ],
  footer: '교육자료 - 철근배근',
}

export const training02: TrainingItem = {
  id: 'training_02',
  title: '용접작업',
  subtitle: '화재·질식·감전 예방 수칙',
  content: [
    '1) 가연물 반경 5m 이내 제거, 소화기 비치',
    '2) 용접면·보안경·방염복 등 보호구 착용',
    '3) 용접기 접지 상태 확인 및 절연 파손 점검',
    '4) 환기 확보로 유해가스·질식 위험 저감',
    '5) 작업 중 화재감시자 배치 및 화기취급 허가 준수',
  ],
  footer: '교육자료 - 용접작업',
}

export const training03: TrainingItem = {
  id: 'training_03',
  title: '비계설치',
  subtitle: '추락·전도·붕괴 예방 수칙',
  content: [
    '1) 지반 다짐·침하 확인, 받침판·베이스 적정 설치',
    '2) 수직·수평 수평기 확인 및 가새·연결재 체결',
    '3) 작업발판 폭·난간·발끝막이 규격 준수',
    '4) 하중 분산·적재량 준수, 부재 손상 여부 점검',
    '5) 출입통제·표지판 설치 및 작업허가 절차 준수',
  ],
  footer: '교육자료 - 비계설치',
}

export const training04: TrainingItem = {
  id: 'training_04',
  title: '나사박음질',
  subtitle: '전동공구 안전 사용 및 체결 품질',
  content: [
    '1) 드릴·임팩 등 전동공구 비상정지/절연상태 점검',
    '2) 토크 기준 준수 및 풀림방지 와셔 적용',
    '3) 손 끼임·날부 맞닿음 방지, 장갑·보안경 착용',
    '4) 체결 후 표시·재점검, 불량 체결 즉시 교체',
    '5) 비산물·칩 제거, 작업구역 정리정돈',
  ],
  footer: '교육자료 - 나사박음질',
}

export const training05: TrainingItem = {
  id: 'training_05',
  title: '콘크리트타설',
  subtitle: '폼·거푸집·타설·양생 안전 수칙',
  content: [
    '1) 거푸집·동바리 지지상태 및 붕괴 위험 점검',
    '2) 펌프카 전도·접지 확인, 붐 접근 제한',
    '3) 타설 순서·층당 타설 높이 준수, 과다 편심 방지',
    '4) 작업자 미끄럼·낙상 방지(안전화·난간·통로 확보)',
    '5) 타설 후 표면 정리, 양생 관리 및 출입통제',
  ],
  footer: '교육자료 - 콘크리트타설',
}

export const training06: TrainingItem = {
  id: 'training_06',
  title: '절단연마작업',
  subtitle: '그라인더·절단기 안전 사용 수칙',
  content: [
    '1) 절단석 균열·파손 점검 및 규격 적합품 사용',
    '2) 보안경·방진마스크·장갑·귀마개 착용',
    '3) 스파크 비산 차단, 가연물 제거 및 불티 감시',
    '4) 케이블 손상·눌림 방지, 전원 플러그 분리 후 교체',
    '5) 양손 그립 유지·반동 주의, 클램프 고정 후 작업',
  ],
  footer: '교육자료 - 절단연마작업',
}

export const training07: TrainingItem = {
  id: 'training_07',
  title: '전기공사',
  subtitle: '감전·화재·추락 예방 수칙',
  content: [
    '1) 작업전 무전원 확인/잠금표시(LOTO) 절차 준수',
    '2) 절연장갑·절연화·검전기 사용, 누전차단기 점검',
    '3) 습윤 환경 작업 금지, 방수·절연 유지',
    '4) 고소작업 병행 시 난간·추락방지대 확보',
    '5) 케이블 정리·표시, 오배선 방지 및 최종 검전',
  ],
  footer: '교육자료 - 전기공사',
}

export const training08: TrainingItem = {
  id: 'training_08',
  title: '고소작업',
  subtitle: '추락·전도·협착 위험 관리',
  content: [
    '1) 작업발판·사다리·고소작업대 점검 및 인증 확인',
    '2) 안전대·랜야드 체결 지점 확보 및 사용법 숙지',
    '3) 난간·발끝막이·개구부 덮개 설치',
    '4) 이동·주행 시 주변 낙하물·전선 접촉 주의',
    '5) 기상 악화 시 중지, 풍속·지면 상태 상시 확인',
  ],
  footer: '교육자료 - 고소작업',
}

export const trainingsById: Record<string, TrainingItem> = {
  [training01.id]: training01,
  [training02.id]: training02,
  [training03.id]: training03,
  [training04.id]: training04,
  [training05.id]: training05,
  [training06.id]: training06,
  [training07.id]: training07,
  [training08.id]: training08,
}

export function getTrainingById(id: string): TrainingItem | undefined {
  return trainingsById[id]
}

export function formatTrainingText(t: TrainingItem): string {
  return `[${t.title}]\n\n${t.subtitle}\n\n- ${t.content.join('\n- ')}\n\n${t.footer ?? ''}`
}
