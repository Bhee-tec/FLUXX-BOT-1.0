import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prisma'; // Adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // 1. Find the latest GameState for the user
    const latestGameState = await prisma.gameState.findFirst({
      where: { userId: String(userId) },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestGameState) {
      return res.status(404).json({ error: 'GameState not found for user' });
    }

    // 2. Calculate points
    const calculatedPoints = Math.floor(latestGameState.score / 10000);

    // 3. Update the User's points
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) },
      data: { points: calculatedPoints },
    });

    return res.status(200).json({
      message: 'Points updated successfully',
      points: updatedUser.points,
    });
  } catch (error) {
    console.error('Error updating user points:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
