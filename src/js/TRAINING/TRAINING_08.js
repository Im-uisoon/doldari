export const training08 = {
  id: "training_08",
  title: "고소작업",
  subtitle: "추락·전도·협착 위험 관리",
  content: ["1) 작업발판·사다리·고소작업대 점검 및 인증 확인", "2) 안전대·랜야드 체결 지점 확보 및 사용법 숙지", "3) 난간·발끝막이·개구부 덮개 설치", "4) 이동·주행 시 주변 낙하물·전선 접촉 주의", "5) 기상 악화 시 중지, 풍속·지면 상태 상시 확인"],
  footer: "교육자료 - 고소작업",
};

export function openTraining08Popup() {
  const d = training08;
  alert(`[${d.title}]\n\n${d.subtitle}\n\n- ${d.content.join("\n- ")}\n\n${d.footer}`);
}
