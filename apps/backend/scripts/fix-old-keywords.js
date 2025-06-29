const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOldKeywords() {
  try {
    console.log('[SCRIPT] Starting to fix all keywords...');
    // Get all keywords
    const keywords = await prisma.keyword.findMany();
    console.log(`[SCRIPT] Found ${keywords.length} keywords to check`);
    for (const keyword of keywords) {
      let needsUpdate = false;
      const updateData = {};
      if (!Array.isArray(keyword.etsySuggestions)) {
        updateData.etsySuggestions = [];
        needsUpdate = true;
      }
      if (!Array.isArray(keyword.relatedKeywords)) {
        updateData.relatedKeywords = [];
        needsUpdate = true;
      }
      if (!Array.isArray(keyword.suggestions)) {
        updateData.suggestions = [];
        needsUpdate = true;
      }
      if (typeof keyword.isActive !== 'boolean') {
        updateData.isActive = true;
        needsUpdate = true;
      }
      if (typeof keyword.listingCount !== 'number') {
        updateData.listingCount = 0;
        needsUpdate = true;
      }
      if (typeof keyword.competition !== 'number') {
        updateData.competition = 0;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await prisma.keyword.update({
          where: { id: keyword.id },
          data: updateData
        });
        console.log(`[SCRIPT] Fixed keyword: ${keyword.keyword} (ID: ${keyword.id})`);
      }
    }
    console.log('[SCRIPT] All keywords checked and fixed if needed!');
  } catch (error) {
    console.error('[SCRIPT] Error fixing keywords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixOldKeywords(); 