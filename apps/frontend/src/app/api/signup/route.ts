import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[API PROXY] Signup request received');
    
    // Получаем данные из запроса
    const body = await request.json();
    console.log('[API PROXY] Request body:', body);
    
    // Отправляем запрос на backend
    const backendUrl = 'https://etsy-key-saas.onrender.com/api/signup';
    console.log('[API PROXY] Sending to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('[API PROXY] Backend response status:', response.status);
    
    // Получаем ответ от backend
    const data = await response.json();
    console.log('[API PROXY] Backend response data:', data);
    
    // Возвращаем ответ с тем же статусом
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[API PROXY] Error:', error);
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