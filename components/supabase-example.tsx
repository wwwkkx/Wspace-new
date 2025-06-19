"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

export function SupabaseAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setMessage('注册成功！请检查您的邮箱以验证账户。');
    } catch (error: any) {
      setMessage(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setMessage('登录成功！');
    } catch (error: any) {
      setMessage(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase 认证示例</CardTitle>
        <CardDescription>使用 Supabase 进行注册和登录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input 
              id="email" 
              placeholder="your.email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="您的密码" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <div className={`p-2 rounded ${message.includes('错误') ? 'bg-red-100' : 'bg-green-100'}`}>
              {message}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSignUp} disabled={loading}>
          {loading ? '处理中...' : '注册'}
        </Button>
        <Button onClick={handleSignIn} disabled={loading}>
          {loading ? '处理中...' : '登录'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SupabaseStorage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [files, setFiles] = useState<Array<{name: string, url: string}>>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .list();

      if (error) throw error;

      // 获取每个文件的公共URL
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(file.name);
          
          return {
            name: file.name,
            url: publicUrl
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error: any) {
      console.error('获取文件列表失败:', error.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('请先选择一个文件');
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      // 上传文件到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`${Date.now()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // 获取上传文件的公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      setFileUrl(publicUrl);
      setMessage('文件上传成功！');
      fetchFiles(); // 刷新文件列表
    } catch (error: any) {
      setMessage(`错误: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Supabase 存储示例</CardTitle>
        <CardDescription>使用 Supabase Storage 上传和管理文件</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="file">选择文件</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange}
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? '上传中...' : '上传文件'}
          </Button>
          {message && (
            <div className={`p-2 rounded ${message.includes('错误') ? 'bg-red-100' : 'bg-green-100'}`}>
              {message}
            </div>
          )}
          {fileUrl && (
            <div className="mt-4">
              <p>文件已上传:</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                查看文件
              </a>
            </div>
          )}
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">已上传的文件:</h3>
              <ul className="list-disc pl-5 mt-2">
                {files.map((file, index) => (
                  <li key={index}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SupabaseDatabase() {
  const [todos, setTodos] = useState<Array<{id: string, task: string, completed: boolean}>>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTodos(data || []);
    } catch (error: any) {
      console.error('获取待办事项失败:', error.message);
      setMessage(`获取待办事项失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim()) {
      setMessage('请输入待办事项内容');
      return;
    }

    try {
      setMessage(null);
      
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask, completed: false }])
        .select();

      if (error) throw error;
      
      setTodos([...(data || []), ...todos]);
      setNewTask('');
    } catch (error: any) {
      setMessage(`添加待办事项失败: ${error.message}`);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error: any) {
      setMessage(`更新待办事项失败: ${error.message}`);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error: any) {
      setMessage(`删除待办事项失败: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Supabase 数据库示例</CardTitle>
        <CardDescription>使用 Supabase 数据库管理待办事项</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="添加新的待办事项..." 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <Button onClick={addTodo}>添加</Button>
          </div>
          
          {message && (
            <div className="p-2 rounded bg-red-100">
              {message}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <div className="mt-4">
              {todos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">暂无待办事项</div>
              ) : (
                <ul className="space-y-2">
                  {todos.map(todo => (
                    <li key={todo.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id, todo.completed)}
                          className="mr-2"
                        />
                        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                          {todo.task}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500"
                      >
                        删除
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SupabaseExample() {
  return (
    <div className="space-y-8 p-4">
      <SupabaseAuth />
      <SupabaseStorage />
      <SupabaseDatabase />
    </div>
  );
}