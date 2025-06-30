const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUserAndData() {
  try {
    console.log('Creating test user and data...');
    
    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        id: 'cmcgk0ek40001cu3mpblw8a60', // Use the same ID from logs
        email: 'test@example.com',
        passwordHash: passwordHash,
        plan: 'FREE'
      }
    });
    
    console.log('Created user:', user.id);
    
    // Create test keywords
    const keywords = await Promise.all([
      prisma.keyword.create({
        data: {
          keyword: 'handmade leather journal',
          userId: user.id,
          listingCount: 150,
          competition: 0.7,
          etsySuggestions: ['leather journal', 'handmade journal'],
          relatedKeywords: ['leather', 'journal', 'handmade'],
          suggestions: ['leather', 'journal']
        }
      }),
      prisma.keyword.create({
        data: {
          keyword: 'wooden phone stand',
          userId: user.id,
          listingCount: 89,
          competition: 0.5,
          etsySuggestions: ['phone stand', 'wooden stand'],
          relatedKeywords: ['phone', 'stand', 'wooden'],
          suggestions: ['phone', 'stand']
        }
      })
    ]);
    
    console.log('Created keywords:', keywords.map(k => k.keyword));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserAndData(); 