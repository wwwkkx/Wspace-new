"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText,
  PlusCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Briefcase,
  Coffee,
  BarChart3,
  Settings,
  Upload,
  Search,
  Filter,
  Star,
} from "lucide-react"
import { Header } from "@/components/header"
import { NoteEditor } from "@/components/note-editor"
import { DocumentUpload } from "@/components/document-upload"
import { NotionSetup } from "@/components/notion-setup"
import { DocumentView } from "@/components/document-view"
import { NoteView } from "@/components/note-view"
import { useLanguage, useTranslation } from "@/components/language-provider"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  email: string
  notionConnected?: boolean
}

interface Note {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  priority: string
  createdAt: string
}

interface Document {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  documentType: string
  fileName: string
  createdAt: string
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 使用全局语言上下文
  const { language } = useLanguage()
  const t = useTranslation()
  const { toast } = useToast()
  
  // 在获取翻译后更新默认分类
  useEffect(() => {
    setSelectedCategory(t.all || "全部")
  }, [t])
  
  // 使用 useCallback 来稳定 loadUserData 函数
  // 加载用户数据（笔记和文档）
  const loadUserData = useCallback(async (userId: string) => {
    console.log("开始加载用户数据，用户ID:", userId)
    try {
      // 加载笔记
      const notesResponse = await fetch(`/api/notes`)
      if (notesResponse.ok) {
        const notesData = await notesResponse.json()
        console.log("成功加载笔记数据:", notesData.notes?.length || 0, "条笔记")
        setNotes(notesData.notes || [])
      } else {
        console.error("加载笔记失败:", notesResponse.status, notesResponse.statusText)
      }

      // 加载文档
      const docsResponse = await fetch(`/api/documents`)
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        console.log("成功加载文档数据:", docsData.documents?.length || 0, "个文档")
        setDocuments(docsData.documents || [])
      } else {
        console.error("加载文档失败:", docsResponse.status, docsResponse.statusText)
      }

      // 检查Notion授权状态
      const notionResponse = await fetch(`/api/notion/auth`)
      if (notionResponse.ok) {
        const notionData = await notionResponse.json()
        console.log("Notion授权状态:", notionData.authorized ? "已授权" : "未授权", notionData)
      } else {
        console.error("检查Notion授权状态失败:", notionResponse.status, notionResponse.statusText)
      }
    } catch (error) {
      console.error("加载用户数据出错:", error)
    }
  }, [])

  // 初始化用户和检查登录状态
  useEffect(() => {
    // 移除isInitialized检查，确保每次session变化时都重新加载用户数据
    try {
      // 使用 NextAuth 会话状态
      if (session?.user) {
        setUser({
          id: session.user.id as string,
          name: session.user.name || '',
          email: session.user.email || '',
        })
        loadUserData(session.user.id as string)
      } else {
        // 确保未登录状态下user为null
        setUser(null)
      }
    } catch (error) {
      console.error("Error initializing user:", error)
      setUser(null)
    } finally {
      setIsInitialized(true)
    }
  }, [loadUserData, session]) // 只依赖session和loadUserData

  // 处理移动端检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 处理 Notion 授权回调 - 只在组件挂载时检查一次
  useEffect(() => {
    if (!isInitialized) return

    const notionAuth = searchParams.get("notionAuth")

    if (notionAuth === "success") {
      console.log("检测到Notion授权成功参数，准备刷新用户数据")
      toast({
        description: t.notionAuthSuccess || "Notion授权成功！您的笔记和文档将自动同步到Notion。",
        duration: 5000,
      })
      // 清除URL参数
      window.history.replaceState({}, "", "/dashboard")
      
      // 强制刷新用户数据，确保授权状态更新
      if (session?.user?.id) {
        console.log("开始强制刷新用户数据，用户ID:", session.user.id)
        // 添加延迟确保数据库已更新
        setTimeout(() => {
          loadUserData(session.user.id as string)
        }, 1000)
      }
    } else if (notionAuth === "failed") {
      const error = searchParams.get("error") || t.unknownError || "未知错误"
      toast({
        variant: "destructive",
        description: `${t.notionAuthFailed || "Notion授权失败"}: ${error}`,
        duration: 5000,
      })
      // 清除URL参数
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [isInitialized, searchParams, t, toast, session, loadUserData])

  const generateMonthlyReport = async () => {
    if (!user) return

    // 创建日历选择对话框
    const dialog = document.createElement('dialog');
    dialog.className = 'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4';
    
    // 获取当前年份和月份
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // 创建日历UI
    dialog.innerHTML = `
      <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl p-6 w-full max-w-md shadow-xl border border-white/20 dark:border-gray-700/30">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">${t.selectMonth || '选择月份'} <span class="text-blue-600 dark:text-blue-400">${currentYear}</span></h2>
          <button id="close-dialog" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-600 dark:text-gray-300"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${t.selectMonthDesc || '选择要生成月报的月份，系统将分析该月的笔记和文档'}</p>
        <div id="calendar" class="grid grid-cols-3 gap-3 mb-6">
          ${Array.from({ length: 12 }, (_, i) => {
            const monthDate = new Date(currentYear, i, 1);
            const monthName = monthDate.toLocaleDateString('zh-CN', { month: 'long' });
            const isPast = i <= currentMonth;
            return `
              <button 
                data-month="${i + 1}" 
                data-year="${currentYear}" 
                class="month-btn p-3 rounded-2xl ${isPast ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-gray-800 dark:text-gray-200' : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400'}"
                ${!isPast ? 'disabled' : ''}
              >
                ${monthName}
              </button>
            `;
          }).join('')}
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-4">
          <div class="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            <p class="text-sm text-blue-700 dark:text-blue-300">${t.aiAnalysisDesc || 'AI将分析所选月份的所有笔记和文档，生成月度报告'}</p>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">只要本月有笔记和文档，即可随时生成月报</p>
        <button id="generate-btn" class="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-medium transition-all duration-300 shadow-md hover:shadow-lg">
          ${t.generateReport || '生成月报'}
        </button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    // 关闭对话框
    const closeDialog = () => {
      dialog.close();
      document.body.removeChild(dialog);
    };
    
    document.getElementById('close-dialog')?.addEventListener('click', closeDialog);
    
    // 月份选择
    let selectedMonth = 0;
    let selectedYear = 0;
    
    document.querySelectorAll('.month-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 移除之前的选中状态
        document.querySelectorAll('.month-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-blue-600', 'dark:ring-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
        });
        
        // 添加选中状态
        const target = e.currentTarget as HTMLButtonElement;
        target.classList.add('ring-2', 'ring-blue-600', 'dark:ring-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
        
        selectedMonth = parseInt(target.dataset.month || '0');
        selectedYear = parseInt(target.dataset.year || '0');
      });
    });
    
    // 生成报告
    document.getElementById('generate-btn')?.addEventListener('click', async () => {
      if (!selectedMonth || !selectedYear) {
        // 显示提示信息
        toast({
          title: t.error || "错误",
          description: t.selectMonthFirst || "请先选择月份",
          variant: "destructive",
        });
        return;
      }
      
      closeDialog();
      setIsGeneratingReport(true);
      
      try {
          const response = await fetch('/api/monthly-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user?.id,
              month: selectedMonth,
              year: selectedYear,
            }),
          });

        if (!response.ok) {
          throw new Error('Failed to generate report');
        }

        const data = await response.json();
        toast({
          title: t.success || "成功",
          description: t.reportGenerationDesc || "月度报告已生成并保存到您的账户",
        });
        
      } catch (error) {
        console.error('Error generating report:', error);
        toast({
          title: t.error || "错误",
          description: t.reportGenerationErrorDesc || "生成报告时出现问题，请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingReport(false);
      }
    });
  }

  const handleNoteCreated = useCallback(() => {
    if (user) {
      loadUserData(user.id)
    }
  }, [user, loadUserData])

  const handleDocumentUploaded = useCallback(() => {
    if (user) {
      loadUserData(user.id)
    }
  }, [user, loadUserData])

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocument(documentId)
  }

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId)
  }

  const handleBackFromDocument = async () => {
    setSelectedDocument(null)
    // 重新加载文档数据，确保删除后的文档不会显示在列表中
    if (user) {
      try {
        const docsResponse = await fetch(`/api/documents`)
        if (docsResponse.ok) {
          const docsData = await docsResponse.json()
          setDocuments(docsData.documents || [])
        }
      } catch (error) {
        console.error("Error reloading documents:", error)
      }
    }
  }

  const handleBackFromNote = async () => {
    setSelectedNote(null)
    // 重新加载笔记数据，确保删除后的笔记不会显示在列表中
    if (user) {
      try {
        const notesResponse = await fetch(`/api/notes`)
        if (notesResponse.ok) {
          const notesData = await notesResponse.json()
          setNotes(notesData.notes || [])
        }
      } catch (error) {
        console.error("Error reloading notes:", error)
      }
    }
  }

  // 过滤和搜索功能
  const filteredNotes = notes
    .filter((note) => (selectedCategory === "全部" ? true : note.category === selectedCategory))
    .filter((note) =>
      searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true,
    )

  const filteredDocuments = documents
    .filter((doc) => (selectedCategory === "全部" ? true : doc.category === selectedCategory))
    .filter((doc) =>
      searchQuery
        ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    )

  const categoryStats = {
    日常: notes.filter((n) => n.category === "日常").length + documents.filter((d) => d.category === "日常").length,
    工作: notes.filter((n) => n.category === "工作").length + documents.filter((d) => d.category === "工作").length,
    学习: notes.filter((n) => n.category === "学习").length + documents.filter((d) => d.category === "学习").length,
    其他: notes.filter((n) => n.category === "其他").length + documents.filter((d) => d.category === "其他").length,
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading || "加载中..."}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {user ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.welcomeBack || "欢迎回来"}{user.name ? `，${user.name}` : ''}！</h1>
              <p className="text-gray-600">{t.manageNotesAndDocs || "管理您的笔记和文档，让AI帮您整理思路"}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.pleaseLogin || "请登录"}！</h1>
              <p className="text-gray-600">{t.loginToManage || "登录后可管理您的笔记和文档"}</p>
              <Button className="mt-4" onClick={() => window.location.href = "/auth"}>
                {t.login || "登录"}
              </Button>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? "grid-cols-3" : "grid-cols-4"} rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg p-2 items-center h-14`}>
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium flex items-center justify-center h-10">{t.overview || "概览"}</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium flex items-center justify-center h-10">{t.notes || "笔记"}</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium flex items-center justify-center h-10">{t.documents || "文档"}</TabsTrigger>
            {!isMobile && <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium flex items-center justify-center h-10">{t.monthlyReport || "月报"}</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.totalNotes || "总笔记"}</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{notes.length}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.totalDocuments || "总文档"}</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{documents.length}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-green-100 flex items-center justify-center shadow-md">
                      <Upload className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.newThisMonth || "本月新增"}</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {
                          [...notes, ...documents].filter((item) => {
                            const itemDate = new Date(item.createdAt)
                            const now = new Date()
                            return (
                              itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
                            )
                          }).length
                        }
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-100 flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.notion_status || "Notion状态"}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user ? (user.notionConnected ? (t.connected || "已连接") : (t.notConnected || "未连接")) : (t.notConnected || "未连接")}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-md">
                      <Settings className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 分类统计 */}
            <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-gray-800 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  {t.categoryStats || "分类统计"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 md:p-6 bg-orange-50 dark:bg-gray-800 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm">
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-md">
                      <Coffee className="w-6 h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-200">{t.daily || "日常"}</div>
                    <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{categoryStats.日常}</div>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-blue-50 dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm">
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-md">
                      <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-200">{t.work || "工作"}</div>
                    <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{categoryStats.工作}</div>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-green-50 dark:bg-gray-800 rounded-2xl border border-green-100 dark:border-gray-700 shadow-sm">
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-md">
                      <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-200">{t.study || "学习"}</div>
                    <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{categoryStats.学习}</div>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-purple-50 dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 shadow-sm">
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-200">{t.other || "其他"}</div>
                    <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{categoryStats.其他}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg text-gray-800 dark:text-gray-100">{t.createNote || "创建笔记"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button onClick={() => setActiveTab("notes")} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t.newNote || "新建笔记"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg text-gray-800 dark:text-gray-100">{t.uploadDocument || "上传文档"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button onClick={() => setActiveTab("documents")} className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.uploadDoc || "上传文档"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {isMobile && (
              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    {t.monthlyReport || "月度报告"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button onClick={generateMonthlyReport} disabled={isGeneratingReport} className="w-full rounded-2xl bg-green-600 hover:bg-green-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-gray-400">
                    {isGeneratingReport ? (t.generating || "生成中...") : (t.generateMonthlyReport || "生成本月报告")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            {selectedNote ? (
              <NoteView noteId={selectedNote} onBack={handleBackFromNote} />
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold">{t.myNotes || "我的笔记"}</h2>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 搜索框 */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t.searchNotes || "搜索笔记..."}
                        className="pl-10 rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* 分类过滤 - 移动端下拉菜单 */}
                    {isMobile ? (
                      <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                          className="w-full h-10 pl-10 pr-4 rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="全部">{t.allCategories || "全部分类"}</option>
                          <option value="日常">{t.daily || "日常"}</option>
                          <option value="工作">{t.work || "工作"}</option>
                          <option value="学习">{t.study || "学习"}</option>
                          <option value="其他">{t.other || "其他"}</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {["全部", "日常", "工作", "学习", "其他"].map((category) => (
                          <Button
                            key={category}
                            className={selectedCategory === category ? 
                              "rounded-2xl border-0 bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300 font-medium" :
                              "rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 font-medium"
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category === "全部" ? (t.all || "全部") :
                             category === "日常" ? (t.daily || "日常") :
                             category === "工作" ? (t.work || "工作") :
                             category === "学习" ? (t.study || "学习") :
                             (t.other || "其他")}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {user ? (
                  <NoteEditor userId={user.id} onNoteCreated={handleNoteCreated} />
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">{t.loginToCreateNotes || "请登录以创建笔记"}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                      <Card
                        key={note.id}
                        className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full"
                        onClick={() => handleNoteClick(note.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg line-clamp-1 text-gray-800 dark:text-gray-100">{note.title}</h3>
                            <Badge className="rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 font-medium">{note.category}</Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{note.summary}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {note.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} className="text-xs rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 font-medium px-3 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                            <Badge
                              className={
                                note.priority === "高"
                                  ? "rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0 font-medium"
                                  : note.priority === "中"
                                    ? "rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-0 font-medium"
                                    : "rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0 font-medium"
                              }
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {note.priority === "高" ? (t.highPriority || "高") :
                               note.priority === "中" ? (t.mediumPriority || "中") :
                               (t.lowPriority || "低")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">
                      {searchQuery ? (t.noMatchingNotes || "没有找到匹配的笔记") : (t.noNotesYet || "还没有笔记，开始创建吧！")}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {selectedDocument ? (
              <DocumentView documentId={selectedDocument} onBack={handleBackFromDocument} />
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold">{t.myDocuments || "我的文档"}</h2>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 搜索框 */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t.searchDocuments || "搜索文档..."}
                        className="pl-10 rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* 分类过滤 - 移动端下拉菜单 */}
                    {isMobile ? (
                      <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                          className="w-full h-10 pl-10 pr-4 rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="全部">{t.allCategories || "全部分类"}</option>
                          <option value="日常">{t.daily || "日常"}</option>
                          <option value="工作">{t.work || "工作"}</option>
                          <option value="学习">{t.study || "学习"}</option>
                          <option value="其他">{t.other || "其他"}</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {["全部", "日常", "工作", "学习", "其他"].map((category) => (
                          <Button
                            key={category}
                            className={selectedCategory === category ? 
                              "rounded-2xl border-0 bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300 font-medium" :
                              "rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 font-medium"
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category === "全部" ? (t.all || "全部") :
                             category === "日常" ? (t.daily || "日常") :
                             category === "工作" ? (t.work || "工作") :
                             category === "学习" ? (t.study || "学习") :
                             (t.other || "其他")}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {user ? (
                  <DocumentUpload userId={user.id} onDocumentUploaded={handleDocumentUploaded} />
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">{t.loginToUploadDocuments || "请登录以上传文档"}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <Card
                        key={doc.id}
                        className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full"
                        onClick={() => handleDocumentClick(doc.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg line-clamp-1 text-gray-800 dark:text-gray-100">{doc.title}</h3>
                            <Badge className="rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 font-medium">{doc.category}</Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">{doc.fileName}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{doc.summary}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {doc.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} className="text-xs rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 font-medium px-3 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{new Date(doc.createdAt).toLocaleDateString()}</span>
                            <Badge className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 font-medium">{doc.documentType}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">
                      {searchQuery ? (t.noMatchingDocuments || "没有找到匹配的文档") : (t.noDocumentsYet || "还没有文档，开始上传吧！")}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.monthlyReport || "月度报告"}</h2>
              {user ? (
                <Button 
                  onClick={generateMonthlyReport} 
                  disabled={isGeneratingReport} 
                  size="lg"
                  className="rounded-2xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? (t.generating || "生成中...") : (t.generateMonthlyReport || "生成本月报告")}
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.href = "/auth"} 
                  size="lg"
                  className="rounded-2xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                >
                  {t.loginToGenerateReport || "登录以生成报告"}
                </Button>
              )}
            </div>

            <Card className="rounded-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-100">{t.monthlyReportFeatures || "月报功能说明"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-0 shadow-md">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">📊 {t.dataStatistics || "数据统计"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t.dataStatisticsDesc || "自动统计本月的笔记和文档数量，分析各分类的分布情况"}</p>
                </div>
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-0 shadow-md">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">💡 {t.intelligentInsights || "智能洞察"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t.intelligentInsightsDesc || "AI分析您的内容，提供深度洞察和改进建议"}</p>
                </div>
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-0 shadow-md">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">🎯 {t.actionPlan || "行动计划"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t.actionPlanDesc || "基于本月数据，为下月制定具体的行动计划"}</p>
                </div>
                <div className="p-5 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border-0 shadow-md">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">📝 {t.autoSync || "自动同步"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t.autoSyncDesc || "生成的月报会自动同步到您的Notion数据库"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
    </>
  )
}

