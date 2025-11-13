import { NextResponse } from 'next/server'

// Simple in-memory cache for weather responses to reduce OpenWeather calls.
// NOTE: In serverless environments this cache may be ephemeral. For production
// use a shared cache (Redis) or a durable cache layer.
const cache = new Map<string, { ts: number; data: any }>()
const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 })
    }

    const key = `${Number(lat).toFixed(2)}:${Number(lon).toFixed(2)}`
    const now = Date.now()
    const ttl = Number(process.env.WEATHER_CACHE_TTL_MS) || DEFAULT_TTL

    // Return cached value when available
    const cached = cache.get(key)
    if (cached && now - cached.ts < ttl) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    const OPENWEATHER_KEY =
      process.env.OPENWEATHER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      ''
    if (!OPENWEATHER_KEY) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured on server' },
        { status: 500 },
      )
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
      lat,
    )}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(OPENWEATHER_KEY)}&units=metric&lang=kr`

    const res = await fetch(weatherUrl)

    // If OpenWeather returns 429, propagate with useful info
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const retryAfter = res.headers.get('Retry-After')
      const status = res.status
      const payload: any = { error: body?.message || 'OpenWeather API error' }
      if (retryAfter) payload.retryAfter = retryAfter
      return NextResponse.json(payload, { status })
    }

    const data = await res.json()

    // Cache the weather response
    try {
      cache.set(key, { ts: now, data })
    } catch (e) {
      // noop
    }

    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })
  } catch (err) {
    console.error('Weather route error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
