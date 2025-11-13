import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type WeatherState = {
  lat?: number
  lon?: number
  temp?: number
  feelsLike?: number
  humidity?: number
  windSpeed?: number
  weatherMain?: string
  weatherDesc?: string
  weatherIcon?: string
  address?: string

  loading: boolean
  ready: boolean
  error?: string | null

  lastWeatherUrl?: string
  lastGeocodeUrl?: string
  lastWeatherRaw?: any
  lastGeocodeRaw?: any
}

export type WeatherGetters = {
  iconSrc: string
  summaryShort: string
  windSpeedDisplay?: string
  locationDisplay: string
  tempDisplay: string
  feelsLikeDisplay: string
}

export type WeatherActions = {
  initGeolocation: () => void
  refresh: () => void
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    loading: false,
    ready: false,
    error: null,
  })

  const activeController = useRef<AbortController | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      try {
        activeController.current?.abort()
      } catch (e) {
        // noop
      }
    }
  }, [])

  const setSafeState = useCallback((patch: Partial<WeatherState>) => {
    if (!mounted.current) return
    setState((s) => ({ ...s, ...patch }))
  }, [])

  const fetchWeatherAndAddress = useCallback(
    async (lat: number, lon: number) => {
      try {
        activeController.current?.abort()
      } catch (e) {
        // noop
      }
      const controller = new AbortController()
      activeController.current = controller

      setSafeState({ loading: true, error: null, lat, lon })

      let weatherPlaceName: string | undefined = undefined

      // Fetch weather
      try {
        const weatherUrl = `/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
        setSafeState({ lastWeatherUrl: weatherUrl })
        console.debug('[useWeather] fetching weather URL:', weatherUrl)

        const wRes = await fetch(weatherUrl, { signal: controller.signal })
        const payload = await wRes.json().catch(() => null)
        setSafeState({ lastWeatherRaw: payload })
        console.debug('[useWeather] weather response:', payload)

        if (!wRes.ok) {
          const errMsg =
            payload?.message ||
            payload?.error ||
            `Weather API error ${wRes.status}`
          setSafeState({ error: errMsg })
        } else {
          const wData = payload
          const weather = (wData?.weather && wData.weather[0]) || null
          const main = wData?.main || {}
          const wind = wData?.wind || {}
          weatherPlaceName =
            typeof wData?.name === 'string' ? wData.name : undefined

          setSafeState({
            temp: typeof main.temp === 'number' ? main.temp : undefined,
            feelsLike:
              typeof main.feels_like === 'number' ? main.feels_like : undefined,
            humidity:
              typeof main.humidity === 'number' ? main.humidity : undefined,
            windSpeed: typeof wind.speed === 'number' ? wind.speed : undefined,
            weatherMain: weather?.main ?? undefined,
            weatherDesc: weather?.description ?? undefined,
            weatherIcon: weather?.icon ?? undefined,
          })
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        setSafeState({ error: err?.message ?? 'Weather fetch failed' })
      }

      try {
        const geocodeUrl = `/api/geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
        setSafeState({ lastGeocodeUrl: geocodeUrl })
        console.debug('[useWeather] fetching geocode URL:', geocodeUrl)

        const gRes = await fetch(geocodeUrl, { signal: controller.signal })
        const gPayload = await gRes.json().catch(() => null)
        setSafeState({ lastGeocodeRaw: gPayload })
        console.debug('[useWeather] geocode response:', gPayload)

        let addr = ''
        if (gRes.ok) {
          addr = gPayload?.address || ''
        }

        if (!addr && weatherPlaceName) {
          const name = weatherPlaceName.trim()
          const hasKorean = /[가-힣]/.test(name)
          const endsWithAdmin =
            /(시|군|구|도|특별시|광역시|특별자치시|특별자치도)$/.test(name)
          addr = hasKorean && !endsWithAdmin ? `${name}시` : name
        }

        setSafeState({ address: addr })
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        setSafeState({ address: '' })
      } finally {
        setSafeState({ loading: false, ready: true })
      }
    },
    [setSafeState],
  )

  const fallbackToIp = useCallback(async () => {
    try {
      setSafeState({ loading: true, error: null })
      const res = await fetch('https://ipapi.co/json')
      if (!res.ok) throw new Error('IP geolocation failed')
      const data = await res.json()
      const lat = Number(data.latitude ?? data.lat)
      const lon = Number(data.longitude ?? data.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('Unable to determine location from IP')
      }
      await fetchWeatherAndAddress(lat, lon)
    } catch (err: any) {
      setSafeState({
        loading: false,
        error: err?.message ?? 'Location lookup failed',
      })
    }
  }, [fetchWeatherAndAddress, setSafeState])

  const initGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) {
      fallbackToIp()
      return
    }

    if (!navigator.geolocation) {
      fallbackToIp()
      return
    }

    setSafeState({ loading: true, error: null })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        fetchWeatherAndAddress(lat, lon).catch(() => {})
      },
      (err) => {
        console.warn('geolocation error, falling back to IP', err)
        fallbackToIp()
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1000 * 60 * 5 },
    )
  }, [fetchWeatherAndAddress, fallbackToIp, setSafeState])

  const refresh = useCallback(() => {
    if (typeof state.lat === 'number' && typeof state.lon === 'number') {
      fetchWeatherAndAddress(state.lat, state.lon).catch(() => {})
    } else {
      initGeolocation()
    }
  }, [fetchWeatherAndAddress, initGeolocation, state.lat, state.lon])

  const iconSrc = useMemo(() => {
    const main = (state.weatherMain || '').toLowerCase()
    if (main.includes('clear')) return '/weather/sunny.svg'
    if (main.includes('cloud')) return '/weather/cloud.svg'
    if (
      main.includes('rain') ||
      main.includes('drizzle') ||
      main.includes('thunder')
    )
      return '/weather/rainy.svg'
    if (main.includes('snow')) return '/weather/snow.svg'
    if (
      main.includes('mist') ||
      main.includes('fog') ||
      main.includes('haze') ||
      main.includes('smoke') ||
      main.includes('dust') ||
      main.includes('ash')
    )
      return '/weather/foggy.svg'
    if (main.length > 0) return '/weather/cloud.svg'
    return '/weather/foggy.svg'
  }, [state.weatherMain])

  const tempDisplay = useMemo(() => {
    if (typeof state.temp !== 'number') return '-'
    return Math.round(state.temp).toString()
  }, [state.temp])

  const feelsLikeDisplay = useMemo(() => {
    if (typeof state.feelsLike !== 'number') return '-'
    return Math.round(state.feelsLike).toString()
  }, [state.feelsLike])

  const windSpeedDisplay = useMemo(() => {
    if (typeof state.windSpeed !== 'number') return undefined
    return (state.windSpeed ?? 0).toFixed(1)
  }, [state.windSpeed])

  const locationDisplay = useMemo(() => {
    const addr = state.address
    if (addr) {
      const si = addr.match(/([가-힣]+시)/)
      if (si) return si[1]
      const gu = addr.match(/([가-힣]+구)/)
      if (gu) return gu[1]
      const gun = addr.match(/([가-힣]+군)/)
      if (gun) return gun[1]
      const doMatch = addr.match(/([가-힣]+도)/)
      if (doMatch) return doMatch[1]
      return addr.split(/\s+/)[0] || addr
    }
    if (state.loading) return '로딩 중...'
    return '-'
  }, [state.address, state.loading])

  const summaryShort = useMemo(() => {
    if (state.weatherMain) return state.weatherMain
    if (state.weatherDesc) return state.weatherDesc
    return '-'
  }, [state.weatherMain, state.weatherDesc])

  const getters: WeatherGetters = useMemo(
    () => ({
      iconSrc,
      summaryShort,
      windSpeedDisplay,
      locationDisplay,
      tempDisplay,
      feelsLikeDisplay,
    }),
    [
      iconSrc,
      summaryShort,
      windSpeedDisplay,
      locationDisplay,
      tempDisplay,
      feelsLikeDisplay,
    ],
  )

  const actions: WeatherActions = useMemo(
    () => ({ initGeolocation, refresh }),
    [initGeolocation, refresh],
  )

  return { state, getters, actions }
}
