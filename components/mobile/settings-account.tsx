'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';
import { useToast } from '@/components/ui/use-toast';
import MobileAuth from './auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, LogOut, Settings, Shield, Database, ExternalLink, CheckCircle, AlertCircle, Copy, Loader2, Lock } from 'lucide-react';

// Notion Logo Icon组件
const NotionLogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.466L19.7 1.4c-.14-.373-.42-.47-.84-.423l-13.568.793C4.899 1.77 4.572 1.957 4.432 2.27L4.2 3.176c0 .234.14.56.259 1.033zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046 1.027-.373.98-1.026V7.354c0-.653-.233-.933-.746-.887l-15.177.887c-.56.047-.794.327-.794.933zm14.337.7c.047.374.047.654.047.934v10.17c0 .28-.047.654-.28.934-.233.186-.513.28-.793.233l-1.214-.14c-.28-.047-.466-.28-.466-.56V10.96c0-.374-.047-.747-.327-.98-.233-.186-.56-.233-.887-.186l-7.634.466c-.467 0-.747.373-.747.84v8.87c0 .373-.14.653-.42.793-.233.187-.513.233-.793.187l-1.073-.187c-.28-.047-.56-.327-.56-.606V8.218c0-.373.233-.7.606-.747l13.568-1.073c.327-.047.606.093.84.327.186.233.28.513.233.793z" />
  </svg>
);

// 账户设置页面的翻译配置
const accountTranslations = {
  "zh-CN": {
    accountSettings: "账户设置",
    manageAccount: "管理您的账户信息和设置。",
    accountInfo: "账户信息",
    profile: "个人资料",
    email: "邮箱",
    security: "安全",
    loginSecurity: "登录与安全",
    signOut: "退出登录",
    signOutDesc: "退出当前账户",
    notSignedIn: "未登录",
    signIn: "登录",
    signUp: "注册",
    back: "返回",
    // Notion授权相关
    notionIntegration: "Notion集成",
    notionIntegrationDesc: "连接您的Notion账户以同步笔记和文档",
    notionConnected: "Notion 已连接",
    notionConnectedSuccess: "您的Notion已成功连接！",
    notionSyncDescription: "笔记和文档会自动同步到您的Notion数据库。",
    workspace: "工作区",
    database: "数据库",
    connected: "已连接",
    smartNoteAssistant: "智能笔记助手",
    disconnect: "断开连接",
    reauthorize: "重新授权",
    notionDisconnected: "已断开与Notion的连接",
    notionDisconnectFailed: "断开Notion连接失败",
    notionDisconnectSuccess: "已断开与Notion的连接",
    notionDisconnectDescription: "您的Notion账户已断开连接",
    notionDatabaseSetup: "Notion 数据库设置",
    redirectUriError: "如果遇到 \"redirect_uri 缺失或无效\" 错误",
    configureOAuthSettings: "请先在 Notion 开发者页面正确配置 OAuth 设置：",
    show: "显示",
    hide: "隐藏",
    configSteps: "配置步骤",
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
    checkingAuthStatus: "检查授权状态...",
    clipboardCopy: "已复制到剪贴板",
    notionAuthSuccess: "Notion授权成功！您的笔记和文档将自动同步到Notion。",
    notionAuthFailed: "Notion授权失败",
    unknownError: "未知错误"
  },
  "en-US": {
    accountSettings: "Account Settings",
    manageAccount: "Manage your account information and settings.",
    accountInfo: "Account Information",
    profile: "Profile",
    email: "Email",
    security: "Security",
    loginSecurity: "Login & Security",
    signOut: "Sign Out",
    signOutDesc: "Sign out of your account",
    notSignedIn: "Not signed in",
    signIn: "Sign In",
    signUp: "Sign Up",
    back: "Back",
    // Notion authorization related
    notionIntegration: "Notion Integration",
    notionIntegrationDesc: "Connect your Notion account to sync notes and documents",
    notionConnected: "Notion Connected",
    notionConnectedSuccess: "Your Notion is successfully connected!",
    notionSyncDescription: "Notes and documents will automatically sync to your Notion database.",
    workspace: "Workspace",
    database: "Database",
    connected: "Connected",
    smartNoteAssistant: "Smart Note Assistant",
    disconnect: "Disconnect",
    reauthorize: "Reauthorize",
    notionDisconnected: "Disconnected from Notion",
    notionDisconnectFailed: "Failed to disconnect from Notion",
    notionDisconnectSuccess: "Disconnected from Notion",
    notionDisconnectDescription: "Your Notion account has been disconnected",
    notionDatabaseSetup: "Notion Database Setup",
    redirectUriError: "If you encounter \"redirect_uri missing or invalid\" error",
    configureOAuthSettings: "Please configure OAuth settings in your Notion developer page first:",
    show: "Show",
    hide: "Hide",
    configSteps: "configuration steps",
    oneClickConnectNotion: "One-Click Notion Connection",
    clickButtonToAuth: "Click the button below to authorize in the popup window. We will automatically create and configure your Notion database.",
    benefitsAfterAuth: "After authorization, you will get:",
    autoCreateDatabase: "Automatically create a dedicated notes database",
    realTimeSync: "Real-time sync of notes and documents",
    smartCategorization: "Smart categorization and tag management",
    monthlyReportGeneration: "Automatic monthly report generation",
    authorizing: "Authorizing...",
    oneClickAuthNotion: "One-Click Notion Authorization",
    completeAuthInPopup: "Please complete Notion authorization in the popup window. The window will close automatically when authorization is complete.",
    debugInfo: "Debug Info",
    checkingAuthStatus: "Checking authorization status...",
    clipboardCopy: "Copied to clipboard",
    notionAuthSuccess: "Notion authorization successful! Your notes and documents will automatically sync to Notion.",
    notionAuthFailed: "Notion authorization failed",
    unknownError: "Unknown error"
  },
  "ja-JP": {
    accountSettings: "アカウント設定",
    manageAccount: "アカウント情報と設定を管理します。",
    accountInfo: "アカウント情報",
    profile: "プロフィール",
    email: "メール",
    security: "セキュリティ",
    loginSecurity: "ログインとセキュリティ",
    signOut: "サインアウト",
    signOutDesc: "アカウントからサインアウト",
    notSignedIn: "サインインしていません",
    signIn: "サインイン",
    signUp: "サインアップ",
    back: "戻る",
    // Notion認証関連
    notionIntegration: "Notion連携",
    notionIntegrationDesc: "Notionアカウントを連携してノートと文書を同期する",
    notionConnected: "Notion連携済み",
    notionConnectedSuccess: "Notionの連携に成功しました！",
    notionSyncDescription: "ノートと文書は自動的にNotionデータベースに同期されます。",
    workspace: "ワークスペース",
    database: "データベース",
    connected: "連携済み",
    smartNoteAssistant: "スマートノートアシスタント",
    disconnect: "連携解除",
    reauthorize: "再認証",
    notionDisconnected: "Notionとの連携を解除しました",
    notionDisconnectFailed: "Notionとの連携解除に失敗しました",
    notionDisconnectSuccess: "Notionとの連携を解除しました",
    notionDisconnectDescription: "Notionアカウントとの連携が解除されました",
    notionDatabaseSetup: "Notionデータベース設定",
    redirectUriError: "\"redirect_uri が見つからないか無効\" エラーが発生した場合",
    configureOAuthSettings: "まずNotion開発者ページでOAuth設定を構成してください：",
    show: "表示",
    hide: "非表示",
    configSteps: "設定手順",
    oneClickConnectNotion: "ワンクリックNotion連携",
    clickButtonToAuth: "下のボタンをクリックしてポップアップウィンドウで認証します。Notionデータベースを自動的に作成・設定します。",
    benefitsAfterAuth: "認証後に得られるもの：",
    autoCreateDatabase: "専用のノートデータベースを自動作成",
    realTimeSync: "ノートと文書のリアルタイム同期",
    smartCategorization: "スマートな分類とタグ管理",
    monthlyReportGeneration: "月次レポートの自動生成",
    authorizing: "認証中...",
    oneClickAuthNotion: "ワンクリックNotion認証",
    completeAuthInPopup: "ポップアップウィンドウでNotion認証を完了してください。認証が完了すると、ウィンドウは自動的に閉じます。",
    debugInfo: "デバッグ情報",
    checkingAuthStatus: "認証状態を確認中...",
    clipboardCopy: "クリップボードにコピーしました",
    notionAuthSuccess: "Notion認証が成功しました！あなたのノートと文書は自動的にNotionに同期されます。",
    notionAuthFailed: "Notion認証に失敗しました",
    unknownError: "不明なエラー"
  },
  "ko-KR": {
    accountSettings: "계정 설정",
    manageAccount: "계정 정보와 설정을 관리합니다.",
    accountInfo: "계정 정보",
    profile: "프로필",
    email: "이메일",
    security: "보안",
    loginSecurity: "로그인 및 보안",
    signOut: "로그아웃",
    signOutDesc: "계정에서 로그아웃",
    notSignedIn: "로그인하지 않음",
    signIn: "로그인",
    signUp: "회원가입",
    back: "뒤로",
    // Notion 인증 관련
    notionIntegration: "Notion 통합",
    notionIntegrationDesc: "노트와 문서를 동기화하기 위해 Notion 계정 연결",
    notionConnected: "Notion 연결됨",
    notionConnectedSuccess: "Notion이 성공적으로 연결되었습니다!",
    notionSyncDescription: "노트와 문서가 자동으로 Notion 데이터베이스에 동기화됩니다.",
    workspace: "워크스페이스",
    database: "데이터베이스",
    connected: "연결됨",
    smartNoteAssistant: "스마트 노트 어시스턴트",
    disconnect: "연결 해제",
    reauthorize: "재인증",
    notionDisconnected: "Notion과의 연결이 해제되었습니다",
    notionDisconnectFailed: "Notion 연결 해제 실패",
    notionDisconnectSuccess: "Notion과의 연결이 해제되었습니다",
    notionDisconnectDescription: "Notion 계정과의 연결이 해제되었습니다",
    notionDatabaseSetup: "Notion 데이터베이스 설정",
    redirectUriError: "\"redirect_uri 누락 또는 유효하지 않음\" 오류가 발생한 경우",
    configureOAuthSettings: "먼저 Notion 개발자 페이지에서 OAuth 설정을 구성하세요:",
    show: "표시",
    hide: "숨기기",
    configSteps: "구성 단계",
    oneClickConnectNotion: "원클릭 Notion 연결",
    clickButtonToAuth: "아래 버튼을 클릭하여 팝업 창에서 인증하세요. Notion 데이터베이스를 자동으로 생성하고 구성합니다.",
    benefitsAfterAuth: "인증 후 얻을 수 있는 혜택:",
    autoCreateDatabase: "전용 노트 데이터베이스 자동 생성",
    realTimeSync: "노트와 문서 실시간 동기화",
    smartCategorization: "스마트 분류 및 태그 관리",
    monthlyReportGeneration: "월간 보고서 자동 생성",
    authorizing: "인증 중...",
    oneClickAuthNotion: "원클릭 Notion 인증",
    completeAuthInPopup: "팝업 창에서 Notion 인증을 완료하세요. 인증이 완료되면 창이 자동으로 닫힙니다.",
    debugInfo: "디버그 정보",
    checkingAuthStatus: "인증 상태 확인 중...",
    clipboardCopy: "클립보드에 복사됨",
    notionAuthSuccess: "Notion 인증 성공! 노트와 문서가 자동으로 Notion에 동기화됩니다.",
    notionAuthFailed: "Notion 인증 실패",
    unknownError: "알 수 없는 오류"
  }
};

interface MobileAccountSettingsProps {
  isOpen: boolean;
  onBack: () => void;
}
const MobileAccountSettings: React.FC<MobileAccountSettingsProps> = ({ isOpen, onBack }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showMobileAuth, setShowMobileAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  // 获取账户设置页面特定的翻译
  const at = accountTranslations[language as keyof typeof accountTranslations];

  // 检查Notion授权状态和处理URL参数
  useEffect(() => {
    if (!session) {
      setIsCheckingAuth(false);
      return;
    }
    
    // 检查URL参数中是否包含Notion授权结果
    const checkUrlParams = () => {
      if (typeof window === 'undefined') return;
      
      const urlParams = new URLSearchParams(window.location.search);
      
      // 处理授权错误
      const notionError = urlParams.get('notionError');
      if (notionError) {
        toast({
          title: at.notionAuthFailed,
          description: decodeURIComponent(notionError),
          variant: 'destructive',
        });
        
        // 清除URL参数
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }
      
      // 处理授权成功
      const notionAuthSuccess = urlParams.get('notionAuthSuccess');
      if (notionAuthSuccess === 'true') {
        // 获取授权数据
        const authData = {
          auth: true,
          access_token: urlParams.get('access_token') || '',
          workspace_name: urlParams.get('workspace_name') || '',
          workspace_id: urlParams.get('workspace_id') || '',
          database_id: urlParams.get('database_id') || '',
          database_name: urlParams.get('database_name') || ''
        };
        
        // 保存授权数据到localStorage
        localStorage.setItem('notion_auth', JSON.stringify(authData));
        setAuthStatus(authData);
        
        toast({
          title: at.notionAuthSuccess,
          description: at.notionSyncDescription,
        });
        
        // 清除URL参数
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }
    };
    
    const checkAuthStatus = async () => {
      try {
        setIsCheckingAuth(true);
        const response = await fetch('/api/notion/auth');
        if (response.ok) {
          const data = await response.json();
          setAuthStatus(data);
          // 如果本地存储有授权数据，但服务器没有，则清除本地存储
          const localAuth = localStorage.getItem('notion_auth');
          if (localAuth && !data.auth) {
            localStorage.removeItem('notion_auth');
          }
        } else {
          console.error('Failed to check Notion auth status');
        }
      } catch (error) {
        console.error('Error checking Notion auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    // 先检查URL参数，再检查授权状态
    checkUrlParams();
    checkAuthStatus();
  }, [session, at, toast]);

  // 处理Notion授权
  const handleNotionAuth = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 构建授权URL
      const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/notion/callback`;
      const state = Math.random().toString(36).substring(2, 15);
      
      // 保存state到localStorage以便验证回调
      localStorage.setItem('notion_auth_state', state);
      
      // 构建授权URL
      const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&owner=user`;
      
      // 使用浏览器打开授权URL，而不是WebView
      // 这样可以避免Google的"disallowed_useragent"错误
      window.location.href = authUrl;
      // 授权过程将通过URL参数处理，不再需要消息监听器
    } catch (error) {
      console.error('Error initiating Notion auth:', error);
      toast({
        title: at.notionAuthFailed,
        description: at.unknownError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 断开Notion连接
  const handleDisconnectNotion = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/notion/auth', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 清除localStorage中的授权数据
        localStorage.removeItem('notion_auth');
        setAuthStatus(null);
        toast({
          title: at.notionDisconnectSuccess,
          description: at.notionDisconnectDescription,
        });
      } else {
        toast({
          title: at.notionDisconnectFailed,
          description: at.unknownError,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error disconnecting Notion:', error);
      toast({
        title: at.notionDisconnectFailed,
        description: at.unknownError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      console.log("移动端账户页面开始退出登录...")
      // 修改退出登录方式，不使用callbackUrl参数
      await signOut({ redirect: false })
      console.log("移动端账户页面退出登录成功，手动重定向到/")
      // 成功退出后手动重定向
      window.location.href = "/"
    } catch (error) {
      console.error("移动端账户页面退出登录错误:", error)
      // 尝试记录更详细的错误信息
      if (error instanceof Error) {
        console.error("错误详情:", error.message, error.stack)
      }
      // 即使出错也尝试重定向到首页
      window.location.href = "/"
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b bg-background">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{at.accountSettings}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{at.manageAccount}</p>
        </div>

        {session ? (
          <>
            {/* 账户信息 */}
            <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">{at.accountInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* 用户头像和基本信息 */}
                <div className="flex items-center space-x-5">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/20 shadow-lg rounded-3xl">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} className="rounded-3xl" />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold rounded-3xl">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl">{session.user?.name || at.notSignedIn}</h3>
                    <p className="text-base text-muted-foreground mt-1">{session.user?.email}</p>
                  </div>
                </div>

                {/* 账户选项 */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-border/20 bg-muted/20 hover:bg-muted/30 transition-all duration-200" disabled>
                    <User className="h-5 w-5 mr-3" />
                    {at.profile}
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-border/20 bg-muted/20 hover:bg-muted/30 transition-all duration-200" disabled>
                    <Mail className="h-4 w-4 mr-3" />
                    {at.email}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notion 集成 */}
            <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">{at.notionIntegration}</CardTitle>
                <CardDescription className="text-base">{at.notionIntegrationDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {isCheckingAuth ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>{at.checkingAuthStatus}</span>
                  </div>
                ) : authStatus?.auth ? (
                  <div className="space-y-4">
                    <div className="flex items-center bg-green-500/10 text-green-500 p-4 rounded-xl">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">{at.notionConnectedSuccess}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{at.workspace}</span>
                        </div>
                        <span className="text-sm font-medium">{authStatus?.workspace_name}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{at.database}</span>
                        </div>
                        <span className="text-sm font-medium">{at.smartNoteAssistant}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={handleDisconnectNotion}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {at.disconnect}
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleNotionAuth}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {at.reauthorize}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{at.oneClickConnectNotion}</h3>
                      <p className="text-sm text-muted-foreground">{at.clickButtonToAuth}</p>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                      <h4 className="text-sm font-medium">{at.benefitsAfterAuth}</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {at.autoCreateDatabase}
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {at.realTimeSync}
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {at.smartCategorization}
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleNotionAuth}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {at.authorizing}
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {at.oneClickAuthNotion}
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="link" 
                        className="text-xs p-0 h-auto" 
                        onClick={() => setShowConfig(!showConfig)}
                      >
                        {at.redirectUriError} {showConfig ? at.hide : at.show} {at.configSteps}
                      </Button>
                    </div>
                    
                    {showConfig && (
                      <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-xs">
                        <p>{at.configureOAuthSettings}</p>
                        <div className="flex items-center justify-between bg-background/50 p-2 rounded">
                          <code className="text-xs">{`${window.location.origin}/api/notion/callback`}</code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/api/notion/callback`);
                              toast({
                                description: at.clipboardCopy,
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 安全设置 */}
            <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">{at.security}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-border/20 bg-muted/20 hover:bg-muted/30 transition-all duration-200" disabled>
                  <Shield className="h-5 w-5 mr-3" />
                  {at.loginSecurity}
                </Button>
              </CardContent>
            </Card>

            {/* 退出登录 */}
            <Card className="border-border/20 bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-md shadow-xl rounded-3xl border border-destructive/20">
              <CardHeader className="p-6">
                <CardTitle className="text-destructive text-lg font-semibold">{at.signOut}</CardTitle>
                <CardDescription className="text-base">{at.signOutDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Button 
                  variant="destructive" 
                  className="w-full h-12 rounded-2xl font-semibold"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {isSigningOut ? '...' : at.signOut}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 未登录状态 */
          <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-semibold">{at.notSignedIn}</CardTitle>
              <CardDescription className="text-base">{at.manageAccount}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Button 
                className="w-full h-12 rounded-2xl font-semibold" 
                onClick={() => {
                  setAuthTab('login');
                  setShowMobileAuth(true);
                }}
              >
                {at.signIn}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-border/20 bg-muted/20 hover:bg-muted/30 transition-all duration-200 font-semibold" 
                onClick={() => {
                  setAuthTab('register');
                  setShowMobileAuth(true);
                }}
              >
                {at.signUp}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* 手机端登录组件 */}
      <MobileAuth
        isOpen={showMobileAuth}
        onClose={() => setShowMobileAuth(false)}
        defaultTab={authTab}
      />
    </div>
  );
};

export default MobileAccountSettings;