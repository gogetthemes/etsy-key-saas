const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// DEBUG: Вывести реальные поля таблицы Keyword
(async () => {
  try {
    const firstKeyword = await prisma.keyword.findFirst();
    if (firstKeyword) {
      console.log('[DEBUG] Prisma Keyword fields:', Object.keys(firstKeyword));
    } else {
      console.log('[DEBUG] No keywords in DB to show fields');
    }
  } catch (e) {
    console.log('[DEBUG] Error reading Keyword fields:', e.message);
  }
})();

// Получить все ключевые слова пользователя
router.get('/', async (req, res) => {
  try {
    // TODO: Получить userId из сессии/токена
    const userId = req.query.userId || 'test-user'; // Временно для тестирования
    
    const keywords = await prisma.keyword.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(keywords);
  } catch (error) {
    console.error('[KEYWORDS] Get keywords error:', error);
    res.status(500).json({ error: 'Failed to get keywords' });
  }
});

// Получить конкретное ключевое слово
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const keyword = await prisma.keyword.findUnique({
      where: { id },
      select: {
        id: true,
        keyword: true,
        userId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        etsySuggestions: true,
        relatedKeywords: true,
        listingCount: true,
        competition: true,
        lastParsed: true
      }
    });
    
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }
    
    res.json(keyword);
  } catch (error) {
    console.error('[KEYWORDS] Get keyword error:', error);
    res.status(500).json({ error: 'Failed to get keyword' });
  }
});

// Добавить новое ключевое слово
router.post('/', async (req, res) => {
  try {
    const { keyword, userId } = req.body;
    
    if (!keyword || !userId) {
      return res.status(400).json({ error: 'Keyword and userId are required' });
    }
    
    console.log('[KEYWORDS] Adding keyword:', { keyword, userId });
    
    // Проверяем, существует ли уже такое ключевое слово у пользователя
    const existingKeyword = await prisma.keyword.findFirst({
      where: { 
        keyword: keyword.toLowerCase(),
        userId 
      }
    });
    
    let keywordRecord;
    
    if (existingKeyword) {
      console.log('[KEYWORDS] Keyword exists, updating...');
      // Обновляем существующее ключевое слово
      keywordRecord = await prisma.keyword.update({
        where: { id: existingKeyword.id },
        data: { 
          isActive: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('[KEYWORDS] Creating new keyword...');
      try {
        // Создаем новое ключевое слово
        keywordRecord = await prisma.keyword.create({
    data: { 
            keyword: keyword.toLowerCase(),
            userId,
            isActive: true,
      listingCount: 0, 
      competition: 0, 
            suggestions: [],
            relatedKeywords: [],
            etsySuggestions: [],
          }
        });
      } catch (err) {
        // Если ошибка уникального индекса, просто активируем существующий ключ
        if (err.code === 'P2002') {
          console.log('[KEYWORDS] Duplicate keyword, activating existing...');
          keywordRecord = await prisma.keyword.update({
            where: {
              keyword_userId: {
                keyword: keyword.toLowerCase(),
                userId
              }
            },
            data: {
              isActive: true,
              updatedAt: new Date()
            }
    });
  } else {
          throw err;
        }
      }
    }
    
    // Отправляем запрос в n8n для парсинга
    try {
      console.log('[KEYWORDS] Sending to n8n for parsing...');
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
        console.log('[KEYWORDS] Successfully sent to n8n');
      } else {
        console.error('[KEYWORDS] N8N request failed:', n8nResponse.status);
      }
    } catch (n8nError) {
      console.error('[KEYWORDS] N8N error:', n8nError);
      // Не прерываем процесс, если n8n недоступен
    }
    
    res.status(201).json(keywordRecord);
  } catch (error) {
    console.error('[KEYWORDS] Add keyword error:', error);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

// Обновить данные ключевого слова (вызывается из n8n)
router.put('/:id/update-data', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      etsySuggestions, 
      relatedKeywords, 
      listingCount, 
      competition 
    } = req.body;
    
    console.log('[KEYWORDS] Updating keyword data:', { id, etsySuggestions, relatedKeywords });
    
    const updatedKeyword = await prisma.keyword.update({
      where: { id },
      data: {
        etsySuggestions: etsySuggestions || [],
        relatedKeywords: relatedKeywords || [],
        listingCount: listingCount || 0,
        competition: competition || 0,
        lastParsed: new Date(),
        updatedAt: new Date()
      }
    });
    
    res.json(updatedKeyword);
  } catch (error) {
    console.error('[KEYWORDS] Update keyword data error:', error);
    res.status(500).json({ error: 'Failed to update keyword data' });
  }
});

// Обновить ключевое слово (редактирование из UI)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      keyword,
      etsySuggestions,
      relatedKeywords,
      listingCount,
      competition,
      isActive
    } = req.body;

    const updatedKeyword = await prisma.keyword.update({
      where: { id },
      data: {
        ...(keyword !== undefined ? { keyword } : {}),
        ...(etsySuggestions !== undefined ? { etsySuggestions } : {}),
        ...(relatedKeywords !== undefined ? { relatedKeywords } : {}),
        ...(listingCount !== undefined ? { listingCount } : {}),
        ...(competition !== undefined ? { competition } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        updatedAt: new Date()
      }
    });
    res.json(updatedKeyword);
  } catch (error) {
    console.error('[KEYWORDS] Edit keyword error:', error);
    res.status(500).json({ error: 'Failed to edit keyword' });
  }
});

// Удалить ключевое слово (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.keyword.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error('[KEYWORDS] Delete keyword error:', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

module.exports = router; 