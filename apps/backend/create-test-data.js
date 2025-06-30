const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test data...');
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'test-hash',
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
          isActive: true,
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
          isActive: true,
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

createTestData(); 