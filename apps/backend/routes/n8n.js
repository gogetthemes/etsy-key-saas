const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Этот эндпоинт будет вызываться вашим n8n воркфлоу, когда он закончит парсинг
router.post('/update-keyword', async (req, res) => {
  const { keywordId, listingCount, competition, suggestions } = req.body;

  // Базовая валидация
  if (!keywordId) {
    return res.status(400).json({ error: 'keywordId is required' });
  }

  try {
    const updatedKeyword = await prisma.keyword.update({
      where: { id: String(keywordId) },
      data: {
        listingCount: parseInt(listingCount, 10) || 0,
        competition: parseFloat(competition) || 0,
        suggestions: Array.isArray(suggestions) ? suggestions : [],
        // Здесь можно добавить поле status и поменять его на 'processed'
      },
    });
    console.log(`[n8n] Keyword ${updatedKeyword.keyword} (ID: ${keywordId}) was updated.`);
    res.status(200).json({ success: true, keyword: updatedKeyword });
  } catch (e) {
    if (e.code === 'P2025') { // Record to update not found
      return res.status(404).json({ error: 'Keyword not found' });
    }
    console.error(`[n8n] Error updating keyword ID ${keywordId}:`, e);
    res.status(500).json({ error: 'Could not update keyword' });
  }
});

module.exports = router;
