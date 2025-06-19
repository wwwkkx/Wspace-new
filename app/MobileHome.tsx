'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, useTranslation } from '@/components/language-provider';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Menu, Send, Plus } from 'lucide-react';
import MobileSidebar from '@/components/mobile/sidebar';

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// 会话类型定义
interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 移动端首页组件 - Ares聊天机器人界面
 * 此组件专门用于移动设备的UI布局
 * 与桌面版UI完全分离，不会影响桌面版设计
 */
const MobileHome: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation();
  const { theme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 加载聊天会话
  const loadChatSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        const formattedSessions = data.sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          messages: session.messages || [],
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }))
        setSessions(formattedSessions)
        
        // 如果没有当前会话且有可用会话，自动选择第一个会话
        if (!currentSessionId && formattedSessions.length > 0) {
          const firstSession = formattedSessions[0]
          setCurrentSessionId(firstSession.id)
          // 如果会话有消息，隐藏欢迎页面
          if (firstSession.messages && firstSession.messages.length > 0) {
            setShowWelcome(false)
          }
          // 加载第一个会话的消息
          await loadSessionMessages(firstSession.id)
        }
      }
    } catch (error) {
      console.error('加载聊天会话失败:', error)
    }
  }

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      // 立即设置当前会话ID，确保UI能立即响应
      setCurrentSessionId(sessionId)
      
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
        }))
        
        // 更新会话的消息列表
        setSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: formattedMessages
            }
          }
          return session
        }))
      }
    } catch (error) {
      console.error('加载会话消息失败:', error)
    }
  }
  
  // 选择会话的处理函数
  const handleSessionSelect = async (sessionId: string) => {
    await loadSessionMessages(sessionId)
    // 检查选中的会话是否有消息，决定是否显示欢迎页面
    const selectedSession = sessions.find(s => s.id === sessionId)
    if (selectedSession && selectedSession.messages.length > 0) {
      setShowWelcome(false)
    } else {
      setShowWelcome(true)
    }
    setShowSidebar(false) // 在消息加载完成后再关闭侧边栏
  }
  
  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId);
  
  // 调试信息
  console.log('当前会话ID:', currentSessionId)
  console.log('所有会话:', sessions)
  console.log('当前会话:', currentSession)
  console.log('当前会话消息数量:', currentSession?.messages?.length || 0)
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);
  
  // 页面加载时获取会话列表
  useEffect(() => {
    loadChatSessions()
  }, []);
  
  // 创建新会话
  const createNewSession = async () => {
    // 检查会话数量限制
    if (sessions.length >= 66) {
      alert('已达到最大会话数量限制（66条），请删除一些历史会话后再创建新会话。');
      return;
    }
    
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t.newChat || '新对话' })
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentSessionId(data.session.id)
        setShowWelcome(true) // 新会话显示欢迎页面
        setSessions(prev => [{
          id: data.session.id,
          title: data.session.title,
          messages: [],
          createdAt: new Date(data.session.createdAt),
          updatedAt: new Date(data.session.updatedAt)
        }, ...prev])
      }
    } catch (error) {
      console.error('创建新会话失败:', error)
    }
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    let sessionId = currentSessionId;
    let isNewSession = false;
    
    // 隐藏提示UI和欢迎页面，开始过渡到对话界面
    setShowPrompts(false);
    setSelectedAction(null);
    setShowWelcome(false);
    
    // 如果没有当前会话，创建新会话
    if (!sessionId) {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: input.slice(0, 20) + (input.length > 20 ? '...' : '') })
        })
        if (response.ok) {
          const data = await response.json()
          sessionId = data.session.id
          setCurrentSessionId(sessionId)
          isNewSession = true
          
          // 立即添加新会话到sessions状态
          setSessions(prev => [{
            id: data.session.id,
            title: data.session.title,
            messages: [],
            createdAt: new Date(data.session.createdAt),
            updatedAt: new Date(data.session.updatedAt)
          }, ...prev])
        } else {
          console.error('创建会话失败')
          return
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        return
      }
    }

    const userInput = input
    setInput('')
    
    // 立即显示用户消息
    const tempUserId = 'temp-user-' + Date.now()
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: [...session.messages, {
            id: tempUserId,
            content: userInput,
            role: 'user' as const,
            timestamp: new Date()
          }],
          updatedAt: new Date()
        }
      }
      return session
    }))
    
    setIsLoading(true)

    try {
      // 调用聊天API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          message: userInput
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('API响应数据:', data)
        
        // 更新本地会话数据，替换临时用户消息并添加AI回复
        setSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            const updatedMessages = session.messages.map(msg => 
              msg.id === tempUserId ? {
                id: data.userMessage.id,
                content: data.userMessage.content,
                role: 'user' as const,
                timestamp: data.userMessage.createdAt ? new Date(data.userMessage.createdAt) : new Date()
              } : msg
            )
            
            return {
              ...session,
              messages: [...updatedMessages, {
                id: data.assistantMessage.id,
                content: data.assistantMessage.content,
                role: 'assistant' as const,
                timestamp: data.assistantMessage.createdAt ? new Date(data.assistantMessage.createdAt) : new Date()
              }],
              updatedAt: new Date()
            }
          }
          return session
        }))
        
        // 如果不是新会话，重新加载会话列表以更新最后消息
        if (!isNewSession) {
          await loadChatSessions()
        }
      } else {
        const errorData = await response.text()
        console.error('发送消息失败:', response.status, errorData)
        
        // 添加错误消息到聊天框
        setSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, {
                id: 'error-' + Date.now(),
                content: `发送消息失败: ${response.status} ${errorData}`,
                role: 'assistant' as const,
                timestamp: new Date()
              }],
              updatedAt: new Date()
            }
          }
          return session
        }))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      
      // 添加网络错误消息到聊天框
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, {
              id: 'error-' + Date.now(),
              content: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
              role: 'assistant' as const,
              timestamp: new Date()
            }],
            updatedAt: new Date()
          }
        }
        return session
      }))
    } finally {
      setIsLoading(false)
    }
  };
  
  const quickActions = [
    { 
      icon: '📅', 
      text: t.relaxTime || '给我摸鱼', 
      color: 'bg-blue-500/20 text-blue-600',
      prompts: [
        t.relaxPrompt1 || '推荐一些有趣的网站让我放松一下',
        t.relaxPrompt2 || '给我讲个轻松的笑话',
        t.relaxPrompt3 || '推荐一些短视频或娱乐内容',
        t.relaxPrompt4 || '有什么简单的小游戏可以玩？'
      ]
    },
    { 
      icon: '💡', 
      text: t.makePlan || '制定计划', 
      color: 'bg-yellow-500/20 text-yellow-600',
      prompts: [
        t.planPrompt1 || '帮我制定一个学习计划',
        t.planPrompt2 || '如何安排我的工作时间？',
        t.planPrompt3 || '给我一个健康的作息时间表',
        t.planPrompt4 || '帮我规划这个月的目标'
      ]
    },
    { 
      icon: '📝', 
      text: t.summarizeText || '总结文本', 
      color: 'bg-orange-500/20 text-orange-600',
      prompts: [
        t.summaryPrompt1 || '帮我总结这段文字的要点',
        t.summaryPrompt2 || '请提取文章的核心观点',
        t.summaryPrompt3 || '用简洁的语言概括内容',
        t.summaryPrompt4 || '分析这段文本的主要信息'
      ]
    },
    { 
      icon: '🤖', 
      text: t.aiAssistant || 'AI助手', 
      color: 'bg-purple-500/20 text-purple-600',
      prompts: [
        t.aiPrompt1 || '你能帮我做什么？',
        t.aiPrompt2 || '介绍一下你的功能',
        t.aiPrompt3 || '我该如何更好地使用你？',
        t.aiPrompt4 || '你有什么特别的技能吗？'
      ]
    }
  ];

  // 处理快捷操作点击
  const handleQuickActionClick = (action: typeof quickActions[0]) => {
    setSelectedAction(action.text);
    setShowPrompts(true);
  };

  // 处理提示句子点击
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
    setSelectedAction(null);
    // 自动发送消息
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  // 关闭提示
  const closePrompts = () => {
    setShowPrompts(false);
    setSelectedAction(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      {/* 侧边栏 */}
      <MobileSidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={() => {
          createNewSession();
          setShowSidebar(false);
        }}
        onSessionsUpdate={loadChatSessions}
      />
      
      {/* 头部 - 固定在顶部 */}
      <div className={`fixed top-0 left-0 right-0 px-3 py-2 border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
        showSidebar ? 'z-40 opacity-50' : 'z-50 opacity-100'
      }`}>
        <div className="flex items-center justify-between h-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSidebar(true)}
            className="hover:bg-accent rounded-xl h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-base font-semibold tracking-tight">Ares</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={createNewSession}
            className="hover:bg-accent rounded-xl h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 主要内容区域 - 添加顶部和底部边距 */}
      <div className="flex-1 flex flex-col pt-16 pb-20">
        {(currentSession && currentSession.messages.length > 0) || !showWelcome ? (
          /* 对话界面 */
          <div className="animate-in fade-in-0 duration-500">
            <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {currentSession?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-blue-500/90 text-white ml-12'
                      : 'bg-gray-100/80 text-gray-900 mr-12'
                  } shadow-sm flex flex-col justify-center`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    <div className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp ? message.timestamp.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 加载指示器 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gray-100/80 text-gray-900 mr-12 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">{t.thinking || 'Ares正在思考...'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            </ScrollArea>
            
            {/* 如果没有消息但已经开始对话，显示空状态 */}
            {(!currentSession || currentSession.messages.length === 0) && !showWelcome && (
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg mb-2">💬</div>
                  <p className="text-sm">{t.startConversation || '开始对话吧！'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 欢迎界面 */
          <div className="flex-1 flex flex-col justify-center items-center px-6 animate-in fade-in-0 duration-500">
            <div className="text-center mb-16 -mt-8">
              <h1 className="text-2xl font-light mb-10 tracking-wide">
                {t.howCanIHelp || '有什么可以帮忙的？'}
              </h1>
              
              {/* 快捷操作按钮 */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent/30 transition-all duration-300 hover:scale-105 active:scale-95 border-0 shadow-lg hover:shadow-xl rounded-3xl bg-card/50 backdrop-blur-sm"
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <CardHeader className="pb-3 pt-5 text-center px-4">
                      <div className="text-3xl mb-3">{action.icon}</div>
                      <CardTitle className="text-sm font-medium tracking-tight leading-relaxed">{action.text}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部输入区域 - 缩小高度 */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t">
          {/* 提示句子显示区域 */}
          {showPrompts && selectedAction && (
            <div className="p-4">
              <Card className="border-0 shadow-xl rounded-3xl bg-card/80 backdrop-blur-md">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-sm font-medium tracking-tight">{selectedAction} - {t.selectQuestion || '选择一个问题'}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closePrompts}
                      className="h-8 w-8 p-0 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.find(action => action.text === selectedAction)?.prompts.map((prompt, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:bg-accent/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-0 shadow-sm rounded-2xl bg-muted/30"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        <CardHeader className="pb-3 pt-3 px-4">
                          <CardDescription className="text-sm text-left leading-relaxed">
                            {prompt}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
          
          {/* 输入框区域 */}
          <div className="px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder={t.inputMessage || '输入消息...'}
                  className="rounded-full border-0 bg-gray-100/80 focus:bg-gray-100 transition-colors h-9 px-4"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-full w-9 h-9 bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-sm"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default MobileHome;