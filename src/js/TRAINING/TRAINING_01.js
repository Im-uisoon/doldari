export const training01 = {
  id: "training_01",
  title: "철근배근",
  subtitle: "안전수칙 및 작업 절차",
  content: ["1) 도면과 배근상세 확인 후 작업 순서 협의", "2) 철근 절단·가공부 비산물 정리 및 보호구 착용(안전모·장갑·보안경)", "3) 결속 시 손 끼임·찔림 예방, 결속선 잔여물 즉시 처리", "4) 이동/양중 시 신호수 배치, 낙하·전도 위험 구역 통제", "5) 완료 후 피복두께·간격 검측 및 사진 기록"],
  footer: "교육자료 - 철근배근",
};

export function openTraining01Popup() {
  const data = training01;
  alert(`[${data.title}]\n\n${data.subtitle}\n\n- ${data.content.join("\n- ")}\n\n${data.footer}`);
}
