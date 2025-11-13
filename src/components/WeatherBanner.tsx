'use client'

import React, { useEffect } from 'react'
import { Noto_Sans_KR } from 'next/font/google'

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})
import { useWeather } from '../utils/weather'

export default function WeatherBanner() {
  const { state: weather, getters, actions } = useWeather()

  useEffect(() => {
    actions.initGeolocation()
  }, [actions])

  return (
    <div className={`${noto.className} w-full rounded-xl bg-blue-100 p-4`}>
      <div className="flex items-stretch justify-between gap-4 text-black">
        {/* 좌측: 아이콘 + 습도/풍속 */}
        <div className="flex-1 flex flex-col justify-between">
          <img
            src={getters.iconSrc}
            alt={`weather: ${getters.summaryShort}`}
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
          <div className="text-xs">
            습도 {weather.humidity ?? '-'}% · 풍속{' '}
            {getters.windSpeedDisplay ?? '-'} m/s
          </div>
        </div>

        {/* 우측: 지역명, 현재기온, 체감온도 */}
        <div className="flex-1 flex flex-col items-end justify-between">
          <div className="text-xs">{getters.locationDisplay}</div>
          <div className="text-4xl sm:text-5xl font-extrabold leading-none">
            {getters.tempDisplay}°C
          </div>
          <div className="text-xs">체감온도 {getters.feelsLikeDisplay}°C</div>
        </div>
      </div>
    </div>
  )
}
