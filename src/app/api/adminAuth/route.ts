// client/src/app/api/adminAuth/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === 'admin' && password === 'admin123') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}