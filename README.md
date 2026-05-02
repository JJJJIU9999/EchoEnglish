# EchoEnglish

沉浸式英语学习平台 — 真实母语语料、精准听写评分、学习进度追踪。

## 环境搭建

### 1. 数据库

确保 MySQL 已启动，然后建库建表：

```bash
mysql -u root -p < server/schema.sql
```

默认数据库名：`echo_english`。

### 2. 后端

```bash
cd server
npm install
npm run seed           # 导入示例数据
npm run dev            # 启动服务 → http://localhost:3001
```

配置文件在 `server/.env`，已预设 `root/root`，可按需修改。

### 3. 前端

```bash
cd client
npm install
npm run dev            # 启动前端 → http://localhost:5173
```

## API 接口

| 方法 | 路径 | 认证 |
|------|------|------|
| POST | /api/auth/register | 否 |
| POST | /api/auth/login | 否 |
| GET | /api/auth/me | 是 |
| GET | /api/corpus | 否 |
| GET | /api/corpus/:id | 否 |
| POST | /api/learning/records | 是 |
| GET | /api/learning/records | 是 |
| GET | /api/learning/stats | 是 |
| POST | /api/vocabulary | 是 |
| GET | /api/vocabulary | 是 |
| PATCH | /api/vocabulary/:id | 是 |
| DELETE | /api/vocabulary/:id | 是 |

## 示例数据

种子脚本插入了 3 个语料场景，每个包含完整字幕句子：

1. **咖啡店点单**（日常场景，难度 1） — 8 句
2. **求职面试**（商务场景，难度 3） — 10 句
3. **问路指路**（旅游场景，难度 2） — 9 句

> 注意：视频链接为占位 URL（如 `/videos/cafe.mp4`）。导入数据后可替换为真实视频路径。

## 技术栈

- **前端**：React 18 + TypeScript + Vite 5 + TailwindCSS + React Router v6
- **后端**：Express 4 + MySQL（mysql2）+ JWT
- **认证**：bcryptjs + jsonwebtoken（7 天有效期）
