const express = require('express');
const transactionController = require('../controllers/transactionController');
const jwtAuth = require('../middleware/jwtAuth');
const clearance = require('../middleware/clearance');
const router = express.Router();

router.post('/', jwtAuth, clearance('cashier'), transactionController.createTransaction);
router.get('/', jwtAuth, clearance('manager'), transactionController.retrieveTransactions);
router.get('/:transactionId', jwtAuth, clearance('manager'), transactionController.retrieveSpecificTransaction);
router.patch('/:transactionId/suspicious', jwtAuth, clearance('manager'), transactionController.transactionSuspicious);
router.patch('/:transactionId/processed', jwtAuth, clearance('cashier'), transactionController.completeRedemption);


module.exports = router;