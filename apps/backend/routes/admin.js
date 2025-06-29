const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('[/routes/admin.js] - File loaded and router initialized');

// Список пользователей
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      plan: true,
      createdAt: true,
      keywords: {
        where: { isActive: true }
      },
    },
  });
  res.json(users);
});

// Добавить ключевое слово пользователю (админка)
router.post('/add-keyword', async (req, res) => {
  try {
    const { userId, keyword } = req.body;
    
    if (!userId || !keyword) {
      return res.status(400).json({ error: 'userId and keyword are required' });
    }
    
    console.log('[ADMIN] Adding keyword:', { userId, keyword });
    
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Проверяем, существует ли уже такое ключевое слово у пользователя
    const existingKeyword = await prisma.keyword.findFirst({
      where: { 
        keyword: keyword.toLowerCase(),
        userId 
      }
    });
    
    let keywordRecord;
    
    if (existingKeyword) {
      console.log('[ADMIN] Keyword exists, updating...');
      // Обновляем существующее ключевое слово
      keywordRecord = await prisma.keyword.update({
        where: { id: existingKeyword.id },
        data: { 
          isActive: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('[ADMIN] Creating new keyword...');
      // Создаем новое ключевое слово
      keywordRecord = await prisma.keyword.create({
        data: {
          keyword: keyword.toLowerCase(),
          userId,
          isActive: true
        }
      });
    }
    
    // Отправляем запрос в n8n для парсинга
    try {
      console.log('[ADMIN] Sending to n8n for parsing...');
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.toLowerCase(),
          keywordId: keywordRecord.id,
          userId: userId,
          action: 'parse_keyword'
        }),
      });
      
      if (n8nResponse.ok) {
        console.log('[ADMIN] Successfully sent to n8n');
      } else {
        console.error('[ADMIN] N8N request failed:', n8nResponse.status);
      }
    } catch (n8nError) {
      console.error('[ADMIN] N8N error:', n8nError);
      // Не прерываем процесс, если n8n недоступен
    }
    
    // Логируем действие
    await prisma.adminLog.create({
      data: {
        action: 'ADD_KEYWORD',
        userId: userId,
        details: `Added keyword: ${keyword}`,
        timestamp: new Date()
      }
    });
    
    res.status(201).json(keywordRecord);
  } catch (error) {
    console.error('[ADMIN] Add keyword error:', error);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

// Получить ключевые слова пользователя
router.get('/user/:userId/keywords', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const keywords = await prisma.keyword.findMany({
      where: { 
        userId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(keywords);
  } catch (error) {
    console.error('[ADMIN] Get user keywords error:', error);
    res.status(500).json({ error: 'Failed to get user keywords' });
  }
});

// Удалить ключевое слово (админка)
router.delete('/keyword/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const keyword = await prisma.keyword.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }
    
    await prisma.keyword.update({
      where: { id },
      data: { isActive: false }
    });
    
    // Логируем действие
    await prisma.adminLog.create({
      data: {
        action: 'DELETE_KEYWORD',
        userId: keyword.userId,
        details: `Deleted keyword: ${keyword.keyword}`,
        timestamp: new Date()
      }
    });
    
    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error('[ADMIN] Delete keyword error:', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

// Логи
router.get('/logs', async (req, res) => {
  const logs = await prisma.adminLog.findMany({
    include: { user: true },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
  res.json(logs);
});

module.exports = router; 