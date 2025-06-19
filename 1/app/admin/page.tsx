"use client"
import { useState } from "react";

const mockUsers = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "普通用户" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "管理员" },
];
const mockApis = [
  { id: 1, name: "OpenAI", endpoint: "https://api.openai.com/v1", key: "sk-***", status: "可用" },
  { id: 2, name: "Azure", endpoint: "https://azure.microsoft.com/api", key: "az-***", status: "可用" },
  { id: 3, name: "百度文心", endpoint: "https://wenxin.baidu.com/api", key: "bd-***", status: "可用" },
  { id: 4, name: "讯飞星火", endpoint: "https://spark.xfyun.cn/api", key: "xf-***", status: "可用" },
  { id: 5, name: "阿里通义", endpoint: "https://dashscope.aliyun.com/api", key: "ali-***", status: "可用" },
  { id: 6, name: "DeepSeek", endpoint: "https://api.deepseek.com/v1", key: "ds-***", status: "可用" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("user");
  const [users, setUsers] = useState(mockUsers);
  const [apis, setApis] = useState(mockApis);
  const [login, setLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // 简单登录校验
  function handleLogin(e: any) {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "admin123") {
      setLogin(true);
    } else {
      alert("账号或密码错误");
    }
  }

  // 用户管理操作
  function handleUserDelete(id: number) {
    setUsers(users.filter(u => u.id !== id));
  }
  // API管理操作
  function handleApiDelete(id: number) {
    setApis(apis.filter(a => a.id !== id));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:p-8">
      <div className="max-w-5xl mx-auto bg-white/90 rounded-3xl shadow-xl p-6 md:p-10 mt-8">
        <div className="flex gap-4 mb-8">
          <button className={`px-6 py-2 rounded-full font-semibold text-lg transition ${tab === "user" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"}`} onClick={() => setTab("user")}>用户管理</button>
          <button className={`px-6 py-2 rounded-full font-semibold text-lg transition ${tab === "api" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"}`} onClick={() => setTab("api")}>API管理</button>
        </div>
        {tab === "user" && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">用户列表</h3>
            <table className="w-full rounded-xl overflow-hidden shadow text-left">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">姓名</th>
                  <th className="py-3 px-4">邮箱</th>
                  <th className="py-3 px-4">角色</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-indigo-50 transition">
                    <td className="py-2 px-4">{u.id}</td>
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">{u.role}</td>
                    <td className="py-2 px-4">
                      <button className="text-red-500 hover:underline" onClick={() => handleUserDelete(u.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "api" && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">API节点管理</h3>
            <table className="w-full rounded-xl overflow-hidden shadow text-left">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="py-3 px-4">名称</th>
                  <th className="py-3 px-4">地址</th>
                  <th className="py-3 px-4">密钥</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {apis.map(a => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-indigo-50 transition">
                    <td className="py-2 px-4">{a.name}</td>
                    <td className="py-2 px-4">{a.endpoint}</td>
                    <td className="py-2 px-4">{a.key}</td>
                    <td className="py-2 px-4">{a.status}</td>
                    <td className="py-2 px-4">
                      <button className="text-red-500 hover:underline" onClick={() => handleApiDelete(a.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 