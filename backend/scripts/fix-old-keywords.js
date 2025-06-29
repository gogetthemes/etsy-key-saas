const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keywords = await prisma.keyword.findMany();
  let updated = 0;
  for (const k of keywords) {
    let changed = false;
    const data = {};
    if (typeof k.etsySuggestions === 'undefined') {
      data.etsySuggestions = [];
      changed = true;
    }
    if (typeof k.relatedKeywords === 'undefined') {
      data.relatedKeywords = [];
      changed = true;
    }
    if (changed) {
      await prisma.keyword.update({
        where: { id: k.id },
        data
      });
      updated++;
    }
  }
  console.log(`Обновлено ключевиков: ${updated}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 