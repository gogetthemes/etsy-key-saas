const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Получить все ключи пользователя
router.get('/', async (req, res) => {
  console.log('[KEYWORDS] Get keywords request:', { query: req.query });
  
  const userId = String(req.query.userId);
  if (!userId) {
    console.log('[KEYWORDS] Get keywords failed: missing userId');
    return res.status(400).json({ error: 'A valid userId is required' });
  }

  try {
    console.log(`[KEYWORDS] Fetching keywords for user: ${userId}`);
    const keywords = await prisma.keyword.findMany({ where: { userId } });
    console.log(`[KEYWORDS] Found ${keywords.length} keywords for user ${userId}`);
    res.json(keywords);
  } catch (e) {
    console.error('[KEYWORDS] Error fetching keywords:', e);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// Добавить новый ключ
router.post('/', async (req, res) => {
  console.log('[KEYWORDS] Add keyword request:', { body: req.body });
  
  const { userId, keyword } = req.body;
  if (!userId || !keyword) {
    console.log('[KEYWORDS] Add keyword failed: missing userId or keyword');
    return res.status(400).json({ error: 'A valid userId and keyword are required' });
  }

  try {
    console.log(`[KEYWORDS] Checking user: ${userId}`);
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) {
      console.log(`[KEYWORDS] Add keyword failed: user not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[KEYWORDS] Checking keyword limit for user: ${userId}`);
    const count = await prisma.keyword.count({ where: { userId: String(userId) } });
    const limit = user.plan === 'PRO' ? 100 : 10;
    
    console.log(`[KEYWORDS] User has ${count}/${limit} keywords`);
    
    if (count >= limit) {
      console.log(`[KEYWORDS] Add keyword failed: limit reached for user ${userId}`);
      return res.status(403).json({ error: 'Keyword limit reached' });
    }

    // Создаем ключ в базе со статусом "pending"
    console.log(`[KEYWORDS] Creating keyword: "${keyword}" for user: ${userId}`);
    const newKeyword = await prisma.keyword.create({ 
      data: { 
        userId: String(userId), 
        keyword, 
        listingCount: 0, 
        competition: 0, 
        suggestions: [] 
      } 
    });

    console.log(`[KEYWORDS] Keyword created successfully:`, { 
      id: newKeyword.id, 
      keyword: newKeyword.keyword 
    });

    // Отправляем асинхронный запрос в n8n и не ждем ответа
    if (process.env.N8N_WEBHOOK_URL) {
      console.log(`[KEYWORDS] Triggering n8n webhook for keyword: ${newKeyword.id}`);
      axios.post(process.env.N8N_WEBHOOK_URL, {
        keywordId: newKeyword.id,
        keyword: newKeyword.keyword,
      }).then(() => {
        console.log(`[KEYWORDS] n8n webhook triggered successfully for keyword: ${newKeyword.id}`);
      }).catch(e => {
        // Логируем ошибку, но не останавливаем процесс, т.к. фронтенд уже получил ответ
        console.error(`[KEYWORDS] Failed to trigger webhook for keyword ID ${newKeyword.id}:`, e.message);
      });
    } else {
      console.warn('[KEYWORDS] N8N_WEBHOOK_URL is not set. Skipping webhook trigger.');
    }
    
    // Сразу возвращаем пользователю созданный ключ
    console.log(`[KEYWORDS] Returning keyword to user:`, { 
      id: newKeyword.id, 
      keyword: newKeyword.keyword 
    });
    res.status(201).json(newKeyword);
  } catch (e) {
    console.error('[KEYWORDS] Error creating keyword:', e);
    res.status(500).json({ error: 'Failed to create keyword' });
  }
});

// Получить анализ ключа
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`[KEYWORDS] Get keyword analysis request: ${id}`);
  
  try {
    const keyword = await prisma.keyword.findUnique({ where: { id } });
    if (!keyword) {
      console.log(`[KEYWORDS] Keyword not found: ${id}`);
      return res.status(404).json({ error: 'Not found' });
    }
    
    console.log(`[KEYWORDS] Returning keyword analysis:`, { 
      id: keyword.id, 
      keyword: keyword.keyword,
      listingCount: keyword.listingCount,
      competition: keyword.competition
    });
    res.json(keyword);
  } catch (e) {
    console.error('[KEYWORDS] Error fetching keyword analysis:', e);
    res.status(500).json({ error: 'Failed to fetch keyword analysis' });
  }
});

// Удалить ключ
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[KEYWORDS] Delete keyword request: ${id}`);
  
  try {
    await prisma.keyword.delete({ where: { id } });
    console.log(`[KEYWORDS] Keyword deleted successfully: ${id}`);
    res.status(204).send();
  } catch (e) {
    console.error('[KEYWORDS] Error deleting keyword:', e);
    // P2025: Record to delete not found
    if (e.code === 'P2025') {
      console.log(`[KEYWORDS] Keyword not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Keyword not found' });
    }
    res.status(500).json({ error: 'Could not delete keyword' });
  }
});

// Редактировать ключ
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { keyword } = req.body;
  
  console.log(`[KEYWORDS] Update keyword request:`, { id, newKeyword: keyword });
  
  if (!keyword) {
    console.log(`[KEYWORDS] Update keyword failed: missing keyword text`);
    return res.status(400).json({ error: 'New keyword text is required' });
  }
  
  try {
    const updatedKeyword = await prisma.keyword.update({
      where: { id },
      data: { keyword },
    });
    
    console.log(`[KEYWORDS] Keyword updated successfully:`, { 
      id: updatedKeyword.id, 
      keyword: updatedKeyword.keyword 
    });
    res.json(updatedKeyword);
  } catch (e) {
    console.error('[KEYWORDS] Error updating keyword:', e);
    if (e.code === 'P2025') {
      console.log(`[KEYWORDS] Keyword not found for update: ${id}`);
      return res.status(404).json({ error: 'Keyword not found' });
    }
    res.status(500).json({ error: 'Could not update keyword' });
  }
});

module.exports = router; 