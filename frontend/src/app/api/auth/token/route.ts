import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token creation error:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
