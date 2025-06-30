import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://etsy-key-saas.onrender.com';

export async function POST(request: NextRequest) {
  try {
    console.log('[SIGNUP API] Request received');
    const body = await request.json();
    console.log('[SIGNUP API] Request body:', body);
    
    console.log('[SIGNUP API] Sending request to backend...');
    const response = await fetch(`${BACKEND_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('[SIGNUP API] Backend response status:', response.status);
    const data = await response.json();
    console.log('[SIGNUP API] Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[SIGNUP API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обработка OPTIONS запросов для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 