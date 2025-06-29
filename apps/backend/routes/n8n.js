const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Trigger n8n workflow for keyword parsing
router.post('/trigger', async (req, res) => {
  try {
    const { keyword, userId } = req.body;
    
    if (!keyword || !userId) {
      return res.status(400).json({ error: 'keyword and userId are required' });
    }

    console.log('[N8N] Triggering workflow for keyword:', keyword);

    // Send request to n8n webhook
    if (process.env.N8N_WEBHOOK_URL) {
      const response = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.toLowerCase(),
          userId: userId,
          action: 'parse_keyword'
        }),
      });

      if (response.ok) {
        console.log('[N8N] Workflow triggered successfully');
        res.json({ success: true, message: 'Workflow triggered' });
      } else {
        console.error('[N8N] Failed to trigger workflow:', response.status);
        res.status(500).json({ error: 'Failed to trigger workflow' });
      }
    } else {
      console.error('[N8N] N8N_WEBHOOK_URL not configured');
      res.status(500).json({ error: 'N8N webhook not configured' });
    }
  } catch (error) {
    console.error('[N8N] Trigger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
