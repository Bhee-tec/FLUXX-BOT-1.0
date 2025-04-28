import { prisma } from 'lib/prisma'; // ✅ import properly
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, score } = req.body;

  if (!userId || score === undefined) {
    return res.status(400).json({ error: 'userId and score are required' });
  }

  try {
    const latestGameState = await prisma.gameState.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestGameState) {
      return res.status(404).json({ error: 'GameState not found' });
    }

    const updatedGameState = await prisma.gameState.update({
      where: { id: latestGameState.id },
      data: { score },
    });

    return res.status(200).json(updatedGameState);
  } catch (error) {
    console.error('Error updating score:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
