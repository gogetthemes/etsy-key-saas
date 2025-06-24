require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cron = require('node-cron');
const axios = require('axios');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
  try {
    // Получаем всех пользователей с ключами
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({ include: { keywords: true } });
    for (const user of users) {
      for (const keyword of user.keywords) {
        // Отправляем запрос в n8n webhook (пример URL)
        await axios.post(process.env.N8N_RANK_WEBHOOK_URL, {
          userId: user.id,
          keyword: keyword.keyword,
        });
      }
    }
    console.log('Cron: rank analysis triggered');
  } catch (e) {
    console.error('Cron error:', e);
  }
});

app.post('/api/n8n/rank', async (req, res) => {
  const { listingId, keyword, position } = req.body;
  if (!listingId || !keyword || typeof position !== 'number') return res.status(400).json({ error: 'listingId, keyword, position required' });
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.listing.update({ where: { id: listingId }, data: { currentRank: position } });
  await prisma.rankHistory.create({ data: { listingId, keyword, position, checkedAt: new Date() } });
  res.json({ ok: true });
});

module.exports = app;
