import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error("POST /api/notion/auth: 未授权访问")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log("POST /api/notion/auth: 接收到授权数据:", JSON.stringify(data))

    // 验证必要字段
    if (!data.notionToken || !data.notionDatabaseId) {
      console.error("POST /api/notion/auth: 缺少必要字段")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 更新用户的Notion授权信息
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notionToken: data.notionToken,
        notionDatabaseId: data.notionDatabaseId,
        workspaceName: data.workspaceName,
        workspaceId: data.workspaceId,
        botId: data.botId,
        databaseName: data.databaseName,
        authorizedAt: new Date(),
      },
    })

    console.log("POST /api/notion/auth: 用户Notion授权信息已更新:", session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/notion/auth: 保存授权信息出错:", error)
    return NextResponse.json({ error: "Failed to save authorization data" }, { status: 500 })
  }
}

// GET - 检查用户的Notion授权状态
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error("GET /api/notion/auth: 未授权访问")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("GET /api/notion/auth: 检查用户授权状态:", session.user.id)

    // 获取用户的Notion授权信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notionToken: true,
        notionDatabaseId: true,
        workspaceName: true,
        workspaceId: true,
        botId: true,
        databaseName: true,
        authorizedAt: true,
      },
    })

    // 检查是否已授权
    const authorized = !!user?.notionToken && !!user?.notionDatabaseId
    console.log("GET /api/notion/auth: 用户授权状态:", authorized ? "已授权" : "未授权")

    return NextResponse.json({
      authorized,
      notionToken: user?.notionToken,
      notionDatabaseId: user?.notionDatabaseId,
      workspaceName: user?.workspaceName,
      workspaceId: user?.workspaceId,
      botId: user?.botId,
      databaseName: user?.databaseName,
      authorizedAt: user?.authorizedAt,
    })
  } catch (error) {
    console.error("GET /api/notion/auth: 检查授权状态出错:", error)
    return NextResponse.json({ error: "Failed to check authorization status" }, { status: 500 })
  }
}

// DELETE - 清除用户的Notion授权信息
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error("DELETE /api/notion/auth: 未授权访问")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("DELETE /api/notion/auth: 清除用户授权信息:", session.user.id)

    // 清除用户的Notion授权信息
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notionToken: null,
        notionDatabaseId: null,
        workspaceName: null,
        workspaceId: null,
        botId: null,
        databaseName: null,
        authorizedAt: null,
      },
    })

    console.log("DELETE /api/notion/auth: 用户授权信息已清除:", session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/notion/auth: 清除授权信息出错:", error)
    return NextResponse.json({ error: "Failed to remove authorization" }, { status: 500 })
  }
}
