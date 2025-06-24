const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Получить все ключи пользователя
router.get('/', async (req, res) => {
  const userId = String(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: 'A valid userId is required' });
  }
  const keywords = await prisma.keyword.findMany({ where: { userId } });
  res.json(keywords);
});

// Добавить новый ключ
router.post('/', async (req, res) => {
  const { userId, keyword } = req.body;
  if (!userId || !keyword) {
    return res.status(400).json({ error: 'A valid userId and keyword are required' });
  }
  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const count = await prisma.keyword.count({ where: { userId: String(userId) } });
  const limit = user.plan === 'PRO' ? 100 : 10;
  if (count >= limit) return res.status(403).json({ error: 'Keyword limit reached' });

  // Создаем ключ в базе со статусом "pending"
  const newKeyword = await prisma.keyword.create({ 
    data: { 
      userId: String(userId), 
      keyword, 
      listingCount: 0, 
      competition: 0, 
      suggestions: [] 
      // status: 'PENDING' // Если добавите поле status
    } 
  });

  // Отправляем асинхронный запрос в n8n и не ждем ответа
  if (process.env.N8N_WEBHOOK_URL) {
    axios.post(process.env.N8N_WEBHOOK_URL, {
      keywordId: newKeyword.id,
      keyword: newKeyword.keyword,
    }).catch(e => {
      // Логируем ошибку, но не останавливаем процесс, т.к. фронтенд уже получил ответ
      console.error(`[n8n] Failed to trigger webhook for keyword ID ${newKeyword.id}:`, e.message);
    });
  } else {
    console.warn('[n8n] N8N_WEBHOOK_URL is not set. Skipping webhook trigger.');
  }
  
  // Сразу возвращаем пользователю созданный ключ
  res.status(201).json(newKeyword);
});

// Получить анализ ключа
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const keyword = await prisma.keyword.findUnique({ where: { id } });
  if (!keyword) return res.status(404).json({ error: 'Not found' });
  res.json(keyword);
});

// Удалить ключ
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.keyword.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    // P2025: Record to delete not found
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Keyword not found' });
    }
    res.status(500).json({ error: 'Could not delete keyword' });
  }
});

// Редактировать ключ
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: 'New keyword text is required' });
  }
  try {
    const updatedKeyword = await prisma.keyword.update({
      where: { id },
      data: { keyword },
    });
    res.json(updatedKeyword);
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Keyword not found' });
    }
    res.status(500).json({ error: 'Could not update keyword' });
  }
});

module.exports = router; 