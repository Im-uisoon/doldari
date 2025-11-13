'use client'

import { getTrainingById, formatTrainingText } from './index'

export function openTrainingPopup(id: string) {
  const t = getTrainingById(id)
  if (!t) {
    alert('교육자료를 찾을 수 없습니다.')
    return
  }
  alert(formatTrainingText(t))
}
