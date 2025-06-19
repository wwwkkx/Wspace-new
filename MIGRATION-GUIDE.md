# Prisma 到 Supabase 迁移指南

本指南将帮助您将应用程序从 Prisma 和 SQLite 迁移到 Supabase（基于 PostgreSQL）。

## 迁移步骤

### 1. 环境配置

确保在 `.env.local` 文件中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

您可以从 Supabase 项目设置中获取这些值。

### 2. 创建 Supabase 数据库架构

运行以下命令创建 Supabase 数据库架构：

```bash
npx ts-node scripts/run-supabase-schema.ts
```

这将在 Supabase 数据库中创建所需的表和关系。

### 3. 数据迁移

运行以下命令将数据从 Prisma/SQLite 迁移到 Supabase：

```bash
npx ts-node scripts/migrate-to-supabase.ts
```

这将读取现有的 SQLite 数据库并将数据迁移到 Supabase。

### 4. 验证迁移

迁移完成后，您可以通过以下方式验证：

1. 登录 Supabase 控制台，检查表和数据
2. 启动应用程序并测试功能

```bash
npm run dev
```

## 架构变更

### 主要变更

- 数据库从 SQLite 更改为 PostgreSQL
- 文档内容现在存储在 Supabase Storage 中，而不是数据库中
- 使用 Supabase Auth 替代 NextAuth.js 的 Prisma 适配器

### 文件变更

以下是主要的文件变更：

- `lib/supabase.ts` - Supabase 客户端配置
- `lib/supabase-adapter.ts` - NextAuth.js 的 Supabase 适配器
- `lib/supabase-storage.ts` - Supabase 存储工具函数
- `types/supabase.ts` - Supabase 数据库类型定义
- `app/api/documents/*` - 更新为使用 Supabase 存储
- `prisma/schema.prisma` - 更新为使用 PostgreSQL

## 故障排除

### 常见问题

1. **认证问题**：确保 Supabase URL 和密钥正确配置
2. **数据库连接错误**：检查 DATABASE_URL 是否正确
3. **存储问题**：确保 Supabase 存储桶已正确创建

### 日志

如果遇到问题，请检查以下日志：

- 应用程序日志
- Supabase 控制台中的日志
- 迁移脚本输出

## 回滚计划

如果需要回滚到 Prisma/SQLite：

1. 恢复原始的 `.env` 和 `.env.local` 文件
2. 恢复 `prisma/schema.prisma` 文件中的 SQLite 配置
3. 恢复 `app/api/auth/[...nextauth]/route.ts` 中的 Prisma 适配器
4. 删除 Supabase 相关文件
5. 重启应用程序