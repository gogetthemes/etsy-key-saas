import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, userId } = body;

    if (!keyword || !userId) {
      return NextResponse.json(
        { error: 'Missing keyword or userId' },
        { status: 400 }
      );
    }

    // Отправляем запрос в n8n через бэкенд
    const response = await fetch('https://etsy-key-saas.onrender.com/api/n8n/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, userId }),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('n8n trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
