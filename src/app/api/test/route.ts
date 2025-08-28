import { NextResponse } from 'next/server';
import { formatApiResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    const testData = {
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      endpoints: {
        yahoo: '/api/yahoo-finance/[symbol]',
        google: '/api/google-finance/[symbol]',
      },
      example: {
        yahoo: '/api/yahoo-finance/AAPL',
        google: '/api/google-finance/AAPL',
      },
    };

    return NextResponse.json(formatApiResponse(testData));
  } catch (error) {
    return NextResponse.json(
      formatApiResponse(null, false, 'Test API error'),
      { status: 500 }
    );
  }
}
