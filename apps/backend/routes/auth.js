const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Обработка OPTIONS запросов для CORS
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

// Логин пользователя
router.post('/login', async (req, res) => {
  console.log('[AUTH] Login request received:', { 
    body: req.body, 
    headers: req.headers,
    timestamp: new Date().toISOString() 
  });

  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('[AUTH] Login failed: missing email or password');
    return res.status(400).json({ error: 'Email and password required' });
  }

  console.log('[AUTH] Attempting to authenticate user with email:', email);

  try {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('[AUTH] Login failed: user not found with email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      console.log('[AUTH] Login failed: user has no password hash');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('[AUTH] Comparing passwords...');
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      console.log('[AUTH] Login failed: invalid password for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('[AUTH] Login successful for user:', { 
      id: user.id, 
      email: user.email, 
      plan: user.plan 
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      message: 'Login successful'
    });

  } catch (e) {
    console.error('[AUTH] Login error:', {
      error: e.message,
      code: e.code,
      stack: e.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      error: 'Something went wrong during login',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

// Регистрация нового пользователя
router.post('/signup', async (req, res) => {
  console.log('[AUTH] Signup request received:', { 
    body: req.body, 
    headers: req.headers,
    timestamp: new Date().toISOString() 
  });

  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('[AUTH] Signup failed: missing email or password');
    return res.status(400).json({ error: 'Email and password required' });
  }

  console.log('[AUTH] Attempting to create user with email:', email);

  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('[AUTH] Signup failed: user already exists with email:', email);
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    console.log('[AUTH] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[AUTH] Password hashed successfully');

    console.log('[AUTH] Creating user in database...');
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash,
        plan: 'FREE' // Устанавливаем план по умолчанию
      },
    });

    console.log('[AUTH] User created successfully:', { 
      id: user.id, 
      email: user.email, 
      plan: user.plan 
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      plan: user.plan,
      message: 'User registered successfully'
    });

  } catch (e) {
    console.error('[AUTH] Signup error:', {
      error: e.message,
      code: e.code,
      stack: e.stack,
      timestamp: new Date().toISOString()
    });

    if (e.code === 'P2002') { // Unique constraint failed
      console.log('[AUTH] Signup failed: duplicate email');
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    res.status(500).json({ 
      error: 'Something went wrong during registration',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

module.exports = router;
