import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, currentMoves } = req.body;

  if (!userId || currentMoves === undefined) {
    return res.status(400).json({ error: 'userId and currentMoves are required' });
  }

  try {
    // Find the latest game state for the user
    const latestGameState = await prisma.gameState.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestGameState) {
      return res.status(404).json({ error: 'GameState not found' });
    }

    // Update the moves
    const updatedGameState = await prisma.gameState.update({
      where: { id: latestGameState.id },
      data: { moves: currentMoves },
    });

    return res.status(200).json(updatedGameState);
  } catch (error) {
    console.error('Error updating moves:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}