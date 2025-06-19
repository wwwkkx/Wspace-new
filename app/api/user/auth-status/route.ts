import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 })
    }

    // 从数据库查询用户授权状态
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notionToken: true,
        notionDatabaseId: true,
        notionWorkspaceName: true,
        notionWorkspaceId: true,
        notionBotId: true,
        notionDatabaseName: true,
        notionAuthorizedAt: true,
      },
    })

    return Response.json({
      authorized: !!user?.notionToken,
      notionToken: user?.notionToken,
      databaseId: user?.notionDatabaseId,
      workspaceName: user?.notionWorkspaceName,
      workspaceId: user?.notionWorkspaceId,
      botId: user?.notionBotId,
      databaseName: user?.notionDatabaseName,
      authorizedAt: user?.notionAuthorizedAt,
    })
  } catch (error) {
    console.error("Error checking user auth status:", error)
    return Response.json({ error: "Failed to check auth status" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, notionToken, databaseId, workspaceName, workspaceId, botId, databaseName } = await req.json()

    if (!userId || !notionToken || !databaseId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 保存到数据库
    await prisma.user.update({
      where: { id: userId },
      data: {
        notionToken,
        notionDatabaseId: databaseId,
        notionWorkspaceName: workspaceName,
        notionWorkspaceId: workspaceId,
        notionBotId: botId,
        notionDatabaseName: databaseName,
        notionAuthorizedAt: new Date(),
      },
    })

    console.log("Saved user auth to database:", { userId, databaseId })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving user auth:", error)
    return Response.json({ error: "Failed to save auth" }, { status: 500 })
  }
}
