import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 })
    }

    const KAKAO_KEY =
      process.env.KAKAO_REST_API_KEY ||
      process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ||
      ''
    if (!KAKAO_KEY) {
      return NextResponse.json(
        { error: 'Kakao REST API key not configured on server' },
        { status: 500 },
      )
    }

    const kakaoGeoUrl = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(
      lon,
    )}&y=${encodeURIComponent(lat)}&input_coord=WGS84`

    const res = await fetch(kakaoGeoUrl, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
      },
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Kakao API error', details: data },
        { status: res.status },
      )
    }

    const doc = data?.documents?.[0] ?? {}
    const road = doc?.road_address
    const addr = doc?.address
    let composed = ''
    if (road?.address_name) composed = road.address_name
    else if (addr?.address_name) composed = addr.address_name
    else {
      const region2 = addr?.region_2depth_name
      const region3 = addr?.region_3depth_name
      if (region2 && region3) composed = `${region2} ${region3}`
      else composed = ''
    }

    return NextResponse.json({ address: composed })
  } catch (err) {
    console.error('Kakao geocode route error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
