const express = require('express');
const router = express.Router();
const { getTarget, updateTarget } = require('../controllers/targetController');

router.route('/')
  .get(getTarget)
  .put(updateTarget);

module.exports = router;
