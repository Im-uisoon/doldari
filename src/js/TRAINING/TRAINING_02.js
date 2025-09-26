export const training02 = {
  id: "training_02",
  title: "용접작업",
  subtitle: "화재·질식·감전 예방 수칙",
  content: ["1) 가연물 반경 5m 이내 제거, 소화기 비치", "2) 용접면·보안경·방염복 등 보호구 착용", "3) 용접기 접지 상태 확인 및 절연 파손 점검", "4) 환기 확보로 유해가스·질식 위험 저감", "5) 작업 중 화재감시자 배치 및 화기취급 허가 준수"],
  footer: "교육자료 - 용접작업",
};

export function openTraining02Popup() {
  const d = training02;
  alert(`[${d.title}]\n\n${d.subtitle}\n\n- ${d.content.join("\n- ")}\n\n${d.footer}`);
}
