import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  
  if (!room) {
    return NextResponse.json({ error: 'Room parameter is required' }, { status: 400 });
  }
  
  try {
    const messages = await prisma.message.findMany({
      where: { room },
      orderBy: { timestamp: 'asc' }
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { room, username, message } = body;
  
  if (!room || !username || !message) {
    return NextResponse.json({ error: 'Room, username and message are required' }, { status: 400 });
  }
  
  try {
    const newMessage = await prisma.message.create({
      data: {
        username,
        message,
        room,
        timestamp: new Date()
      }
    });
    
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}