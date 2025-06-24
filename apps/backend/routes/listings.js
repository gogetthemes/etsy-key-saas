const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Получить все листинги пользователя
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const listings = await prisma.listing.findMany({ where: { userId } });
  res.json(listings);
});

// Обновить позицию и историю (вызывается n8n)
router.post('/rank', async (req, res) => {
  const { listingId, keyword, position } = req.body;
  if (!listingId || !keyword || typeof position !== 'number') return res.status(400).json({ error: 'listingId, keyword, position required' });
  // Обновляем текущую позицию
  await prisma.listing.update({
    where: { id: listingId },
    data: { currentRank: position },
  });
  // Добавляем в историю
  await prisma.rankHistory.create({
    data: {
      listingId,
      keyword,
      position,
      checkedAt: new Date(),
    },
  });
  res.json({ ok: true });
});

// Получить историю позиций по листингу
router.get('/:id/history', async (req, res) => {
  const listingId = req.params.id;
  const history = await prisma.rankHistory.findMany({
    where: { listingId },
    orderBy: { checkedAt: 'desc' },
  });
  res.json(history);
});

module.exports = router; 