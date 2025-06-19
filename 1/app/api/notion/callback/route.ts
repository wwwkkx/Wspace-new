import { prisma } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const userId = url.searchParams.get("state"); // 使用state参数作为userId

    console.log("Notion callback received:", { code: !!code, state, error });

    // 如果有错误，返回错误页面
    if (error) {
      console.error("Notion OAuth error:", error);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>授权失败</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'NOTION_AUTH_ERROR',
              error: '${error}'
            }, '${url.origin}');
            window.close();
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // 如果没有授权码，返回错误
    if (!code) {
      console.error("No authorization code received");
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>授权失败</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'NOTION_AUTH_ERROR',
              error: '未获取到授权码'
            }, '${url.origin}');
            window.close();
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // 获取Notion访问令牌
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;
    // 确保与授权时使用的完全一致
    const redirectUri = "https://v0-wechat-chatbot.vercel.app/api/notion/callback";

    console.log("Token exchange params:", { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri });

    if (!clientId || !clientSecret) {
      console.error("Missing Notion credentials");
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>配置错误</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'NOTION_AUTH_ERROR',
              error: 'Notion应用配置不完整'
            }, '${url.origin}');
            window.close();
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const tokenRequestBody = {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };

    console.log("Token request body:", tokenRequestBody);

    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: JSON.stringify(tokenRequestBody),
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>授权失败</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'NOTION_AUTH_ERROR',
              error: '获取访问令牌失败: ${errorData.error || errorData.message || "未知错误"}'
            }, '${url.origin}');
            window.close();
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, workspace_name, workspace_id, bot_id } = tokenData;

    console.log("Token exchange successful:", { workspace_name, workspace_id, bot_id });

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
    });

    let databaseId = null;
    let databaseName = "智能笔记助手";

    if (databaseResponse.ok) {
      const databaseData = await databaseResponse.json();
      databaseId = databaseData.id;
      databaseName = databaseData.title?.[0]?.text?.content || "智能笔记助手";
      console.log("Database created successfully:", databaseId);
    } else {
      const dbError = await databaseResponse.json();
      console.error("Database creation failed:", dbError);
    }

    const authData = {
      notionToken: access_token,
      databaseId,
      workspaceName: workspace_name,
      workspaceId: workspace_id,
      botId: bot_id,
      databaseName,
      authorizedAt: new Date().toISOString(),
    };

    // 将Notion授权信息保存到数据库
    if (userId) {
      try {
        // 使用Prisma更新用户的Notion授权信息
        await prisma.user.update({
          where: { id: userId },
          data: {
            notionToken: access_token,
            notionDatabaseId: databaseId,
            notionWorkspaceName: workspace_name,
            notionWorkspaceId: workspace_id,
            notionBotId: bot_id,
            notionDatabaseName: databaseName,
            notionAuthorizedAt: new Date(),
          },
        });
        console.log(`Updated Notion auth for user ${userId}`);
      } catch (dbError) {
        console.error("Failed to save Notion auth to database:", dbError);
      }
    }

    // 返回成功页面，通过postMessage通知父窗口
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>授权成功</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          }
          .card {
            background: rgba(255,255,255,0.95);
            border-radius: 2rem;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            padding: 3rem 2.5rem 2.5rem 2.5rem;
            max-width: 350px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .icon {
            background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%);
            border-radius: 50%;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 8px 0 rgba(129,140,248,0.15);
          }
          .icon svg {
            width: 40px;
            height: 40px;
            color: #fff;
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #373737;
            margin: 0 0 1rem 0;
            letter-spacing: 0.02em;
          }
          p {
            color: #6b7280;
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }
          .btn {
            background: linear-gradient(90deg, #818cf8 0%, #a5b4fc 100%);
            color: #fff;
            border: none;
            border-radius: 1.5rem;
            padding: 0.75rem 2.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 8px 0 rgba(129,140,248,0.10);
            transition: background 0.2s;
          }
          .btn:hover {
            background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1>授权成功</h1>
          <p>Notion 已成功授权，正在返回应用...</p>
          <button class="btn" onclick="window.close()">关闭窗口</button>
        </div>
        <script>
          window.opener?.postMessage({
            type: 'NOTION_AUTH_SUCCESS',
            data: ${JSON.stringify(authData)}
          }, '${url.origin}');
          setTimeout(() => { window.close(); }, 2000);
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("Error in Notion callback:", error);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>授权失败</title>
        <meta charset="utf-8">
      </head>
      <body>
        <script>
          window.opener?.postMessage({
            type: 'NOTION_AUTH_ERROR',
            error: '服务器错误，请重试'
          }, '${new URL(req.url).origin}');
          window.close();
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}