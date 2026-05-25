import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const db = await checkDatabaseConnection()

  const body = {
    ok: db,
    db: db ? 'up' : 'down',
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, { status: db ? 200 : 503 })
}
