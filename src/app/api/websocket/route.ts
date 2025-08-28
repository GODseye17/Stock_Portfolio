import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'WebSocket endpoint is available',
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.type === 'subscribe') {
      return NextResponse.json({
        type: 'subscription_confirmed',
        symbols: body.symbols,
        message: 'Successfully subscribed to symbols',
      });
    }
    
    if (body.type === 'heartbeat') {
      return NextResponse.json({
        type: 'heartbeat_response',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      type: 'message_received',
      data: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
