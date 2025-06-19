export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const error = url.searchParams.get("error")
    const errorDescription = url.searchParams.get("error_description")

    console.log("Notion callback received:", { code: !!code, state, error })

    // 如果有错误，重定向回应用并显示错误信息
    if (error) {
      console.error("Notion auth error:", error, errorDescription)
      const errorMessage = encodeURIComponent(errorDescription || error || "未知错误");
      return Response.redirect(`${url.origin}/settings?notionError=${errorMessage}`, 302)
    }

    // 如果没有授权码，重定向回应用并显示错误信息
    if (!code) {
      console.error("No code received from Notion")
      const errorMessage = encodeURIComponent("未获取到授权码");
      return Response.redirect(`${url.origin}/settings?notionError=${errorMessage}`, 302)
    }

    // 获取Notion访问令牌
    const clientId = process.env.NOTION_CLIENT_ID
    const clientSecret = process.env.NOTION_CLIENT_SECRET
    // 使用当前请求的URL构建重定向URI
    const redirectUri = `${url.origin}/api/notion/callback`

    console.log("Token exchange params:", { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri })

    if (!clientId || !clientSecret) {
      console.error("Missing Notion credentials")
      // 重定向回应用并显示错误信息
      const errorMessage = encodeURIComponent('Notion应用配置不完整');
      return Response.redirect(`${url.origin}/settings?notionError=${errorMessage}`, 302)
    }

    const tokenRequestBody = {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }

    console.log("Token request body:", tokenRequestBody)

    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: JSON.stringify(tokenRequestBody),
    })

    console.log("Token response status:", tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange failed:", errorData)
      // 重定向回应用并显示错误信息
      const errorMessage = encodeURIComponent(`获取访问令牌失败: ${errorData.error || errorData.message || "未知错误"}`);
      return Response.redirect(`${url.origin}/settings?notionError=${errorMessage}`, 302)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, workspace_name, workspace_id, bot_id } = tokenData

    console.log("Token exchange successful:", { workspace_name, workspace_id, bot_id })

    // 创建Notion数据库
    const databaseResponse = await fetch("https://api.notion.com/v1/databases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          type: "workspace",
          workspace: true,
        },
        title: [
          {
            type: "text",
            text: {
              content: "wspace",
            },
          },
        ],
        properties: {
          标题: {
            title: {},
          },
          分类: {
            select: {
              options: [
                { name: "日常", color: "blue" },
                { name: "工作", color: "green" },
                { name: "学习", color: "purple" },
                { name: "其他", color: "gray" },
              ],
            },
          },
          标签: {
            multi_select: {
              options: [
                { name: "重要", color: "red" },
                { name: "待办", color: "yellow" },
                { name: "已完成", color: "green" },
                { name: "参考", color: "blue" },
              ],
            },
          },
          优先级: {
            select: {
              options: [
                { name: "高", color: "red" },
                { name: "中", color: "yellow" },
                { name: "低", color: "gray" },
              ],
            },
          },
          创建日期: {
            date: {},
          },
          类型: {
            select: {
              options: [
                { name: "笔记", color: "blue" },
                { name: "文档", color: "green" },
                { name: "月报", color: "purple" },
              ],
            },
          },
        },
      }),
    })

    let databaseId = null
    let databaseName = "智能笔记助手"

    if (databaseResponse.ok) {
      const databaseData = await databaseResponse.json()
      databaseId = databaseData.id
      databaseName = databaseData.title?.[0]?.text?.content || "智能笔记助手"
      console.log("Database created successfully:", databaseId)
    } else {
      const dbError = await databaseResponse.json()
      console.error("Database creation failed:", dbError)
    }

    const authData = {
      notionToken: access_token,
      databaseId,
      workspaceName: workspace_name,
      workspaceId: workspace_id,
      botId: bot_id,
      databaseName,
      authorizedAt: new Date().toISOString(),
    }

    // 返回成功页面，通过postMessage通知父窗口
    // 重定向回应用并传递授权成功信息
    const successParams = new URLSearchParams({
      notionAuthSuccess: 'true',
      state: state || '',
      access_token,
      workspace_name,
      workspace_id,
      database_id: databaseId || '',
      database_name: databaseName
    });
    
    return Response.redirect(`${url.origin}/settings?${successParams.toString()}`, 302)
  } catch (error) {
    console.error("Error in Notion callback:", error)

    // 重定向回应用并显示错误信息
    const errorMessage = encodeURIComponent('服务器错误，请重试');
    return Response.redirect(`${new URL(req.url).origin}/settings?notionError=${errorMessage}`, 302)
  }
}
