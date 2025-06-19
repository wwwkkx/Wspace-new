"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "@/components/language-provider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Send, Bot, User, RefreshCw, Sparkles, Info, Settings, MessageSquare, Globe, Search, NotepadText, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  searchResults?: SearchResult[]
}

interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

export default function ChatPage() {
  const t = useTranslation()
  const router = useRouter()
  const { data: session } = useSession()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 加载聊天会话
  const loadChatSessions = async () => {
    try {
      console.log('开始加载聊天会话...')
      const response = await fetch('/api/chat/sessions')
      console.log('加载会话响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('加载会话成功:', data)
        const formattedSessions = data.sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          lastMessage: session.messages.length > 0 
            ? session.messages[session.messages.length - 1].content.slice(0, 50) + '...'
            : '暂无消息',
          timestamp: session.updatedAt
        }))
        setChatSessions(formattedSessions)
      } else {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        console.error('加载聊天会话失败:', response.status, errorData)
      }
    } catch (error) {
      console.error('加载聊天会话失败:', error)
    }
  }

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt,
          searchResults: msg.searchResults
        }))
        setMessages(formattedMessages)
        setCurrentSessionId(sessionId)
      }
    } catch (error) {
      console.error('加载会话消息失败:', error)
    }
  }

  // 创建新会话
  const createNewSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' })
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentSessionId(data.session.id)
        setMessages([])
        await loadChatSessions() // 重新加载会话列表
      }
    } catch (error) {
      console.error('创建新会话失败:', error)
    }
  }

  // 页面加载时获取会话列表
  useEffect(() => {
    if (session?.user) {
      console.log('会话用户信息:', session.user)
      loadChatSessions()
    } else {
      console.log('未检测到用户会话')
    }
  }, [session])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 生成唯一ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11)
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 执行网络搜索
  const performWebSearch = async (query: string) => {
    if (!webSearchEnabled) return null;
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/ai/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Web search error:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return

    let sessionId = currentSessionId
    
    // 如果没有当前会话，创建新会话
    if (!sessionId) {
      try {
        console.log('尝试创建新会话...')
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: input.slice(0, 20) + (input.length > 20 ? '...' : '') })
        })
        console.log('创建会话响应状态:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('创建会话成功:', data)
          sessionId = data.session.id
          setCurrentSessionId(sessionId)
        } else {
          const errorData = await response.json().catch(() => ({ error: '未知错误' }))
          console.error('创建会话失败:', response.status, errorData)
          
          // 添加更详细的错误处理，特别是对401未授权错误
          if (response.status === 401) {
            alert('会话创建失败：您需要登录才能创建会话。请先登录或注册账号。')
            router.push('/auth')
          } else {
            alert(`创建会话失败: ${response.status} ${JSON.stringify(errorData)}`)
          }
          return
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        alert(`创建会话失败: ${error instanceof Error ? error.message : '未知错误'}`)
        return
      }
    }

    const userInput = input
    setInput("")
    setIsLoading(true)

    // 立即添加用户消息到消息列表，使用临时ID
    const tempUserMessageId = `temp-${Date.now()}`
    const userMessage: Message = {
      id: tempUserMessageId,
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString(),
    }
    
    // 立即更新UI显示用户消息
    setMessages((prev) => [...prev, userMessage])
    
    try {
      // 调用聊天API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          message: userInput,
          webSearchEnabled
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // 更新用户消息的ID（用服务器返回的ID替换临时ID）
        const updatedUserMessage: Message = {
          id: data.userMessage.id,
          role: "user",
          content: data.userMessage.content,
          timestamp: data.userMessage.createdAt,
        }
        
        const assistantMessage: Message = {
          id: data.assistantMessage.id,
          role: "assistant",
          content: data.assistantMessage.content,
          timestamp: data.assistantMessage.createdAt,
          searchResults: data.assistantMessage.searchResults,
        }
        
        // 更新消息列表，替换临时用户消息并添加助手回复
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.id !== tempUserMessageId)
          return [...filtered, updatedUserMessage, assistantMessage]
        })
        
        // 重新加载会话列表以更新最后消息
        await loadChatSessions()
      } else {
        console.error('发送消息失败')
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 模拟Ares AI响应
  const getAresResponse = (message: string, searchResults: SearchResult[] | null = null) => {
    // 如果有搜索结果,生成基于搜索结果的回复
    if (searchResults && searchResults.length > 0) {
      const randomResult = searchResults[Math.floor(Math.random() * searchResults.length)];
      return `根据我的搜索,我找到了一些相关信息:

"${randomResult.title}" 提到: ${randomResult.snippet}

基于这些信息,我认为这个问题的关键点是...[此处是AI分析内容]`;
    }
    
    // 没有搜索结果时的标准回复
    const responses = [
      "我是Ares,您的智能助手。我可以帮助您整理笔记、分析文档,并提供有用的见解。",
      "根据您的问题,我建议您可以尝试将信息分类整理,这样可以更清晰地理解内容之间的关联。",
      "我已经分析了您提供的信息,这看起来是一个很有价值的想法。您可以进一步发展它。",
      "这是一个有趣的问题。从数据分析的角度来看,我们可以从多个维度思考这个问题。",
      "我理解您的需求。作为您的智能助手Ares,我会尽力提供最相关的信息和建议。",
      "您的想法很有创意。我可以帮您进一步完善这个概念,使其更加实用和具体。",
      "这是一个复杂的问题,需要综合考虑多个因素。让我为您分析一下关键点。",
      "根据我的分析,您的项目有很大的潜力。我建议您关注以下几个关键领域...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 自动调整Textarea高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = "auto";
    
    // 计算新高度，但限制最大高度
    const singleLineHeight = 18; // 减小单行高度估计值
    const maxHeight = singleLineHeight * 10; // 增加最大行数，确保可以容纳六行
    
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // 当内容超过最大高度时启用滚动
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  // 开始新对话
  const startNewChat = async () => {
    await createNewSession()
  }

  // 开始重命名会话
  const startRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
    setIsRenameDialogOpen(true)
  }

  // 保存重命名
  const saveRename = async () => {
    if (!editingSessionId || !editingTitle.trim()) return
    
    try {
      const response = await fetch('/api/chat/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: editingSessionId, 
          newTitle: editingTitle.trim() 
        })
      })
      
      if (response.ok) {
        await loadChatSessions() // 重新加载会话列表
      }
    } catch (error) {
      console.error('重命名会话失败:', error)
    }
    
    setIsRenameDialogOpen(false)
    setEditingSessionId(null)
    setEditingTitle("")
  }

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        await loadChatSessions() // 重新加载会话列表
        
        // 如果删除的是当前会话，清空消息
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 移动端顶部栏 - 仅在移动端显示 */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-gray-200/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t.ares || "Ares 智能助手"}</h1>
          <Badge variant="outline" className="ml-1 rounded-full border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium">
            <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
            AI
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={startNewChat} title={t.newChat || "新对话"} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" title="信息" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 桌面端顶部导航 */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      <main className="flex flex-1 overflow-hidden">
        {/* 侧边栏 - 聊天历史 (仅桌面端显示) */}
        <div className="hidden md:flex w-64 flex-col border-r border-gray-200/30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl h-screen">
          <div className="p-4 flex-shrink-0">
            <Button onClick={startNewChat} className="w-full justify-start gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                <MessageSquare className="h-4 w-4" />
                {t.newChat || "新对话"}
              </Button>
          </div>
          
          {/* 聊天记录区域 - 可滚动 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-72px)] px-3">
              <div className="space-y-2 py-2">
                {chatSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="relative cursor-pointer rounded-2xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02] group"
                    onClick={() => loadSessionMessages(session.id)}
                  >
                    <CardContent className="p-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-gray-900 dark:text-white">{session.title}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => {
                                setEditingSessionId(session.id);
                                setEditingTitle(session.title);
                                setIsRenameDialogOpen(true);
                              }}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                重命名
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteSession(session.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 主聊天区域 */}
        <div className="flex flex-1 flex-col overflow-hidden h-screen">
          {/* 桌面端聊天头部 */}
          <div className="hidden md:flex border-b border-gray-200/30 p-4 items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.ares || "Ares 智能助手"}</h1>
              <Badge variant="outline" className="ml-2 rounded-full border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium">
                <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                AI
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe className={`h-4 w-4 ${webSearchEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                <Switch 
                  checked={webSearchEnabled} 
                  onCheckedChange={setWebSearchEnabled} 
                  aria-label={t.webSearchToggle || "联网开关"}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {webSearchEnabled ? t.enableWebSearch || "启用联网搜索" : t.disableWebSearch || "禁用联网搜索"}
                </span>
              </div>
              <Button variant="ghost" size="icon" title="信息" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* 移动端联网开关 - 仅在移动端显示 */}
          <div className="md:hidden flex items-center justify-center py-2 px-4 border-b border-gray-200/30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Globe className={`h-4 w-4 ${webSearchEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
              <Switch 
                checked={webSearchEnabled} 
                onCheckedChange={setWebSearchEnabled} 
                aria-label={t.webSearchToggle || "联网开关"}
                className="scale-90"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {webSearchEnabled ? t.enableWebSearch || "启用联网搜索" : t.disableWebSearch || "禁用联网搜索"}
              </span>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-130px)] md:h-[calc(100vh-180px)] p-4 md:p-6">
              <div className="space-y-4 max-w-3xl mx-auto">
              {/* 欢迎消息 */}
              {messages.length === 0 && (
                <div className="text-center py-4 md:py-8">
                  <Bot className="h-10 w-10 md:h-12 md:w-12 mx-auto text-blue-500 mb-3 md:mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{t.welcomeToAres || "欢迎使用 Ares 智能助手"}</h2>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4 md:mb-6 max-w-md mx-auto">
                    {t.aresDescription || "我是您的AI助手,可以帮助您整理笔记、分析文档、回答问题,并提供有用的见解。"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-lg mx-auto px-2 md:px-0">
                    <Button
                      variant="outline"
                      className="justify-start text-left text-sm md:text-base py-2 md:py-3 rounded-xl border-gray-200 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                      onClick={() => setInput("帮我分析一下这篇文章的主要观点")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t.analyzeArticle || "分析文章主要观点"}
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left text-sm md:text-base py-2 md:py-3 rounded-xl border-gray-200 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                      onClick={() => setInput("帮我总结一下这个会议的要点")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t.summarizeMeeting || "总结会议要点"}
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left text-sm md:text-base py-2 md:py-3 rounded-xl border-gray-200 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                      onClick={() => setInput("帮我生成一个学习计划")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t.createStudyPlan || "生成学习计划"}
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left text-sm md:text-base py-2 md:py-3 rounded-xl border-gray-200 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                      onClick={() => setInput("帮我整理这些笔记")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t.organizeNotes || "整理笔记"}
                    </Button>
                  </div>
                </div>
              )}

              {/* 消息列表 */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[85%] md:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* 在移动端隐藏头像,在桌面端显示 */}
                    <div className="hidden md:block flex-shrink-0">
                      {message.role === "user" ? (
                        <Avatar className="h-8 w-8 bg-blue-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8 bg-gray-700 flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </Avatar>
                      )}
                    </div>
                    <div
                      className={`${message.role === "user" ? "md:mr-2 rounded-2xl rounded-tr-sm" : "md:ml-2 rounded-2xl rounded-tl-sm"} px-3 md:px-4 py-2 ${message.role === "user" ? "bg-blue-500 text-white shadow-lg" : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 shadow-sm"}`}
                    >
                      <div className="whitespace-pre-wrap text-sm md:text-base">{message.content}</div>
                      
                      {/* 搜索结果显示 */}
                      {message.role === "assistant" && message.searchResults && message.searchResults.length > 0 && (
                        <div className="mt-3 border-t pt-2 border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                            <Search className="h-3 w-3" />
                            <span>{t.searchResult || "搜索结果"}</span>
                          </div>
                          <div className="space-y-2">
                            {message.searchResults.slice(0, 2).map((result, index) => (
                              <div key={index} className="text-xs bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/30 dark:border-gray-700/30">
                                <div className="font-medium text-blue-600 dark:text-blue-400 text-xs md:text-sm">{result.title}</div>
                                <div className="text-gray-600 dark:text-gray-300 mt-1 text-xs">{result.snippet}</div>
                                <a 
                                  href={result.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline mt-1 inline-block text-xs truncate max-w-full block transition-colors"
                                >
                                  {result.link}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`text-[10px] md:text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 搜索或加载指示器 */}
              {(isLoading || isSearching) && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] flex-row">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8 bg-gray-700 ring-2 ring-gray-200 dark:ring-gray-600 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </Avatar>
                    </div>
                    <div className="mx-2 px-4 py-2 rounded-2xl rounded-tl-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                        <span className="ml-2 text-gray-500 dark:text-gray-400 font-medium">
                          {isSearching ? t.searchingWeb || "正在搜索网络..." : t.thinking || "Ares正在思考..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 用于自动滚动的引用元素 */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

          {/* 输入区域 */}
          <div className="p-3 md:p-4 sticky bottom-0 bg-background backdrop-blur-xl">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputMessage || "输入消息..."}
                className="flex-1 min-h-[36px] md:min-h-[40px] max-h-[180px] md:max-h-[240px] resize-none text-sm md:text-base rounded-2xl border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:border-blue-300 focus:bg-white dark:focus:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent before:content-[''] before:block before:h-[0.5em] after:content-[''] after:block after:h-[0.5em]"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 border-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>
            <div className="text-[10px] md:text-xs text-center mt-2 text-gray-500 dark:text-gray-400 font-medium">
              {t.aresDisclaimer || "Ares 是一个AI助手,可能会产生错误。请检查重要信息。"}
            </div>
          </div>
          
          {/* 移动端底部导航栏 */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/30 flex justify-around items-center shadow-lg z-20">
            <button className="flex flex-col items-center text-pink-400 transition-colors" onClick={() => router.push('/dashboard')}>
              <NotepadText className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{t.notes || "笔记"}</span>
            </button>
            <button className="flex flex-col items-center text-blue-500 transition-colors">
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{t.chat || "聊天"}</span>
            </button>
            <button 
              className="flex flex-col items-center text-gray-400 transition-colors" 
              onClick={() => router.push('/settings')}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{t.me || "我的"}</span>
            </button>
          </div>
        </div>
      </main>
      
      {/* 重命名对话框 */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>重命名会话</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                标题
              </label>
              <Input
                id="title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveRename()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false)
                setEditingSessionId(null)
                setEditingTitle("")
              }}
            >
              取消
            </Button>
            <Button onClick={saveRename}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}