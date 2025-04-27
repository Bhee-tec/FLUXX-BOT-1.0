import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'

// POST /api/user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    // Basic validation
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Find existing user by Telegram ID
    let existingUser = await prisma.user.findUnique({
      where: { telegramId: user.id },
    });

    // Create user if not exists
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          telegramId: user.id,
          username: user.username || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
        },
      });
    }

    // Return user data
    return NextResponse.json(existingUser);
  } catch (error) {
    console.error('Error processing user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
