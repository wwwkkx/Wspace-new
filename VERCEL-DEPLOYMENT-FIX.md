# Vercel部署问题修复指南

## 问题描述

在Vercel部署过程中遇到了两个主要问题：

1. `Cannot find module '.prisma/client/default'` - Prisma客户端未正确生成
2. `Failed to collect page data for /api/admin/ai-config` - 数据库表结构与Prisma模型不匹配

## 解决方案

### 问题1：Prisma客户端未生成

已通过以下修改解决：

1. 在`package.json`中添加了`postinstall`脚本，确保安装依赖后自动生成Prisma客户端
2. 修改了`build`脚本，在构建前先生成Prisma客户端
3. 创建了`vercel.json`文件，确保Vercel正确执行构建过程

### 问题2：ai_configs表结构与Prisma模型不匹配

这个问题是由于Supabase的`ai_configs`表中有`user_id`字段并且设置为NOT NULL，但在Prisma的AiConfig模型中没有这个字段。

#### 解决步骤：

1. 执行`fix-ai-configs.sql`脚本修改Supabase数据库中的`ai_configs`表：
   - 将`user_id`字段设置为可空
   - 添加`status`字段（如果不存在）
   - 删除不需要的`key`和`type`字段（如果存在）

2. 更新Prisma模型：
   - 在`AiConfig`模型中添加可选的`userId`字段和与`User`的关系
   - 在`User`模型中添加与`AiConfig`的关系

## 执行修复

1. 运行SQL修复脚本：

```bash
npx ts-node scripts/run-fix-ai-configs.ts
```

2. 更新Prisma模型：

   将`prisma/schema-update.prisma`和`prisma/user-update.prisma`中的内容合并到`prisma/schema.prisma`文件中

3. 生成更新后的Prisma客户端：

```bash
npx prisma generate
```

4. 重新部署到Vercel：

```bash
git add .
git commit -m "Fix Vercel deployment issues"
git push
```

## 预防未来问题

1. 确保Prisma模型与数据库表结构保持同步
2. 在进行数据库迁移时，注意字段的非空约束
3. 在本地测试部署前，先运行`npx prisma generate`确保Prisma客户端正确生成
