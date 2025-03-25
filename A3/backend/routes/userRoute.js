const express = require('express');
const userController = require('../controllers/userController');
const jwtAuth = require('../middleware/jwtAuth');
const clearance = require('../middleware/clearance');
const router = express.Router();

router.get('/me', jwtAuth, clearance('regular'), userController.retrieveUserInfo); 
router.patch('/me', jwtAuth, clearance('regular'), userController.updateUserInfo); 
router.patch('/me/password', jwtAuth, clearance('regular'), userController.updateUserPassword);

router.get('/me/transactions', jwtAuth, clearance('regular'), userController.retrieveOwnTransactions); 
router.post('/me/transactions', jwtAuth, clearance('regular'), userController.createRedemption); 

router.post('/', jwtAuth, clearance('cashier'), userController.registerNewUser); 
router.get('/', jwtAuth, clearance('manager'), userController.retrieveUsersList);

router.get('/:userId', jwtAuth, clearance('cashier'), userController.retrieveSpecificUser); 
router.patch('/:userId', jwtAuth, clearance('manager'), userController.updateSpecificUserInfo); 

router.post('/:userId/transactions', jwtAuth, clearance('regular'), userController.transferTransaction); 

module.exports = router;