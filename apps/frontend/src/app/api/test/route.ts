import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ ok: true, message: 'API routes work' });\n}\n
