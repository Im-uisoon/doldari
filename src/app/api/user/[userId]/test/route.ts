import { NextResponse } from 'next/server'

type TestStatus = 'NONE' | 'PASS' | 'FAIL'

function base64UrlDecode(input: string) {
  let str = input.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString('utf8')
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = base64UrlDecode(parts[1])
    return JSON.parse(payload)
  } catch (err) {
    return null
  }
}

const SAMPLE_TEST_DATA: Record<
  string,
  { status: TestStatus; testPassDate: string | null }
> = {
  // useful for local testing: user 1 -> PASS, user 2 -> FAIL, others -> NONE
  '1': { status: 'PASS', testPassDate: '2025-01-15T08:00:00.000Z' },
  '2': { status: 'FAIL', testPassDate: null },
}

export async function GET(req: Request, context: any) {
  const params = context?.params ?? {}
  try {
    const userId = params?.userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in path' },
        { status: 400 },
      )
    }

    const auth = req.headers.get('authorization')
    if (!auth) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 },
      )
    }

    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return NextResponse.json(
        { error: 'Malformed Authorization header' },
        { status: 401 },
      )
    }

    const token = parts[1]
    const payload = decodeJwtPayload(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // The project states the token contains usersId
    const tokenUserId = payload?.usersId ?? payload?.userId
    if (!tokenUserId) {
      return NextResponse.json(
        { error: 'Token does not contain usersId' },
        { status: 401 },
      )
    }

    if (String(tokenUserId) !== String(userId)) {
      return NextResponse.json(
        { error: 'Forbidden: userId mismatch' },
        { status: 403 },
      )
    }

    const stored = SAMPLE_TEST_DATA[String(userId)]
    const status = stored?.status ?? 'NONE'
    const testPassDate = stored?.testPassDate ?? null

    return NextResponse.json(
      { userId: Number(userId), status, testPassDate },
      { status: 200 },
    )
  } catch (err) {
    console.error('User test route error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
