require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cron = require('node-cron');
const axios = require('axios');
const cors = require('cors');

console.log('[APP] Starting application...');
console.log('[APP] Environment:', process.env.NODE_ENV || 'development');
console.log('[APP] Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('[APP] N8N Webhook URL:', process.env.N8N_WEBHOOK_URL ? 'Set' : 'Not set');

const indexRouter = require('./routes/index');

const app = express();

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: true, // Разрешаем все домены для тестирования
  credentials: true
}));

app.use('/', indexRouter);

// All auth routes are now handled by next-auth on the frontend,
// EXCEPT for signup. We keep that one.
app.use('/api', require('./routes/auth'));
app.use('/api/keywords', require('./routes/keywords'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/n8n', require('./routes/n8n'));

// Ежедневный cron для анализа позиций через n8n webhook
cron.schedule('0 3 * * *', async () => {
  console.log('[CRON] Starting daily rank analysis...');
  try {
    // Получаем всех пользователей с ключами
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({ include: { keywords: true } });
    
    console.log(`[CRON] Found ${users.length} users with keywords`);
    
    for (const user of users) {
      console.log(`[CRON] Processing user ${user.id} with ${user.keywords.length} keywords`);
      for (const keyword of user.keywords) {
        // Отправляем запрос в n8n webhook (пример URL)
        if (process.env.N8N_RANK_WEBHOOK_URL) {
        await axios.post(process.env.N8N_RANK_WEBHOOK_URL, {
          userId: user.id,
          keyword: keyword.keyword,
        });
          console.log(`[CRON] Sent rank analysis request for keyword: ${keyword.keyword}`);
        } else {
          console.log('[CRON] N8N_RANK_WEBHOOK_URL not set, skipping rank analysis');
        }
      }
    }
    console.log('[CRON] Daily rank analysis completed');
  } catch (e) {
    console.error('[CRON] Error during rank analysis:', e);
  }
});

app.post('/api/n8n/rank', async (req, res) => {
  console.log('[N8N] Rank update request received:', req.body);
  
  const { listingId, keyword, position } = req.body;
  if (!listingId || !keyword || typeof position !== 'number') {
    console.log('[N8N] Rank update failed: invalid parameters');
    return res.status(400).json({ error: 'listingId, keyword, position required' });
  }
  
  try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
    
    console.log(`[N8N] Updating listing ${listingId} rank to ${position} for keyword: ${keyword}`);
    
  await prisma.listing.update({ where: { id: listingId }, data: { currentRank: position } });
  await prisma.rankHistory.create({ data: { listingId, keyword, position, checkedAt: new Date() } });
    
    console.log('[N8N] Rank update completed successfully');
  res.json({ ok: true });
  } catch (e) {
    console.error('[N8N] Rank update error:', e);
    res.status(500).json({ error: 'Failed to update rank' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('[APP] Application started successfully');

module.exports = app;
