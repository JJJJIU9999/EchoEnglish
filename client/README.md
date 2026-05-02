# EchoEnglish 前端

基于 React 18 + TypeScript + Vite 5 + TailwindCSS 构建。

## 启动

```bash
npm install
npm run dev      # 开发模式 → http://localhost:5173
npm run build    # 生产构建 → dist/
```

## 目录结构

```
src/
├── api/            # Axios 实例 + API 请求函数
├── components/     # 通用组件（Layout、ProtectedRoute）
├── context/        # React Context（AuthContext）
├── pages/          # 页面组件
│   ├── Home.tsx          # 落地页
│   ├── Login.tsx         # 登录
│   ├── Register.tsx      # 注册
│   ├── CorpusList.tsx    # 语料列表
│   ├── CorpusDetail.tsx  # 语料详情 + 视频播放
│   ├── Learning.tsx      # 听写练习
│   └── Profile.tsx       # 个人中心（统计/记录/生词本）
├── types/          # TypeScript 类型定义
├── App.tsx         # 路由配置
├── main.tsx        # 入口
└── index.css       # TailwindCSS 入口
```
