"use client";
import { useState, useEffect } from "react";

// 初始模拟数据，仅在API请求失败时使用
const mockUsers = [
  { id: "1", name: "张三", email: "zhangsan@example.com", role: "普通用户", createdAt: new Date().toISOString() },
  { id: "2", name: "李四", email: "lisi@example.com", role: "管理员", createdAt: new Date().toISOString() },
];
const mockApis = [
  { id: "1", name: "OpenAI", endpoint: "https://api.openai.com/v1", apiKey: "sk-***", status: "active", model: "gpt-3.5-turbo", createdAt: new Date().toISOString() },
  { id: "2", name: "Azure", endpoint: "https://azure.microsoft.com/api", apiKey: "az-***", status: "active", model: "gpt-4", createdAt: new Date().toISOString() },
  { id: "3", name: "百度文心", endpoint: "https://wenxin.baidu.com/api", apiKey: "bd-***", status: "active", model: "ernie-bot", createdAt: new Date().toISOString() },
  { id: "4", name: "讯飞星火", endpoint: "https://spark.xfyun.cn/api", apiKey: "xf-***", status: "active", model: "spark-3.0", createdAt: new Date().toISOString() },
  { id: "5", name: "阿里通义", endpoint: "https://dashscope.aliyun.com/api", apiKey: "ali-***", status: "active", model: "qwen-turbo", createdAt: new Date().toISOString() },
  { id: "6", name: "DeepSeek", endpoint: "https://api.deepseek.com/v1", apiKey: "sk-729ef8c9a4994668a71c91881be764f4", status: "active", model: "deepseek-chat", createdAt: new Date().toISOString() },
];


export default function AdminPage() {
  const [tab, setTab] = useState("user");
  const [notionConfig, setNotionConfig] = useState<{
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    workspaceName?: string;
    workspaceId?: string;
    databaseName?: string;
    notionDatabaseId?: string;
    authorizedAt?: string;
  } | null>({
    clientId: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || '',
    clientSecret: '',
    redirectUri: ''
  });
  const [isLoadingNotion, setIsLoadingNotion] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [apis, setApis] = useState(mockApis);
  const [login, setLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showApiForm, setShowApiForm] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [apiForm, setApiForm] = useState<{name: string; endpoint: string; key: string; apiKey?: string; model: string}>({ name: "", endpoint: "", key: "", model: "" });
  const [loading, setLoading] = useState(false);
  const [realApis, setRealApis] = useState<ApiConfig[]>([]);
  const [useRealData, setUseRealData] = useState(false);

  const aiModels = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "deepseek-chat", label: "DeepSeek Chat" },
    { value: "deepseek-coder", label: "DeepSeek Coder" },
    { value: "ernie-bot", label: "文心一言" },
    { value: "spark-3.0", label: "讯飞星火3.0" },
    { value: "qwen-turbo", label: "通义千问Turbo" },
    { value: "qwen-plus", label: "通义千问Plus" },
    { value: "gemini-pro", label: "Gemini Pro" },
  ];

  // 加载AI配置
  const loadAiConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-config');
      
      if (response.ok) {
        const data = await response.json();
        setRealApis(data.configs);
        console.log('成功加载AI配置:', data.configs.length);
      } else {
        const errorData = await response.json();
        console.error('加载AI配置失败:', errorData.error);
        // 如果API请求失败，使用模拟数据
        setRealApis(mockApis);
      }
    } catch (error) {
      console.error('加载AI配置失败，异常详情:', error instanceof Error ? error.message : String(error));
      alert('加载AI配置时发生异常，请检查网络连接或联系管理员。');
      // 发生异常时使用模拟数据
      setRealApis(mockApis);
    } finally {
      setUseRealData(true);
      setLoading(false);
    }
  };
  
  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        // 为每个用户添加角色字段（数据库中可能没有这个字段）
        const usersWithRole = data.users.map((user: any) => ({
          ...user,
          role: user.email === 'admin@example.com' ? '管理员' : '普通用户'
        }));
        setUsers(usersWithRole);
        console.log('成功加载用户列表:', usersWithRole.length);
      } else {
        const errorData = await response.json();
        console.error('加载用户列表失败:', errorData.error);
        // 如果API请求失败，使用模拟数据
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('加载用户列表失败，异常详情:', error instanceof Error ? error.message : String(error));
      // 发生异常时使用模拟数据
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    if (login) {
      loadAiConfigs();
      loadUsers();
      loadNotionConfig();
    }
  }, [login]);
  
  // 确保在页面加载时检查登录状态
  useEffect(() => {
    // 检查是否已有登录状态（例如从localStorage）
    const savedLogin = localStorage.getItem('adminLogin');
    if (savedLogin === 'true') {
      setLogin(true);
    }
  }, []);
  
  const loadNotionConfig = async () => {
    setIsLoadingNotion(true);
    try {
      const response = await fetch('/api/admin/notion-config');
      if (response.ok) {
        const data = await response.json();
        setNotionConfig(data);
      }
    } catch (error) {
      console.error('Failed to load Notion config:', error);
    } finally {
      setIsLoadingNotion(false);
    }
  };
  
  const handleNotionAuth = () => {
    // 生成随机state用于验证回调
    const state = Math.random().toString(36).substring(2, 15);
    // 保存state到localStorage
    localStorage.setItem('notionAuthState', state);
    
    // 构建授权URL
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/api/notion/callback`;
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    
    // 跳转到Notion授权页面
    window.location.href = authUrl;
  };
  
  const disconnectNotion = async () => {
    try {
      const response = await fetch('/api/admin/notion-disconnect', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 更新状态
        setNotionConfig(null);
        alert('Notion连接已断开');
      } else {
        alert('断开Notion连接失败');
      }
    } catch (error) {
      console.error('Failed to disconnect Notion:', error);
      alert('断开Notion连接时发生错误');
    }
  };

  // 简单登录校验
  function handleLogin(e: any) {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "admin123") {
      // 直接设置登录状态为true，不尝试使用NextAuth登录
      setLogin(true);
      // 保存登录状态到localStorage
      localStorage.setItem('adminLogin', 'true');
      // 登录成功后立即加载AI配置
      loadAiConfigs();
      loadUsers();
      loadNotionConfig();
    } else {
      alert("账号或密码错误");
    }
  }

  // 用户管理操作
  async function handleUserDelete(id: string) {
    if (window.confirm('确定要删除该用户吗？')) {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // 删除成功，更新本地状态
          setUsers(users.filter(user => user.id !== id));
          alert('用户删除成功');
        } else {
          const errorData = await response.json();
          console.error('删除用户失败:', errorData.error);
          alert(`删除用户失败: ${errorData.error}`);
        }
      } catch (error) {
        console.error('删除用户时发生异常:', error instanceof Error ? error.message : String(error));
        alert('删除用户时发生异常，请检查网络连接或联系技术支持。');
      } finally {
        setLoading(false);
      }
    }
  }
  
  // 添加用户
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    password: '',
    role: '普通用户'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const handleUserAdd = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: '普通用户'
    });
    setEditingUserId(null);
    setShowUserForm(true);
  };
  
  // 定义用户类型接口
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }
  
  // 定义用户表单类型接口
  interface UserForm {
    name: string;
    email: string;
    password: string;
    role: string;
  }
  const handleUserEdit = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // 编辑时不显示密码
      role: user.role
    });
    setEditingUserId(user.id);
    setShowUserForm(true);
  };
  
  const handleUserCancel = () => {
    setShowUserForm(false);
  };
  
  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 表单验证
    if (!userForm.name || !userForm.email) {
      alert('请填写用户名和邮箱');
      return;
    }
    
    // 如果是新用户，密码必填
    if (!editingUserId && !userForm.password) {
      alert('请设置密码');
      return;
    }
    
    try {
      setLoading(true);
      
      const userData = {
        ...userForm,
        // 如果是编辑用户且密码为空，则不发送密码字段
        ...(editingUserId && !userForm.password ? { password: undefined } : {})
      };
      
      const url = editingUserId 
        ? `/api/admin/users?id=${editingUserId}` 
        : '/api/admin/users';
      
      const method = editingUserId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (editingUserId) {
          // 更新用户列表中的用户
          setUsers(users.map(user => 
            user.id === editingUserId ? 
            { ...result.user, role: result.user.email === 'admin@example.com' ? '管理员' : '普通用户' } : 
            user
          ));
          alert('用户更新成功');
        } else {
          // 添加新用户到列表
          setUsers([
            ...users, 
            { ...result.user, role: result.user.email === 'admin@example.com' ? '管理员' : '普通用户' }
          ]);
          alert('用户添加成功');
        }
        
        // 关闭表单
        setShowUserForm(false);
      } else {
        const errorData = await response.json();
        console.error(editingUserId ? '更新用户失败:' : '添加用户失败:', errorData.error);
        alert(`${editingUserId ? '更新' : '添加'}用户失败: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`${editingUserId ? '更新' : '添加'}用户时发生异常:`, error instanceof Error ? error.message : String(error));
      alert(`${editingUserId ? '更新' : '添加'}用户时发生异常，请检查网络连接或联系技术支持。`);
    } finally {
      setLoading(false);
    }
  };
  // API管理操作
  async function handleApiDelete(id: string) {
    if (window.confirm('确定要删除此API配置吗？')) {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/admin/ai-config?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // 删除成功，更新本地状态
          const filteredApis = apis.filter(api => api.id !== id);
          setApis(filteredApis);
          
          // 同时更新realApis
          const filteredRealApis = realApis.filter(api => api.id !== id);
          setRealApis(filteredRealApis);
          
          alert('API配置删除成功');
        } else {
          const errorData = await response.json();
          console.error('删除API配置失败:', errorData.error);
          alert(`删除API配置失败: ${errorData.error}`);
        }
      } catch (error) {
        console.error('删除API配置时发生异常:', error instanceof Error ? error.message : String(error));
        alert('删除API配置时发生异常，请检查网络连接或联系技术支持。');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleApiAdd() {
    setEditingApi(null);
    setApiForm({ name: "", endpoint: "", key: "", model: aiModels[0].value });
    setShowApiForm(true);
  }

  // 定义API配置类型接口
interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  key?: string; // 兼容两种字段名称
  status: string;
  model: string;
  createdAt: string;
}

function handleApiEdit(api: ApiConfig) {
  setEditingApi(api);
  setApiForm({ 
    name: api.name, 
    endpoint: api.endpoint, 
    key: api.apiKey || api.key || "", // 兼容两种字段名称，提供默认空字符串
    model: api.model 
  });
  setShowApiForm(true);
}

async function handleApiSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLoading(true);
    
    try {
      // 检查必填字段
      if (!apiForm.name || !apiForm.endpoint || !apiForm.key || !apiForm.model) {
        alert('请填写所有必填字段');
        setLoading(false);
        return;
      }

      // 准备API数据
      const apiData = {
        name: apiForm.name,
        endpoint: apiForm.endpoint,
        apiKey: apiForm.key, // 使用key字段的值，但发送到后端时使用apiKey字段名
        model: apiForm.model,
        status: 'active' // 默认状态为可用
      };
      
      // 确定请求URL和方法
      const url = editingApi 
        ? `/api/admin/ai-config?id=${editingApi.id}` 
        : '/api/admin/ai-config';
      
      const method = editingApi ? 'PUT' : 'POST';
      
      // 发送请求
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (editingApi) {
          // 更新现有API
          setApis(apis.map(a => a.id === editingApi.id ? result.config : a));
          
          // 同时更新realApis
          setRealApis(realApis.map(a => a.id === editingApi.id ? result.config : a));
          
          alert('API配置更新成功');
        } else {
          // 添加新API
          setApis([...apis, result.config]);
          setRealApis([...realApis, result.config]);
          
          alert('API配置添加成功');
        }
        
        setShowApiForm(false);
        setEditingApi(null);
        setApiForm({ name: "", endpoint: "", key: "", model: "" });
      } else {
        const errorData = await response.json();
        console.error(editingApi ? '更新API配置失败:' : '添加API配置失败:', errorData.error);
        alert(`${editingApi ? '更新' : '添加'}API配置失败: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`${editingApi ? '更新' : '添加'}API配置时发生异常:`, error instanceof Error ? error.message : String(error));
      alert(`${editingApi ? '更新' : '添加'}API配置时发生异常，请检查网络连接或联系技术支持。`);
    } finally {
      setLoading(false);
    }
  }

  function handleApiCancel() {
    setShowApiForm(false);
    setEditingApi(null);
    setApiForm({ name: "", endpoint: "", key: "", model: "" });
  }

  if (!login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">管理员登录</h2>
          <form className="w-full" onSubmit={handleLogin}>
            <input className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-lg" placeholder="用户名" value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} />
            <input className="w-full mb-6 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-lg" type="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
            <button className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-lg transition" type="submit">登录</button>
          </form>
        </div>
      </div>
    );
  }

  // 处理登出
  function handleLogout() {
    if (window.confirm('确定要退出登录吗？')) {
      setLogin(false);
      localStorage.removeItem('adminLogin');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:p-8">
      <div className="max-w-5xl mx-auto bg-white/90 rounded-3xl shadow-xl p-6 md:p-10 mt-8">
        <div className="flex justify-end mb-4">
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            className={`px-6 py-2 rounded-full font-semibold text-lg transition whitespace-nowrap ${tab === "user" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`} 
            onClick={() => setTab("user")}
          >
            用户管理
          </button>
          <button 
            className={`px-6 py-2 rounded-full font-semibold text-lg transition whitespace-nowrap ${tab === "api" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`} 
            onClick={() => setTab("api")}
          >
            API管理
          </button>
          <button 
            className={`px-6 py-2 rounded-full font-semibold text-lg transition whitespace-nowrap ${tab === "notion" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`} 
            onClick={() => setTab("notion")}
          >
            Notion集成
          </button>
        </div>
        {tab === "user" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">用户列表</h3>
              <button 
                className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
                onClick={handleUserAdd}
              >
                添加用户
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">ID</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">姓名</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">邮箱</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">角色</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4">{u.id}</td>
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === '管理员' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition"
                            onClick={() => handleUserEdit(u)}
                          >
                            编辑
                          </button>
                          <button 
                            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full transition" 
                            onClick={() => handleUserDelete(u.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* 用户表单弹窗 */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {editingUserId ? '编辑用户' : '添加用户'}
              </h3>
              <form onSubmit={handleUserSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    placeholder="请输入用户名"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码 {editingUserId && <span className="text-xs text-gray-500">(留空则不修改)</span>}
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder={editingUserId ? "留空则不修改密码" : "请设置密码"}
                    required={!editingUserId}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    <option value="普通用户">普通用户</option>
                    <option value="管理员">管理员</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    onClick={handleUserCancel}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  >
                    {editingUserId ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {tab === "notion" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Notion集成</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                  <path d="M6.017 4.313C9.358 0.493 15.01 0 26.314 0H73.686C84.99 0 90.642 0.493 93.983 4.313C97.324 8.133 98 13.399 98 24.48V75.52C98 86.601 97.324 91.867 93.983 95.687C90.642 99.507 84.99 100 73.686 100H26.314C15.01 100 9.358 99.507 6.017 95.687C2.676 91.867 2 86.601 2 75.52V24.48C2 13.399 2.676 8.133 6.017 4.313Z" fill="black"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M30.964 21.839C29.207 20.026 26.915 19 24.509 19H14C12.8954 19 12 19.8954 12 21V79C12 80.1046 12.8954 81 14 81H24.509C26.915 81 29.207 79.974 30.964 78.161L78.036 29.839C79.793 28.026 82.085 27 84.491 27H86C87.1046 27 88 26.1046 88 25V21C88 19.8954 87.1046 19 86 19H84.491C82.085 19 79.793 20.026 78.036 21.839L30.964 78.161C29.207 79.974 26.915 81 24.509 81H14C12.8954 81 12 80.1046 12 79V21C12 19.8954 12.8954 19 14 19H24.509C26.915 19 29.207 20.026 30.964 21.839Z" fill="white"/>
                </svg>
                <h4 className="text-lg font-semibold">Notion 集成状态</h4>
              </div>
              
              {isLoadingNotion ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
              ) : notionConfig ? (
                <div>
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center text-green-700 dark:text-green-400 mb-2">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span className="font-medium">已连接到 Notion</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">授权时间: {notionConfig.authorizedAt ? new Date(notionConfig.authorizedAt).toLocaleString() : '未知'}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex">
                      <span className="w-32 text-gray-500 dark:text-gray-400">工作区:</span>
                      <span className="font-medium">{notionConfig.workspaceName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 dark:text-gray-400">数据库:</span>
                      <span className="font-medium">{notionConfig.databaseName}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={disconnectNotion}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-full transition"
                    >
                      断开连接
                    </button>
                    <button 
                      onClick={handleNotionAuth}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-full transition"
                    >
                      重新授权
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    连接到 Notion 后，您可以将聊天记录自动保存到 Notion 数据库中，方便整理和查阅。
                  </p>
                  
                  <div className="mb-6">
                    <h5 className="font-medium mb-2">连接后您将获得：</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>自动将聊天记录保存到 Notion 数据库</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>在 Notion 中整理和分类您的聊天内容</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>随时查看和编辑保存的内容</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={handleNotionAuth}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                      <path d="M6.017 4.313C9.358 0.493 15.01 0 26.314 0H73.686C84.99 0 90.642 0.493 93.983 4.313C97.324 8.133 98 13.399 98 24.48V75.52C98 86.601 97.324 91.867 93.983 95.687C90.642 99.507 84.99 100 73.686 100H26.314C15.01 100 9.358 99.507 6.017 95.687C2.676 91.867 2 86.601 2 75.52V24.48C2 13.399 2.676 8.133 6.017 4.313Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M30.964 21.839C29.207 20.026 26.915 19 24.509 19H14C12.8954 19 12 19.8954 12 21V79C12 80.1046 12.8954 81 14 81H24.509C26.915 81 29.207 79.974 30.964 78.161L78.036 29.839C79.793 28.026 82.085 27 84.491 27H86C87.1046 27 88 26.1046 88 25V21C88 19.8954 87.1046 19 86 19H84.491C82.085 19 79.793 20.026 78.036 21.839L30.964 78.161C29.207 79.974 26.915 81 24.509 81H14C12.8954 81 12 80.1046 12 79V21C12 19.8954 12.8954 19 14 19H24.509C26.915 19 29.207 20.026 30.964 21.839Z" fill="black"/>
                    </svg>
                    连接到 Notion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {tab === "api" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-800">API节点管理</h3>
                <span
                  className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  真实数据
                </span>
              </div>
              <button 
                className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
                onClick={handleApiAdd}
              >
                添加API
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">名称</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">地址</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">密钥</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">模型</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">状态</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">创建时间</th>
                    <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(useRealData ? realApis : apis).map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4">{a.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{a.endpoint}</td>
                      <td className="py-3 px-4 text-sm font-mono">{(a.apiKey || (a as ApiConfig).key)?.substring(0, 10)}***</td>
                      <td className="py-3 px-4">{a.model}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs font-medium">{a.status === 'active' ? '可用' : a.status}</span>
                      </td>
                      <td className="py-3 px-4">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '未知'}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition" 
                            onClick={() => handleApiEdit(a)}
                          >
                            编辑
                          </button>
                          <button 
                            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full transition" 
                            onClick={() => handleApiDelete(a.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* API表单弹窗 */}
            {showApiForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {editingApi ? '编辑API' : '添加API'}
                  </h3>
                  <form onSubmit={handleApiSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">API名称</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={apiForm.name}
                        onChange={(e) => setApiForm({...apiForm, name: e.target.value})}
                        placeholder="例如：OpenAI"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">API地址</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={apiForm.endpoint}
                        onChange={(e) => setApiForm({...apiForm, endpoint: e.target.value})}
                        placeholder="https://api.openai.com/v1"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">API密钥</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={apiForm.apiKey || apiForm.key}
                        onChange={(e) => setApiForm({...apiForm, apiKey: e.target.value})}
                        placeholder="sk-..."
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI模型</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={apiForm.model}
                        onChange={(e) => setApiForm({...apiForm, model: e.target.value})}
                        required
                      >
                        <option value="">请选择模型</option>
                        {aiModels.map(model => (
                          <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        onClick={handleApiCancel}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                      >
                        {editingApi ? '更新' : '添加'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}