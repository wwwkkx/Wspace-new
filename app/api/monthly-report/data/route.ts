import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取请求体数据
    const { year, month } = await req.json();

    // 验证参数
    if (!year || !month) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 获取用户ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 计算月份的开始和结束日期
    const startDate = new Date(year, month - 1, 1); // 月份从0开始，所以需要-1
    const endDate = new Date(year, month, 0); // 下个月的第0天就是当前月的最后一天

    // 查询该月的笔记
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 查询该月的文档
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 返回数据
    return NextResponse.json({ notes, documents });
  } catch (error) {
    console.error('获取月度数据失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}