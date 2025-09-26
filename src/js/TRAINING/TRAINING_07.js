export const training07 = {
  id: "training_07",
  title: "전기공사",
  subtitle: "감전·화재·추락 예방 수칙",
  content: ["1) 작업전 무전원 확인/잠금표시(LOTO) 절차 준수", "2) 절연장갑·절연화·검전기 사용, 누전차단기 점검", "3) 습윤 환경 작업 금지, 방수·절연 유지", "4) 고소작업 병행 시 난간·추락방지대 확보", "5) 케이블 정리·표시, 오배선 방지 및 최종 검전"],
  footer: "교육자료 - 전기공사",
};

export function openTraining07Popup() {
  const d = training07;
  alert(`[${d.title}]\n\n${d.subtitle}\n\n- ${d.content.join("\n- ")}\n\n${d.footer}`);
}
