const express = require('express');
const eventController = require('../controllers/eventController');
const jwtAuth = require('../middleware/jwtAuth');
const clearance = require('../middleware/clearance');
const router = express.Router();

router.post('/', jwtAuth, clearance('manager'), eventController.createEvent); 
router.get('/', jwtAuth, clearance('regular'), eventController.retrieveEventsList); 

router.get('/:eventId', jwtAuth, clearance('regular'), eventController.retrieveEvent); 
router.patch('/:eventId', jwtAuth, clearance('regular'), eventController.updateEvent); 
router.delete('/:eventId', jwtAuth, clearance('manager'), eventController.deleteEvent); 

router.post('/:eventId/guests/me', jwtAuth, clearance('regular'), eventController.addCurrentUserAsGuest); 
router.delete('/:eventId/guests/me', jwtAuth, clearance('regular'), eventController.removeCurrentUserAsGuest); 

router.post('/:eventId/guests', jwtAuth, clearance('regular'), eventController.addGuest); 
router.delete('/:eventId/guests/:userId', jwtAuth, clearance('manager'), eventController.removeGuest); 

router.post('/:eventId/organizers', jwtAuth, clearance('manager'), eventController.addOrganizer); 
router.delete('/:eventId/organizers/:userId', jwtAuth, clearance('manager'), eventController.removeOrganizer);

router.post('/:eventId/transactions', jwtAuth, clearance('regular'), eventController.createRewardTransaction); 


module.exports = router;