"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Database, AlertCircle, Loader2, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/components/language-provider"

interface NotionSetupProps {
  userId: string
}

export function NotionSetup({ userId }: NotionSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const t = useTranslation()

  useEffect(() => {
    checkAuthStatus()
  }, [userId])

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true)

      // 首先检查 localStorage
      const localAuth = localStorage.getItem(`notion_auth_${userId}`)
      if (localAuth) {
        try {
          const authData = JSON.parse(localAuth)
          setAuthStatus({ authorized: true, ...authData })
          setIsCheckingAuth(false)
          return
        } catch (e) {
          console.error("Error parsing local auth data:", e)
          // 如果解析失败，继续检查服务器
        }
      }

      // 然后检查服务器
      const response = await fetch(`/api/notion/auth?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.authorized) {
          // 保存到 localStorage
          localStorage.setItem(`notion_auth_${userId}`, JSON.stringify(data))
          setAuthStatus(data)
        } else {
          setAuthStatus({ authorized: false })
        }
      } else {
        // 如果服务器请求失败，设置为未授权状态
        setAuthStatus({ authorized: false })
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setAuthStatus({ authorized: false })
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const { toast } = useToast()
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: t.clipboardCopy || "已复制到剪贴板",
      duration: 2000,
    })
  }

  const handleNotionAuth = () => {
    setIsLoading(true)

    // 生成随机状态值以防止CSRF攻击
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem("notionAuthState", state)
    localStorage.setItem("notionAuthUserId", userId)

    // 构建授权URL - 不对 redirect_uri 进行编码
    const redirectUri = "https://v0-wechat-chatbot.vercel.app/api/notion/callback"
    const clientId = "20fd872b-594c-80c8-8a2a-0037508ad3b7"

    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&owner=user`

    console.log("Notion auth URL:", notionAuthUrl)
    console.log("Redirect URI:", redirectUri)

    // 打开授权窗口
    const authWindow = window.open(notionAuthUrl, "notionAuth", "width=600,height=700,scrollbars=yes,resizable=yes")

    // 监听授权窗口关闭
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed)
        setIsLoading(false)
        // 检查授权状态
        setTimeout(() => {
          checkAuthStatus()
        }, 1000)
      }
    }, 1000)

    // 监听来自授权窗口的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "NOTION_AUTH_SUCCESS") {
        clearInterval(checkClosed)
        authWindow?.close()
        setIsLoading(false)
    
        // 保存授权数据到服务器和本地
        const authData = event.data.data
        console.log("收到Notion授权成功消息，准备保存授权数据:", authData)
        fetch("/api/notion/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...authData }),
        }).then(response => {
          if (response.ok) {
            console.log("授权数据已成功保存到服务器")
            // 保存到 localStorage
            localStorage.setItem(`notion_auth_${userId}`, JSON.stringify({ authorized: true, ...authData }))
            setAuthStatus({ authorized: true, ...authData })
            
            // 添加一个延迟，确保数据已保存
            setTimeout(() => {
              // 强制刷新页面以确保状态更新
              window.location.href = '/dashboard?notionAuth=success'
            }, 1000)
          } else {
            console.error("Failed to save auth data to server")
            toast({
              variant: "destructive",
              description: t.notionAuthFailed || "Notion授权失败: 无法保存授权数据",
              duration: 5000,
            })
          }
        }).catch(error => {
          console.error("Error saving auth data:", error)
          toast({
            variant: "destructive",
            description: `${t.notionAuthFailed || "Notion授权失败"}: ${error.message || t.unknownError || "未知错误"}`,
            duration: 5000,
          })
        })
    
        window.removeEventListener("message", handleMessage)
        toast({
          description: t.notionAuthSuccess || "Notion授权成功！您的笔记和文档将自动同步到Notion。",
          duration: 5000,
        })
      } else if (event.data.type === "NOTION_AUTH_ERROR") {
        clearInterval(checkClosed)
        authWindow?.close()
        setIsLoading(false)
        window.removeEventListener("message", handleMessage)
        toast({
          variant: "destructive",
          description: `${t.notionAuthFailed || "Notion授权失败"}: ${event.data.error || t.unknownError || "未知错误"}`,
          duration: 5000,
        })
      }
    }

    window.addEventListener("message", handleMessage)

    // 10分钟后自动清理
    setTimeout(() => {
      clearInterval(checkClosed)
      window.removeEventListener("message", handleMessage)
      if (authWindow && !authWindow.closed) {
        authWindow.close()
      }
      setIsLoading(false)
    }, 600000)
  }

  // 断开Notion连接
  const handleDisconnect = async () => {
    if (!userId) return

    setIsLoading(true)
    console.log("开始断开Notion连接")

    try {
      // 删除服务器上的授权信息
      const response = await fetch(`/api/notion/auth`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("成功从服务器删除Notion授权信息")
        // 删除本地存储的授权信息
        localStorage.removeItem(`notion_auth_${userId}`)
        setAuthStatus({ authorized: false })
        toast({
          description: t.notionDisconnected || "已断开与Notion的连接",
          duration: 3000,
        })
      } else {
        const errorData = await response.json()
        console.error("断开Notion连接失败:", errorData)
        toast({
          variant: "destructive",
          description: t.notionDisconnectFailed || "断开Notion连接失败",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("断开Notion连接出错:", error)
      toast({
        variant: "destructive",
        description: t.notionDisconnectFailed || "断开Notion连接失败",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">{t.checkingAuthStatus || "检查授权状态..."}</p>
        </CardContent>
      </Card>
    )
  }

  if (authStatus?.authorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            {t.notionConnected || "Notion 已连接"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-100/80 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-300 mb-2">✅ {t.notionConnectedSuccess || "您的Notion已成功连接！"}</p>
            <p className="text-sm text-green-700 dark:text-green-400">{t.notionSyncDescription || "笔记和文档会自动同步到您的Notion数据库。"}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">{t.workspace || "工作区"}: </span>
              <span>{authStatus.workspaceName || (t.connected || "已连接")}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{t.database || "数据库"}: </span>
              <span>{authStatus.databaseName || (t.smartNoteAssistant || "智能笔记助手")}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                {t.disconnect || "断开连接"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAuthStatus(null)}>
                {t.reauthorize || "重新授权"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          {t.notionDatabaseSetup || "Notion 数据库设置"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 配置说明 */}
        <div className="p-4 bg-red-100/80 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <div className="font-medium mb-2">⚠️ {t.redirectUriError || "如果遇到 \"redirect_uri 缺失或无效\" 错误"}</div>
              <div className="mb-2">{t.configureOAuthSettings || "请先在 Notion 开发者页面正确配置 OAuth 设置："}</div>
              <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)} className="mb-2">
                {showConfig ? (t.hide || "隐藏") : (t.show || "显示")}{t.configSteps || "配置步骤"}
              </Button>
            </div>
          </div>
        </div>

        {/* 详细配置步骤 */}
        {showConfig && (
          <div className="p-4 bg-blue-100/80 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <h3 className="font-medium mb-3">📋 {t.notionDevConfigSteps || "Notion 开发者页面配置步骤："}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">1. {t.visitNotionDevPage || "访问 Notion 开发者页面："}</div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">https://www.notion.so/my-integrations</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("https://www.notion.so/my-integrations")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">2. {t.findIntegrationAndEdit || "找到您的集成，点击 \"编辑\""}</div>
              </div>

              <div>
                <div className="font-medium mb-1">3. {t.setOAuthDomainAndURIs || "在 \"OAuth Domain and URIs\" 部分设置："}</div>
                <div className="ml-4 space-y-2">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">OAuth Domain:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">v0-wechat-chatbot.vercel.app</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("v0-wechat-chatbot.vercel.app")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Redirect URIs:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        https://v0-wechat-chatbot.vercel.app/api/notion/callback
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("https://v0-wechat-chatbot.vercel.app/api/notion/callback")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">4. {t.clickSaveChanges || "点击 \"Save changes\" 保存设置"}</div>
              </div>

              <div>
                <div className="font-medium mb-1">5. {t.waitAndRetry || "等待几分钟让配置生效，然后重试授权"}</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-100/80 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <div className="font-medium mb-1">{t.oneClickConnectNotion || "一键连接Notion"}</div>
              <div>{t.clickButtonToAuth || "点击下方按钮，在弹出窗口中授权，我们将自动创建并配置您的Notion数据库。"}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100/80 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-medium mb-2">🔐 {t.benefitsAfterAuth || "授权后您将获得："}</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• {t.autoCreateDatabase || "自动创建专属的笔记数据库"}</li>
            <li>• {t.realTimeSync || "笔记和文档实时同步"}</li>
            <li>• {t.smartCategorization || "智能分类和标签管理"}</li>
            <li>• {t.monthlyReportGeneration || "月度报告自动生成"}</li>
          </ul>
        </div>

        <Button onClick={handleNotionAuth} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.authorizing || "授权中..."}
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              {t.oneClickAuthNotion || "一键授权Notion"}
            </>
          )}
        </Button>

        {isLoading && (
          <div className="p-3 bg-yellow-100/80 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">📱 {t.completeAuthInPopup || "请在弹出的窗口中完成Notion授权，授权完成后窗口会自动关闭。"}</p>
          </div>
        )}

        {/* 调试信息 */}
        <details className="text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer">{t.debugInfo || "调试信息"}</summary>
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div>Client ID: 20fd872b-594c-80c8-8a2a-0037508ad3b7</div>
            <div>Redirect URI: https://v0-wechat-chatbot.vercel.app/api/notion/callback</div>
            <div>Current Domain: {window.location.hostname}</div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
