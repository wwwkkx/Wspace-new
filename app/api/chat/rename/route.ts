import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, newTitle } = await request.json();

    if (!sessionId || !newTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 验证会话是否属于当前用户
    // 首先根据email查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 更新会话标题
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        title: newTitle.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      session: updatedSession 
    });

  } catch (error) {
    console.error('Rename session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}