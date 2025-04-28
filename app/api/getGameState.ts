import { NextApiRequest, NextApiResponse } from 'next';
import { prisma }  from 'lib/prisma'; // Assuming you have a prisma instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const gameState = await prisma.gameState.findFirst({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' }, // Get the most recent game state
      });

      if (!gameState) {
        return res.status(404).json({ error: 'Game state not found' });
      }

      return res.status(200).json(gameState);
    } catch (err) {
        console.error('Error fetching game state', err);
      return res.status(500).json({ error: 'Error fetching game state' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
