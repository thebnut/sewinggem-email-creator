import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ user: null });
  }
  
  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
    },
  });
}