import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 断开Notion连接
export async function DELETE() {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否已登录
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 简单的管理员验证（实际应用中应该有更严格的权限控制）
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: '没有管理员权限' }, { status: 403 });
    }
    
    // 查找所有有Notion配置的用户并清除配置
    // 在实际应用中，可能需要更精确的控制，比如只清除特定用户的配置
    await prisma.user.updateMany({
      where: {
        notionToken: {
          not: null
        }
      },
      data: {
        notionToken: null,
        notionDatabaseId: null,
        workspaceName: null,
        workspaceId: null,
        botId: null,
        databaseName: null,
        authorizedAt: null
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('断开Notion连接失败:', error);
    return NextResponse.json({ error: '断开Notion连接失败' }, { status: 500 });
  }
}