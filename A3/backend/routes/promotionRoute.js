const express = require('express');
const promotionController = require('../controllers/promotionController');
const jwtAuth = require('../middleware/jwtAuth');
const clearance = require('../middleware/clearance');
const router = express.Router();

router.post('/', jwtAuth, clearance('manager'), promotionController.createPromotion);
router.get('/', jwtAuth, clearance('regular'), promotionController.retrievePromotionsList);
router.get('/:promotionId', jwtAuth, clearance('regular'), promotionController.retrieveSpecificPromotion);
router.patch('/:promotionId', jwtAuth, clearance('manager'), promotionController.updatePromotion);
router.delete('/:promotionId', jwtAuth, clearance('manager'), promotionController.deletePromotion);

module.exports = router;