const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'EtsyKeywordWatcher backend API' });
});

module.exports = router;
