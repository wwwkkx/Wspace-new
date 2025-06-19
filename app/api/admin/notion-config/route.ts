import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取Notion配置
export async function GET() {
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
    
    // 查询数据库中的Notion配置
    // 这里假设我们使用第一个有Notion配置的用户作为管理员配置
    // 实际应用中可能需要专门的管理员配置表
    const user = await prisma.user.findFirst({
      where: {
        notionToken: {
          not: null
        }
      },
      select: {
        notionToken: true,
        notionDatabaseId: true,
        workspaceName: true,
        workspaceId: true,
        botId: true,
        databaseName: true,
        authorizedAt: true
      }
    });
    
    if (!user || !user.notionToken) {
      return NextResponse.json(null);
    }
    
    // 返回Notion配置信息
    return NextResponse.json({
      workspaceName: user.workspaceName,
      workspaceId: user.workspaceId,
      databaseName: user.databaseName,
      notionDatabaseId: user.notionDatabaseId,
      authorizedAt: user.authorizedAt
    });
    
  } catch (error) {
    console.error('获取Notion配置失败:', error);
    return NextResponse.json({ error: '获取Notion配置失败' }, { status: 500 });
  }
}