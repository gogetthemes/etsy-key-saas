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
      keywords: true,
    },
  });
  res.json(users);
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