import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');
  const id = Number(telegramId);

  if (!telegramId || isNaN(id)) {
    return NextResponse.json({ error: 'Invalid or missing telegramId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: id },
      select: { score: true, moves: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { score: user.score, moves: user.moves },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId, score, moves } = await req.json();
    const id = Number(telegramId);

    if (!telegramId || isNaN(id) || typeof score !== 'number' || typeof moves !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { telegramId: id },
      data: { score, moves },
    });

    return NextResponse.json({
      success: true,
      data: { score: user.score, moves: user.moves },
    });
  } catch (error) {
    console.error('Error updating game data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
