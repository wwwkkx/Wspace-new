'use client'

import * as React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'

// 支持的语言类型
export type LanguageType = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'

// 翻译文本类型定义
export type TranslationKeys = {
  settings: string
  appearance: string
  account: string
  notifications: string
  language: string
  privacy: string
  home: string
  dashboard: string
  chat: string
  login: string
  register: string
  ares: string
  newChat: string
  sendMessage: string
  inputMessage: string
  thinking: string
  welcomeToAres: string
  aresDescription: string
  analyzeArticle: string
  summarizeMeeting: string
  createStudyPlan: string
  organizeNotes: string
  aresDisclaimer: string
  webSearch: string
  enableWebSearch: string
  disableWebSearch: string
  searchingWeb: string
  searchResult: string
  webSearchToggle: string
  loading: string
  welcomeBack: string
  manageNotesAndDocs: string
  email: string
  password: string
  enterEmail: string
  enterPassword: string
  loggingIn: string
  name: string
  enterName: string
  enterPasswordMin6: string
  registering: string
  orRegisterWith: string
  wechat: string
  instagram: string
  google: string
  smartNoteAssistant: string
  aiDrivenPlatform: string
  getStarted: string
  learnMore: string
  coreFeatures: string
  overview: string
  reports: string
  aiAsAssistant: string
  smartNotes: string
  smartNotesDesc: string
  documentAnalysis: string
  documentAnalysisDesc: string
  gentleAINote: string
  helloWelcome: string
  aiHelpsYou: string
  startNewNote: string
  uploadDocument: string
  syncToNotion: string
  recentNotes: string
  recentNotesPlaceholder: string
  recentDocuments: string
  recentDocumentsPlaceholder: string
  notes: string
  documents: string
  preparingPage: string
  all: string
  notionAuthSuccess: string
  notionAuthFailed: string
  unknownError: string
  monthlyReportSuccess: string
  monthlyReportFailed: string
  success: string
  error: string
  generating: string
  reportGenerationDesc: string
  reportGenerationErrorDesc: string
  pleaseLogin: string
  notesManagement: string
  documentManagement: string
  monthlyReport: string
  notionConnection: string
  connectToNotion: string
  disconnectFromNotion: string
  notionConnected: string
  notionNotConnected: string
  notionConnectionDesc: string
  notionDisconnectionDesc: string
  authorizing: string
  oneClickAuthNotion: string
  completeAuthInPopup: string
  debugInfo: string
  confirmDisconnectNotion: string
  justNow: string
  hoursAgo: string
  daysAgo: string
  weeksAgo: string
  quickSettings: string
  theme: string
  chinese: string
  searchHistory: string
  features: string
  chatHistory: string
  noChatsYet: string
  notLoggedIn: string
  aresResponse: string
  simulatedReply: string
  relaxTime: string
  relaxPrompt1: string
  relaxPrompt2: string
  relaxPrompt3: string
  relaxPrompt4: string
  makePlan: string
  planPrompt1: string
  planPrompt2: string
  planPrompt3: string
  planPrompt4: string
  summarizeText: string
  summaryPrompt1: string
  summaryPrompt2: string
  summaryPrompt3: string
  summaryPrompt4: string
  aiAssistant: string
  aiPrompt1: string
  aiPrompt2: string
  aiPrompt3: string
  aiPrompt4: string
  howCanIHelp: string
  selectQuestion: string
  [key: string]: string
}

// 语言上下文类型
type LanguageContextType = {
  language: LanguageType
  setLanguage: (language: LanguageType) => void
  translations: Record<string, TranslationKeys>
}

// 多语言文本配置
const translations: Record<string, TranslationKeys> = {
  "zh-CN": {
    settings: "设置",
    appearance: "外观",
    account: "账户",
    notifications: "通知",
    language: "语言",
    privacy: "隐私与安全",
    home: "首页",
    dashboard: "仪表板",
    chat: "聊天处理",
    login: "登录",
    register: "注册",
    ares: "Wspace",
    newChat: "新对话",
    sendMessage: "发送消息",
    inputMessage: "输入消息...",
    thinking: "Ares正在思考...",
    welcomeToAres: "欢迎使用 Wspace",
    aresDescription: "我是您的AI助手,可以帮助您整理笔记、分析文档、回答问题,并提供有用的见解。",
    analyzeArticle: "分析文章主要观点",
    summarizeMeeting: "总结会议要点",
    createStudyPlan: "生成学习计划",
    organizeNotes: "整理笔记",
    aresDisclaimer: "Ares 是一个AI助手,可能会产生错误。请检查重要信息。",
    webSearch: "联网搜索",
    enableWebSearch: "启用联网搜索",
    disableWebSearch: "禁用联网搜索",
    searchingWeb: "正在搜索网络...",
    searchResult: "搜索结果",
    webSearchToggle: "联网开关",
    loading: "加载中...",
    welcomeBack: "欢迎回来",
    manageNotesAndDocs: "管理您的笔记和文档，让AI帮您整理思路",
    email: "邮箱",
    password: "密码",
    enterEmail: "请输入邮箱",
    enterPassword: "请输入密码",
    loggingIn: "登录中...",
    name: "姓名",
    enterName: "请输入姓名",
    enterPasswordMin6: "请输入密码（至少6位）",
    registering: "注册中...",
    orRegisterWith: "或使用以下方式注册",
    wechat: "微信",
    instagram: "Instagram",
    google: "Google",
    smartNoteAssistant: "Wspace",
    aiDrivenPlatform: "AI驱动的笔记和文档管理平台，自动分析、分类、总结您的内容，并同步到Notion",
    getStarted: "开始使用",
    learnMore: "了解更多",
    coreFeatures: "核心功能",
    overview: "概览",
    reports: "月报",
    aiAsAssistant: "让AI成为您的智能助手",
    smartNotes: "智能笔记",
    smartNotesDesc: "随手记录想法，AI自动生成标题、摘要、分类和标签",
    documentAnalysis: "文档分析",
    documentAnalysisDesc: "上传文档，AI自动提取要点、总结内容并智能分类",
    gentleAINote: "温柔陪伴你的AI笔记",
    helloWelcome: "你好，欢迎来到 wspace",
    aiHelpsYou: "AI帮你记录、整理、同步每一个灵感与文档",
    startNewNote: "开始新笔记",
    uploadDocument: "上传文档",
    syncToNotion: "同步到Notion",
    recentNotes: "最近笔记",
    recentNotesPlaceholder: "（这里展示最近的笔记列表...）",
    recentDocuments: "最近文档",
    recentDocumentsPlaceholder: "（这里展示最近上传的文档...）",
    notes: "笔记",
    documents: "文档",
    preparingPage: "请稍候，正在为您准备页面",
    all: "全部",
    notionAuthSuccess: "Notion授权成功！您的笔记和文档将自动同步到Notion。",
    notionAuthFailed: "Notion授权失败",
    unknownError: "未知错误",
    monthlyReportSuccess: "月报生成成功！已自动同步到Notion",
    monthlyReportFailed: "月报生成失败，请重试",
    success: "成功",
    error: "错误",
    generating: "生成中...",
    reportGenerationDesc: "月度报告已生成并保存到您的账户",
    reportGenerationErrorDesc: "生成报告时出现问题，请稍后再试",
    pleaseLogin: "请登录",
    loginToManage: "登录后可管理您的笔记和文档",
    totalNotes: "总笔记",
    totalDocuments: "总文档",
    newThisMonth: "本月新增",
    notion_status: "Notion状态",
    notConnected: "未连接",
    categoryStats: "分类统计",
    daily: "日常",
    work: "工作",
    study: "学习",
    other: "其他",
    createNote: "创建笔记",
    newNote: "新建笔记",
// 删除重复的 uploadDocument 属性，因为在前面已经定义过了
    uploadDoc: "上传文档",
    monthlyReport: "月度报告",
    generateMonthlyReport: "生成本月报告",
    myNotes: "我的笔记",
    searchNotes: "搜索笔记...",
    allCategories: "全部分类",
    loginToCreateNotes: "请登录以创建笔记",
    highPriority: "高",
    mediumPriority: "中",
    lowPriority: "低",
    noMatchingNotes: "没有找到匹配的笔记",
    noNotesYet: "还没有笔记，开始创建吧！",
    myDocuments: "我的文档",
    searchDocuments: "搜索文档...",
    loginToUploadDocuments: "请登录以上传文档",
    noMatchingDocuments: "没有找到匹配的文档",
    noDocumentsYet: "还没有文档，开始上传吧！",
    loginToGenerateReport: "登录以生成报告",
    notesManagement: "笔记管理",
    documentManagement: "文档管理",
    notionConnection: "Notion连接",
    connectToNotion: "连接到Notion",
    disconnectFromNotion: "断开Notion连接",
    notionNotConnected: "Notion未连接",
    notionConnectionDesc: "连接Notion以同步您的笔记和文档",
    notionDisconnectionDesc: "断开连接将停止数据同步",
    monthlyReportFeatures: "月报功能说明",
    dataStatistics: "数据统计",
    dataStatisticsDesc: "自动统计本月的笔记和文档数量，分析各分类的分布情况",
    intelligentInsights: "智能洞察",
    intelligentInsightsDesc: "AI分析您的内容，提供深度洞察和改进建议",
    actionPlan: "行动计划",
    actionPlanDesc: "基于本月数据，为下月制定具体的行动计划",
    autoSync: "自动同步",
    autoSyncDesc: "生成的月报会自动同步到您的Notion数据库",
    back: "返回",
    clipboardCopy: "已复制到剪贴板",
    checkingAuthStatus: "检查授权状态...",
    notionConnected: "Notion 已连接",
    notionConnectedSuccess: "您的Notion已成功连接！",
    notionSyncDescription: "笔记和文档会自动同步到您的Notion数据库。",
    workspace: "工作区",
    database: "数据库",
    connected: "已连接",
    disconnect: "断开连接",
    reauthorize: "重新授权",
    notionDatabaseSetup: "Notion 数据库设置",
    redirectUriError: "如果遇到 \"redirect_uri 缺失或无效\" 错误",
    configureOAuthSettings: "请先在 Notion 开发者页面正确配置 OAuth 设置：",
    hide: "隐藏",
    show: "显示",
    configSteps: "配置步骤",
    notionDevConfigSteps: "Notion 开发者页面配置步骤：",
    visitNotionDevPage: "访问 Notion 开发者页面：",
    findIntegrationAndEdit: "找到您的集成，点击 \"编辑\"",
    setOAuthDomainAndURIs: "在 \"OAuth Domain and URIs\" 部分设置：",
    clickSaveChanges: "点击 \"Save changes\" 保存设置",
    waitAndRetry: "等待几分钟让配置生效，然后重试授权",
    oneClickConnectNotion: "一键连接Notion",
    clickButtonToAuth: "点击下方按钮，在弹出窗口中授权，我们将自动创建并配置您的Notion数据库。",
    benefitsAfterAuth: "授权后您将获得：",
    autoCreateDatabase: "自动创建专属的笔记数据库",
    realTimeSync: "笔记和文档实时同步",
    smartCategorization: "智能分类和标签管理",
    monthlyReportGeneration: "月度报告自动生成",
    authorizing: "授权中...",
    oneClickAuthNotion: "一键授权Notion",
    completeAuthInPopup: "请在弹出的窗口中完成Notion授权，授权完成后窗口会自动关闭。",
    debugInfo: "调试信息",
    confirmDisconnectNotion: "确定要断开Notion连接吗？",
    // 侧边栏相关翻译
    justNow: "刚刚",
    hoursAgo: "小时前",
    daysAgo: "天前",
    weeksAgo: "周前",
    quickSettings: "快速设置",
    theme: "主题",
    chinese: "中文",
    searchHistory: "搜索历史聊天...",
    features: "功能",
    chatHistory: "历史对话",
    noChatsYet: "暂无历史对话",
    notLoggedIn: "未登录",
    // 聊天界面相关翻译
    aresResponse: "我是Ares，我收到了您的消息",
    simulatedReply: "这是一个模拟回复，后续会接入真实的AI模型。",
    relaxTime: "给我摸鱼",
    relaxPrompt1: "推荐一些有趣的网站让我放松一下",
    relaxPrompt2: "给我讲个轻松的笑话",
    relaxPrompt3: "推荐一些短视频或娱乐内容",
    relaxPrompt4: "有什么简单的小游戏可以玩？",
    makePlan: "制定计划",
    planPrompt1: "帮我制定一个学习计划",
    planPrompt2: "如何安排我的工作时间？",
    planPrompt3: "给我一个健康的作息时间表",
    planPrompt4: "帮我规划这个月的目标",
    summarizeText: "总结文本",
    summaryPrompt1: "帮我总结这段文字的要点",
    summaryPrompt2: "请提取文章的核心观点",
    summaryPrompt3: "用简洁的语言概括内容",
    summaryPrompt4: "分析这段文本的主要信息",
    aiAssistant: "AI助手",
    aiPrompt1: "你能帮我做什么？",
    aiPrompt2: "介绍一下你的功能",
    aiPrompt3: "我该如何更好地使用你？",
    aiPrompt4: "你有什么特别的技能吗？",
    howCanIHelp: "有什么可以帮忙的？",
    selectQuestion: "选择一个问题",
    // 其他翻译...
  },
  "en-US": {
    settings: "Settings",
    appearance: "Appearance",
    account: "Account",
    notifications: "Notifications",
    language: "Language",
    privacy: "Privacy & Security",
    home: "Home",
    dashboard: "Dashboard",
    chat: "Chat Processing",
    login: "Login",
    register: "Register",
    ares: "Ares AI Assistant",
    newChat: "New Chat",
    sendMessage: "Send Message",
    inputMessage: "Type a message...",
    thinking: "Ares is thinking...",
    welcomeToAres: "Welcome to Ares AI Assistant",
    aresDescription: "I'm your AI assistant that can help organize notes, analyze documents, answer questions, and provide useful insights.",
    analyzeArticle: "Analyze article main points",
    summarizeMeeting: "Summarize meeting points",
    createStudyPlan: "Create study plan",
    organizeNotes: "Organize notes",
    aresDisclaimer: "Ares is an AI assistant and may produce errors. Please verify important information.",
    webSearch: "Web Search",
    enableWebSearch: "Enable Web Search",
    disableWebSearch: "Disable Web Search",
    searchingWeb: "Searching the web...",
    searchResult: "Search Result",
    webSearchToggle: "Web Search Toggle",
    loading: "Loading...",
    welcomeBack: "Welcome back",
    manageNotesAndDocs: "Manage your notes and documents, let AI organize your thoughts",
    email: "Email",
    password: "Password",
    enterEmail: "Please enter your email",
    enterPassword: "Please enter your password",
    loggingIn: "Logging in...",
    name: "Name",
    enterName: "Please enter your name",
    enterPasswordMin6: "Please enter password (min 6 characters)",
    registering: "Registering...",
    orRegisterWith: "Or register with",
    wechat: "WeChat",
    instagram: "Instagram",
    google: "Google",
    smartNoteAssistant: "Wspace",
    aiDrivenPlatform: "AI-driven note and document management platform that automatically analyzes, categorizes, summarizes your content, and syncs to Notion",
    getStarted: "Get Started",
    learnMore: "Learn More",
    coreFeatures: "Core Features",
    overview: "Overview",
    reports: "Reports",
    aiAsAssistant: "Let AI be your intelligent assistant",
    smartNotes: "Smart Notes",
    smartNotesDesc: "Jot down ideas, AI automatically generates titles, summaries, categories, and tags",
    documentAnalysis: "Document Analysis",
    documentAnalysisDesc: "Upload documents, AI automatically extracts key points, summarizes content, and intelligently categorizes",
    gentleAINote: "AI Note Companion",
    helloWelcome: "Hello, welcome to wspace",
    aiHelpsYou: "AI helps you record, organize, and sync every inspiration and document",
    startNewNote: "Start New Note",
    uploadDocument: "Upload Document",
    syncToNotion: "Sync to Notion",
    recentNotes: "Recent Notes",
    recentNotesPlaceholder: "(Recent notes will be displayed here...)",
    recentDocuments: "Recent Documents",
    recentDocumentsPlaceholder: "(Recently uploaded documents will be displayed here...)",
    notes: "Notes",
    documents: "Documents",
    preparingPage: "Please wait, preparing your page",
    all: "All",
    notionAuthSuccess: "Notion authorization successful! Your notes and documents will automatically sync to Notion.",
    notionAuthFailed: "Notion authorization failed",
    unknownError: "Unknown error",
    monthlyReportSuccess: "Monthly report generated successfully! Automatically synced to Notion",
    monthlyReportFailed: "Failed to generate monthly report, please try again",
    success: "Success",
    error: "Error",
    generating: "Generating...",
    reportGenerationDesc: "Monthly report has been generated and saved to your account",
    reportGenerationErrorDesc: "An error occurred while generating the report, please try again later",
    pleaseLogin: "Please Login",
    loginToManage: "Login to manage your notes and documents",
    totalNotes: "Total Notes",
    totalDocuments: "Total Documents",
    newThisMonth: "New This Month",
    notion_status: "Notion Status",
    notConnected: "Not Connected",
    categoryStats: "Category Statistics",
    daily: "Daily",
    work: "Work",
    study: "Study",
    other: "Other",
    createNote: "Create Note",
    newNote: "New Note",
// 删除重复的 uploadDocument 属性，因为在前面已经定义过了
    uploadDoc: "Upload Doc",
    monthlyReport: "Monthly Report",
    generateMonthlyReport: "Generate Monthly Report",
    myNotes: "My Notes",
    searchNotes: "Search notes...",
    allCategories: "All Categories",
    loginToCreateNotes: "Please login to create notes",
    highPriority: "High",
    mediumPriority: "Medium",
    lowPriority: "Low",
    noMatchingNotes: "No matching notes found",
    noNotesYet: "No notes yet, start creating!",
    myDocuments: "My Documents",
    searchDocuments: "Search documents...",
    loginToUploadDocuments: "Please login to upload documents",
    noMatchingDocuments: "No matching documents found",
    noDocumentsYet: "No documents yet, start uploading!",
    loginToGenerateReport: "Login to generate report",
    notesManagement: "Notes Management",
    documentManagement: "Document Management",
    notionConnection: "Notion Connection",
    connectToNotion: "Connect to Notion",
    disconnectFromNotion: "Disconnect from Notion",
    notionNotConnected: "Notion Not Connected",
    notionConnectionDesc: "Connect Notion to sync your notes and documents",
    notionDisconnectionDesc: "Disconnecting will stop data synchronization",
    monthlyReportFeatures: "Monthly Report Features",
    dataStatistics: "Data Statistics",
    dataStatisticsDesc: "Automatically count notes and documents for this month, analyze category distribution",
    intelligentInsights: "Intelligent Insights",
    intelligentInsightsDesc: "AI analyzes your content to provide deep insights and improvement suggestions",
    actionPlan: "Action Plan",
    actionPlanDesc: "Based on this month's data, create specific action plans for next month",
    autoSync: "Auto Sync",
    autoSyncDesc: "Generated monthly reports will automatically sync to your Notion database",
    back: "Back",
    clipboardCopy: "Copied to clipboard",
    checkingAuthStatus: "Checking authorization status...",
    notionConnected: "Notion Connected",
    notionConnectedSuccess: "Your Notion has been successfully connected!",
    notionSyncDescription: "Notes and documents will automatically sync to your Notion database.",
    workspace: "Workspace",
    database: "Database",
    connected: "Connected",
    disconnect: "Disconnect",
    reauthorize: "Reauthorize",
    notionDatabaseSetup: "Notion Database Setup",
    redirectUriError: "If you encounter a \"redirect_uri missing or invalid\" error",
    configureOAuthSettings: "Please configure OAuth settings in your Notion developer page first:",
    hide: "Hide",
    show: "Show",
    configSteps: "configuration steps",
    notionDevConfigSteps: "Notion Developer Page Configuration Steps:",
    visitNotionDevPage: "Visit Notion developer page:",
    findIntegrationAndEdit: "Find your integration and click \"Edit\"",
    setOAuthDomainAndURIs: "In the \"OAuth Domain and URIs\" section, set:",
    clickSaveChanges: "Click \"Save changes\" to save settings",
    waitAndRetry: "Wait a few minutes for the configuration to take effect, then try authorizing again",
    oneClickConnectNotion: "One-Click Notion Connection",
    clickButtonToAuth: "Click the button below to authorize in the popup window. We will automatically create and configure your Notion database.",
    benefitsAfterAuth: "After authorization, you will get:",
    autoCreateDatabase: "Automatic creation of dedicated note database",
    realTimeSync: "Real-time synchronization of notes and documents",
    smartCategorization: "Smart categorization and tag management",
    monthlyReportGeneration: "Automatic monthly report generation",
    authorizing: "Authorizing...",
    oneClickAuthNotion: "One-Click Notion Authorization",
    completeAuthInPopup: "Please complete Notion authorization in the popup window. The window will close automatically when authorization is complete.",
    debugInfo: "Debug Information",
    confirmDisconnectNotion: "Are you sure you want to disconnect from Notion?",
    // Sidebar related translations
    justNow: "Just now",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    weeksAgo: "weeks ago",
    quickSettings: "Quick Settings",
    theme: "Theme",
    chinese: "Chinese",
    searchHistory: "Search chat history...",
    features: "Features",
    chatHistory: "Chat History",
    noChatsYet: "No chats yet",
    notLoggedIn: "Not logged in",
    // Chat interface related translations
    aresResponse: "I'm Ares, I received your message",
    simulatedReply: "This is a simulated reply, real AI model will be integrated later.",
    relaxTime: "Take a break",
    relaxPrompt1: "Recommend some interesting websites for relaxation",
    relaxPrompt2: "Tell me a light-hearted joke",
    relaxPrompt3: "Recommend some short videos or entertainment content",
    relaxPrompt4: "Any simple games I can play?",
    makePlan: "Make a plan",
    planPrompt1: "Help me create a study plan",
    planPrompt2: "How should I arrange my work schedule?",
    planPrompt3: "Give me a healthy daily routine",
    planPrompt4: "Help me plan this month's goals",
    summarizeText: "Summarize text",
    summaryPrompt1: "Help me summarize the key points of this text",
    summaryPrompt2: "Extract the core viewpoints of the article",
    summaryPrompt3: "Summarize the content concisely",
    summaryPrompt4: "Analyze the main information in this text",
    aiAssistant: "AI Assistant",
    aiPrompt1: "What can you help me with?",
    aiPrompt2: "Introduce your features",
    aiPrompt3: "How can I use you better?",
    aiPrompt4: "Do you have any special skills?",
    howCanIHelp: "How can I help you?",
    selectQuestion: "Select a question",
    // 其他翻译...
  },
  "ja-JP": {
    settings: "設定",
    appearance: "外観",
    account: "アカウント", 
    notifications: "通知",
    language: "言語",
    privacy: "プライバシーとセキュリティ",
    home: "ホーム",
    dashboard: "ダッシュボード",
    chat: "チャット処理",
    login: "ログイン",
    register: "登録",
    ares: "Ares AIアシスタント",
    newChat: "新しい会話",
    sendMessage: "メッセージを送信",
    inputMessage: "メッセージを入力...",
    thinking: "Aresは考え中...",
    welcomeToAres: "Ares AIアシスタントへようこそ",
    aresDescription: "私はあなたのAIアシスタントで、ノートの整理、文書の分析、質問への回答、有用な洞察の提供をお手伝いします。",
    analyzeArticle: "記事の要点を分析",
    summarizeMeeting: "会議のポイントをまとめる",
    createStudyPlan: "学習計画を作成",
    organizeNotes: "ノートを整理",
    aresDisclaimer: "AresはAIアシスタントであり、エラーが発生する可能性があります。重要な情報は確認してください。",
    webSearch: "ウェブ検索",
    enableWebSearch: "ウェブ検索を有効にする",
    disableWebSearch: "ウェブ検索を無効にする",
    searchingWeb: "ウェブを検索中...",
    searchResult: "検索結果",
    webSearchToggle: "ウェブ検索切り替え",
    loading: "読み込み中...",
    welcomeBack: "おかえりなさい",
    manageNotesAndDocs: "メモや文書を管理し、AIであなたの考えを整理します",
    email: "メール",
    password: "パスワード",
    enterEmail: "メールアドレスを入力してください",
    enterPassword: "パスワードを入力してください",
    loggingIn: "ログイン中...",
    name: "名前",
    enterName: "名前を入力してください",
    enterPasswordMin6: "パスワードを入力してください（最低6文字）",
    registering: "登録中...",
    orRegisterWith: "または次で登録",
    wechat: "WeChat",
    instagram: "Instagram",
    google: "Google",
    smartNoteAssistant: "Wspace",
    aiDrivenPlatform: "AIを活用したノートと文書管理プラットフォームで、自動的にコンテンツを分析、分類、要約し、Notionと同期します",
    getStarted: "始める",
    learnMore: "詳細を見る",
    coreFeatures: "主な機能",
    overview: "概要",
    reports: "レポート",
    aiAsAssistant: "AIをあなたのインテリジェントアシスタントに",
    smartNotes: "スマートノート",
    smartNotesDesc: "アイデアをメモすると、AIが自動的にタイトル、要約、カテゴリ、タグを生成します",
    documentAnalysis: "文書分析",
    documentAnalysisDesc: "文書をアップロードすると、AIが自動的に要点を抽出し、内容を要約し、インテリジェントに分類します",
    gentleAINote: "AIノートコンパニオン",
    helloWelcome: "こんにちは、wspaceへようこそ",
    aiHelpsYou: "AIがあなたのすべてのインスピレーションと文書を記録、整理、同期するのを手伝います",
    startNewNote: "新しいノートを作成",
    uploadDocument: "文書をアップロード",
    syncToNotion: "Notionに同期",
    recentNotes: "最近のノート",
    recentNotesPlaceholder: "（最近のノートがここに表示されます...）",
    recentDocuments: "最近の文書",
    recentDocumentsPlaceholder: "（最近アップロードした文書がここに表示されます...）",
    notes: "ノート",
    documents: "文書",
    preparingPage: "お待ちください、ページを準備しています",
    all: "すべて",
    notionAuthSuccess: "Notion認証が成功しました！あなたのノートと文書は自動的にNotionに同期されます。",
    notionAuthFailed: "Notion認証に失敗しました",
    unknownError: "不明なエラー",
    monthlyReportSuccess: "月次レポートが正常に生成されました！自動的にNotionに同期されました",
    monthlyReportFailed: "月次レポートの生成に失敗しました、もう一度お試しください",
    success: "成功",
    error: "エラー",
    generating: "生成中...",
    reportGenerationDesc: "月次レポートが生成され、アカウントに保存されました",
    reportGenerationErrorDesc: "レポート生成中にエラーが発生しました。後でもう一度お試しください",
    pleaseLogin: "ログインしてください",
    loginToManage: "ログイン後、ノートと文書を管理できます",
    totalNotes: "総ノート数",
    totalDocuments: "総文書数",
    newThisMonth: "今月の新規",
    notion_status: "Notionステータス",
    notConnected: "未接続",
    categoryStats: "カテゴリ統計",
    daily: "日常",
    work: "仕事",
    study: "学習",
    other: "その他",
    createNote: "ノート作成",
    newNote: "新しいノート",
// 删除重复的 uploadDocument 属性，因为在后面已经定义了 uploadDoc
    uploadDoc: "文書アップロード",
    monthlyReport: "月次レポート",
    generateMonthlyReport: "月次レポート生成",
    myNotes: "マイノート",
    searchNotes: "ノートを検索...",
    allCategories: "全カテゴリ",
    loginToCreateNotes: "ノート作成にはログインしてください",
    highPriority: "高",
    mediumPriority: "中",
    lowPriority: "低",
    noMatchingNotes: "一致するノートが見つかりません",
    noNotesYet: "まだノートがありません。作成を始めましょう！",
    myDocuments: "マイ文書",
    searchDocuments: "文書を検索...",
    loginToUploadDocuments: "文書アップロードにはログインしてください",
    noMatchingDocuments: "一致する文書が見つかりません",
    noDocumentsYet: "まだ文書がありません。アップロードを始めましょう！",
    loginToGenerateReport: "レポート生成にはログインしてください",
    notesManagement: "ノート管理",
    documentManagement: "文書管理",
    notionConnection: "Notion接続",
    connectToNotion: "Notionに接続",
    disconnectFromNotion: "Notionから切断",
    notionNotConnected: "Notion未接続",
    notionConnectionDesc: "ノートと文書を同期するためにNotionに接続",
    notionDisconnectionDesc: "切断するとデータ同期が停止します",
    monthlyReportFeatures: "月次レポート機能",
    dataStatistics: "データ統計",
    dataStatisticsDesc: "今月のノートと文書数を自動集計し、カテゴリ分布を分析",
    intelligentInsights: "インテリジェント洞察",
    intelligentInsightsDesc: "AIがコンテンツを分析し、深い洞察と改善提案を提供",
    actionPlan: "アクションプラン",
    actionPlanDesc: "今月のデータに基づいて、来月の具体的なアクションプランを作成",
    autoSync: "自動同期",
    autoSyncDesc: "生成された月次レポートは自動的にNotionデータベースに同期されます",
    back: "戻る",
    clipboardCopy: "クリップボードにコピーしました",
    checkingAuthStatus: "認証状態を確認中...",
    notionConnected: "Notion接続済み",
    notionConnectedSuccess: "Notionが正常に接続されました！",
    notionSyncDescription: "ノートと文書は自動的にNotionデータベースに同期されます。",
    workspace: "ワークスペース",
    database: "データベース",
    connected: "接続済み",
    disconnect: "接続解除",
    reauthorize: "再認証",
    notionDatabaseSetup: "Notionデータベース設定",
    redirectUriError: "「redirect_uri が見つからないか無効」エラーが発生した場合",
    configureOAuthSettings: "まずNotion開発者ページでOAuth設定を構成してください：",
    hide: "非表示",
    show: "表示",
    configSteps: "設定手順",
    notionDevConfigSteps: "Notion開発者ページ設定手順：",
    visitNotionDevPage: "Notion開発者ページにアクセス：",
    findIntegrationAndEdit: "インテグレーションを見つけて「編集」をクリック",
    setOAuthDomainAndURIs: "「OAuthドメインとURI」セクションで設定：",
    clickSaveChanges: "「変更を保存」をクリックして設定を保存",
    waitAndRetry: "設定が反映されるまで数分待ってから、再度認証を試みてください",
    oneClickConnectNotion: "ワンクリックNotion接続",
    clickButtonToAuth: "下のボタンをクリックしてポップアップウィンドウで認証します。Notionデータベースを自動的に作成・設定します。",
    benefitsAfterAuth: "認証後、以下が利用可能になります：",
    autoCreateDatabase: "専用ノートデータベースの自動作成",
    realTimeSync: "ノートと文書のリアルタイム同期",
    smartCategorization: "スマートな分類とタグ管理",
    monthlyReportGeneration: "自動月次レポート生成",
    authorizing: "認証中...",
    oneClickAuthNotion: "ワンクリックNotion認証",
    completeAuthInPopup: "ポップアップウィンドウでNotion認証を完了してください。認証が完了すると、ウィンドウは自動的に閉じます。",
    debugInfo: "デバッグ情報",
    confirmDisconnectNotion: "Notionとの接続を解除してもよろしいですか？",
    justNow: "たった今",
    hoursAgo: "時間前",
    daysAgo: "日前",
    weeksAgo: "週間前",
    monthsAgo: "ヶ月前",
    yearsAgo: "年前",
    minutesAgo: "分前",
    secondsAgo: "秒前",
    // その他の翻訳...
  },
  "ko-KR": {
    settings: "설정",
    appearance: "외관",
    account: "계정",
    notifications: "알림",
    language: "언어",
    privacy: "개인 정보 및 보안",
    home: "홈",
    dashboard: "대시보드",
    chat: "채팅 처리",
    login: "로그인",
    register: "회원가입",
    ares: "Ares AI 어시스턴트",
    newChat: "새 대화",
    sendMessage: "메시지 보내기",
    inputMessage: "메시지 입력...",
    thinking: "Ares가 생각 중...",
    welcomeToAres: "Ares AI 어시스턴트에 오신 것을 환영합니다",
    aresDescription: "저는 노트 정리, 문서 분석, 질문 답변 및 유용한 인사이트를 제공하는 AI 어시스턴트입니다.",
    analyzeArticle: "기사 주요 포인트 분석",
    summarizeMeeting: "회의 요점 요약",
    createStudyPlan: "학습 계획 생성",
    organizeNotes: "노트 정리",
    aresDisclaimer: "Ares는 AI 어시스턴트이며 오류가 발생할 수 있습니다. 중요한 정보는 확인해 주세요.",
    webSearch: "웹 검색",
    enableWebSearch: "웹 검색 활성화",
    disableWebSearch: "웹 검색 비활성화",
    searchingWeb: "웹 검색 중...",
    searchResult: "검색 결과",
    webSearchToggle: "웹 검색 토글",
    loading: "로딩 중...",
    welcomeBack: "돌아오신 것을 환영합니다",
    manageNotesAndDocs: "메모와 문서를 관리하고 AI로 생각을 정리하세요",
    email: "이메일",
    password: "비밀번호",
    enterEmail: "이메일을 입력하세요",
    enterPassword: "비밀번호를 입력하세요",
    loggingIn: "로그인 중...",
    name: "이름",
    enterName: "이름을 입력하세요",
    enterPasswordMin6: "비밀번호를 입력하세요 (최소 6자)",
    registering: "가입 중...",
    orRegisterWith: "또는 다음으로 가입",
    wechat: "WeChat",
    instagram: "Instagram",
    google: "Google",
    smartNoteAssistant: "Wspace",
    aiDrivenPlatform: "AI 기반 노트 및 문서 관리 플랫폼으로 자동으로 콘텐츠를 분석, 분류, 요약하고 Notion과 동기화합니다",
    getStarted: "시작하기",
    learnMore: "더 알아보기",
    coreFeatures: "핵심 기능",
    overview: "개요",
    reports: "보고서",
    aiAsAssistant: "AI를 지능형 어시스턴트로 활용하세요",
    smartNotes: "스마트 노트",
    smartNotesDesc: "아이디어를 메모하면 AI가 자동으로 제목, 요약, 카테고리 및 태그를 생성합니다",
    documentAnalysis: "문서 분석",
    documentAnalysisDesc: "문서를 업로드하면 AI가 자동으로 핵심 포인트를 추출하고 내용을 요약하며 지능적으로 분류합니다",
    gentleAINote: "AI 노트 컴패니언",
    helloWelcome: "안녕하세요, wspace에 오신 것을 환영합니다",
    aiHelpsYou: "AI가 모든 영감과 문서를 기록, 정리 및 동기화하는 데 도움을 줍니다",
    startNewNote: "새 노트 시작",
    uploadDocument: "문서 업로드",
    syncToNotion: "Notion에 동기화",
    recentNotes: "최근 노트",
    recentNotesPlaceholder: "(최근 노트가 여기에 표시됩니다...)",
    recentDocuments: "최근 문서",
    recentDocumentsPlaceholder: "(최근에 업로드한 문서가 여기에 표시됩니다...)",
    notes: "노트",
    documents: "문서",
    preparingPage: "잠시만 기다려주세요, 페이지를 준비 중입니다",
    all: "전체",
    notionAuthSuccess: "Notion 인증 성공! 노트와 문서가 자동으로 Notion에 동기화됩니다.",
    notionAuthFailed: "Notion 인증 실패",
    unknownError: "알 수 없는 오류",
    monthlyReportSuccess: "월간 보고서가 성공적으로 생성되었습니다! Notion에 자동으로 동기화되었습니다",
    monthlyReportFailed: "월간 보고서 생성 실패, 다시 시도해주세요",
    success: "성공",
    error: "오류",
    generating: "생성 중...",
    reportGenerationDesc: "월간 보고서가 생성되어 계정에 저장되었습니다",
    reportGenerationErrorDesc: "보고서 생성 중 문제가 발생했습니다. 나중에 다시 시도해 주세요",
    pleaseLogin: "로그인해 주세요",
    loginToManage: "로그인 후 노트와 문서를 관리할 수 있습니다",
    totalNotes: "총 노트 수",
    totalDocuments: "총 문서 수",
    newThisMonth: "이번 달 신규",
    notion_status: "Notion 상태",
    notConnected: "연결되지 않음",
    categoryStats: "카테고리 통계",
    daily: "일상",
    work: "업무",
    study: "학습",
    other: "기타",
    createNote: "노트 생성",
    newNote: "새 노트",
// 删除重复的 uploadDocument 属性，因为在前面已经定义过了
    uploadDoc: "문서 업로드",
    monthlyReport: "월간 보고서",
    generateMonthlyReport: "월간 보고서 생성",
    myNotes: "내 노트",
    searchNotes: "노트 검색...",
    allCategories: "모든 카테고리",
    loginToCreateNotes: "노트 생성을 위해 로그인해 주세요",
    highPriority: "높음",
    mediumPriority: "보통",
    lowPriority: "낮음",
    noMatchingNotes: "일치하는 노트를 찾을 수 없습니다",
    noNotesYet: "아직 노트가 없습니다. 생성을 시작하세요!",
    myDocuments: "내 문서",
    searchDocuments: "문서 검색...",
    loginToUploadDocuments: "문서 업로드를 위해 로그인해 주세요",
    noMatchingDocuments: "일치하는 문서를 찾을 수 없습니다",
    noDocumentsYet: "아직 문서가 없습니다. 업로드를 시작하세요!",
    loginToGenerateReport: "보고서 생성을 위해 로그인해 주세요",
    notesManagement: "노트 관리",
    documentManagement: "문서 관리",
    notionConnection: "Notion 연결",
    connectToNotion: "Notion에 연결",
    disconnectFromNotion: "Notion에서 연결 해제",
    notionNotConnected: "Notion 연결되지 않음",
    notionConnectionDesc: "노트와 문서를 동기화하기 위해 Notion에 연결",
    notionDisconnectionDesc: "연결을 해제하면 데이터 동기화가 중단됩니다",
    monthlyReportFeatures: "월간 보고서 기능",
    dataStatistics: "데이터 통계",
    dataStatisticsDesc: "이번 달 노트와 문서 수를 자동 집계하고 카테고리 분포를 분석",
    intelligentInsights: "지능형 인사이트",
    intelligentInsightsDesc: "AI가 콘텐츠를 분석하여 깊은 통찰과 개선 제안을 제공",
    actionPlan: "액션 플랜",
    actionPlanDesc: "이번 달 데이터를 바탕으로 다음 달 구체적인 액션 플랜을 수립",
    autoSync: "자동 동기화",
    autoSyncDesc: "생성된 월간 보고서는 자동으로 Notion 데이터베이스에 동기화됩니다",
    back: "뒤로",
    clipboardCopy: "클립보드에 복사됨",
    checkingAuthStatus: "인증 상태 확인 중...",
    notionConnected: "Notion 연결됨",
    notionConnectedSuccess: "Notion이 성공적으로 연결되었습니다!",
    notionSyncDescription: "노트와 문서가 자동으로 Notion 데이터베이스에 동기화됩니다.",
    workspace: "워크스페이스",
    database: "데이터베이스",
    connected: "연결됨",
    disconnect: "연결 해제",
    reauthorize: "재인증",
    notionDatabaseSetup: "Notion 데이터베이스 설정",
    redirectUriError: "'redirect_uri 누락 또는 유효하지 않음' 오류가 발생한 경우",
    configureOAuthSettings: "먼저 Notion 개발자 페이지에서 OAuth 설정을 구성하세요:",
    hide: "숨기기",
    show: "표시",
    configSteps: "구성 단계",
    notionDevConfigSteps: "Notion 개발자 페이지 구성 단계:",
    visitNotionDevPage: "Notion 개발자 페이지 방문:",
    findIntegrationAndEdit: "통합을 찾아 '편집'을 클릭하세요",
    setOAuthDomainAndURIs: "'OAuth 도메인 및 URI' 섹션에서 설정:",
    clickSaveChanges: "'변경 사항 저장'을 클릭하여 설정을 저장하세요",
    waitAndRetry: "설정이 적용될 때까지 몇 분 기다린 후 다시 인증을 시도하세요",
    oneClickConnectNotion: "원클릭 Notion 연결",
    clickButtonToAuth: "아래 버튼을 클릭하여 팝업 창에서 인증하세요. Notion 데이터베이스를 자동으로 생성하고 구성합니다.",
    benefitsAfterAuth: "인증 후 다음을 얻을 수 있습니다:",
    autoCreateDatabase: "전용 노트 데이터베이스 자동 생성",
    realTimeSync: "노트와 문서의 실시간 동기화",
    smartCategorization: "스마트 분류 및 태그 관리",
    monthlyReportGeneration: "자동 월간 보고서 생성",
    authorizing: "인증 중...",
    oneClickAuthNotion: "원클릭 Notion 인증",
    completeAuthInPopup: "팝업 창에서 Notion 인증을 완료하세요. 인증이 완료되면 창이 자동으로 닫힙니다.",
    debugInfo: "디버그 정보",
    confirmDisconnectNotion: "Notion 연결을 해제하시겠습니까?",
    justNow: "방금 전",
    hoursAgo: "시간 전",
    daysAgo: "일 전",
    weeksAgo: "주 전",
    monthsAgo: "개월 전",
    yearsAgo: "년 전",
    minutesAgo: "분 전",
    secondsAgo: "초 전",
    // 其他翻译...
  }
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageType>('zh-CN')
  const [mounted, setMounted] = useState(false)

  // 设置语言并保存到本地存储
  const setLanguage = (newLanguage: LanguageType) => {
    setLanguageState(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage)
    }
  }

  // 在客户端加载时从本地存储获取语言设置
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && (savedLanguage === 'zh-CN' || savedLanguage === 'en-US' || savedLanguage === 'ja-JP' || savedLanguage === 'ko-KR')) {
      setLanguageState(savedLanguage as LanguageType)
    }
  }, [])

  // 防止服务器端渲染不匹配
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 使用语言上下文的钩子
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // 在服务器端渲染时提供默认值，避免抛出错误
    if (typeof window === 'undefined') {
      return {
        language: 'zh-CN' as LanguageType,
        setLanguage: () => {},
        translations
      }
    }
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 获取当前语言的翻译文本的钩子
export function useTranslation(): TranslationKeys {
  const { language, translations } = useLanguage()
  return translations[language] || translations['zh-CN']
}