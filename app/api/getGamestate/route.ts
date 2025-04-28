import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId'); // Use .get() to retrieve the query parameter

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const gameState = await prisma.gameState.findFirst({
      where: { userId: String(userId) },
      orderBy: { createdAt: 'desc' }, // Get the most recent game state
    });

    if (!gameState) {
      return NextResponse.json({ error: 'Game state not found' }, { status: 404 });
    }

    return NextResponse.json(gameState);
  } catch (err) {
    console.error('Error fetching game state:', err);
    return NextResponse.json({ error: 'Error fetching game state' }, { status: 500 });
  }
}
