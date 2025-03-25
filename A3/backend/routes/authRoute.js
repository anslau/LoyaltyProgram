const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/tokens', authController.tokens);
router.post('/resets/:resetToken', authController.resetToken);
router.post('/resets', authController.resets);

module.exports = router;