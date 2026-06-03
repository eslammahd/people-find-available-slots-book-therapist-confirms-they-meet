import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight middleware — auth checks done client-side in pages
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []
};
