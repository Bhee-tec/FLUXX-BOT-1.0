import { NextApiRequest, NextApiResponse } from 'next';
import { prisma }from 'lib/prisma'; // Assuming you have a prisma instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, score, moves } = req.body;

    if (!userId || score === undefined || moves === undefined) {
      return res.status(400).json({ error: 'User ID, score, and moves are required' });
    }

    try {
      // Find the user's most recent game state
      const gameState = await prisma.gameState.findFirst({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' },
      });

      if (!gameState) {
        return res.status(404).json({ error: 'Game state not found' });
      }

      // Update the score and moves
      const updatedGameState = await prisma.gameState.update({
        where: { id: gameState.id },
        data: { score, moves },
      });

      return res.status(200).json(updatedGameState);
    } catch {
      return res.status(500).json({ error: 'Error updating game state' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
