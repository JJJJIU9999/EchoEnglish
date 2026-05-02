import 'dotenv/config';
import { execSync } from 'child_process';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRouter from './routes/auth.js';
import corpusRouter from './routes/corpus.js';
import learningRouter from './routes/learning.js';
import vocabularyRouter from './routes/vocabulary.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Global middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/corpus', corpusRouter);
app.use('/api/learning', learningRouter);
app.use('/api/vocabulary', vocabularyRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'EchoEnglish API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

function freePort(port) {
  try {
    const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = stdout.trim().split('\n');
    const killed = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && !killed.has(pid)) {
        killed.add(pid);
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`[OK] 已终止旧进程 (PID ${pid})`);
        } catch {}
      }
    }
    return true;
  } catch {
    return false;
  }
}

function startServer(retry = true) {
  const server = http.createServer(app);

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (retry) {
        console.log(`端口 ${PORT} 被占用，尝试释放...`);
        freePort(PORT);
        setTimeout(() => startServer(false), 800);
      } else {
        console.error(`端口 ${PORT} 仍然被占用，请手动执行: taskkill /F /IM node.exe`);
        process.exit(1);
      }
    } else {
      console.error(err);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`EchoEnglish 已启动 → http://localhost:${PORT}`);
  });
}

startServer();
