const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Регистрация нового пользователя
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });
    res.json(user);
  } catch (e) {
    if (e.code === 'P2002') { // Unique constraint failed
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    console.error(e);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;