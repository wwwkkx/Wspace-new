"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "@/components/language-provider"
import { Switch } from "@/components/ui/switch"
import { useDeviceDetect } from "@/hooks/use-device-detect"
// 引入桌面端和移动端组件
import DesktopHome from "./DesktopHome"
import MobileHome from "./MobileHome"
import { 
  Loader2, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Sparkles, 
  Info, 
  Settings, 
  MessageSquare, 
  Globe, 
  Search, 
  NotepadText,
  Menu,
  X,
  FileText,
  Upload,
  Plus
} from "lucide-react"

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

export default function HomePage() {
  const t = useTranslation()
  const router = useRouter()
  
  // 将所有Hooks移到组件顶部，确保它们在每次渲染时都以相同的顺序被调用
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "关于工作计划的讨论",
      lastMessage: "我们下周需要完成项目规划...",
      timestamp: "2023-06-15T10:30:00Z",
    },
    {
      id: "2",
      title: "学习资料整理",
      lastMessage: "这些是我推荐的学习资源...",
      timestamp: "2023-06-14T15:45:00Z",
    },
    {
      id: "3",
      title: "周末活动安排",
      lastMessage: "我们可以去郊外野餐...",
      timestamp: "2023-06-13T09:20:00Z",
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      return data.results || [];
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // 执行网络搜索（如果启用）
      let searchResults: SearchResult[] = []
      if (webSearchEnabled) {
        searchResults = await performWebSearch(userInput) || []
      }

      // 模拟AI响应
      setTimeout(() => {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: getAresResponse(userInput, searchResults),
          timestamp: new Date().toISOString(),
          searchResults: searchResults
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error in sendMessage:', error)
      setIsLoading(false)
      
      // 在出错时添加一条错误消息
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "抱歉，我在处理您的请求时遇到了问题。请再试一次。",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // 获取Ares响应
  const getAresResponse = (userInput: string, searchResults?: SearchResult[]) => {
    try {
      if (searchResults && searchResults.length > 0) {
        return `基于搜索结果，我为您找到了相关信息。${userInput}的相关内容如下所示。如果您需要更详细的信息，请告诉我具体想了解哪个方面。`
      }
      
      const responses = [
        "我理解您的问题。让我为您详细解答一下。",
        "这是一个很好的问题。根据我的理解...",
        "我来帮您分析一下这个问题。",
        "基于您提供的信息，我建议...",
        "让我为您提供一些相关的见解和建议。"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    } catch (error) {
      console.error('Error in getAresResponse:', error)
      return "抱歉，我在处理您的请求时遇到了问题。请再试一次。"
    }
  }

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 开始新对话
  const startNewChat = () => {
    setMessages([])
    setSidebarOpen(false)
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // 根据设备类型条件渲染不同的UI组件
  const { isMobile, isClient } = useDeviceDetect()
  
  // 在客户端渲染完成前显示加载状态
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  }
  
  if (isMobile) {
    return <MobileHome />
  }
  
  return <DesktopHome />
}
