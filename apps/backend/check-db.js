const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('Checking database...');
    
    const keywords = await prisma.keyword.findMany();
    console.log('Keywords count:', keywords.length);
    
    if (keywords.length > 0) {
      console.log('First keyword:', keywords[0]);
    }
    
    const users = await prisma.user.findMany();
    console.log('Users count:', users.length);
    
    if (users.length > 0) {
      console.log('First user:', { id: users[0].id, email: users[0].email });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB(); 