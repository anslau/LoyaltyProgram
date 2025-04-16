const eventService = require('../services/eventService');
const { validateFields } = require('../utils/validate');

function validDate(date){
    const dateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[\+\-]\d{2}:\d{2}))$/;
    if (!dateRegex.test(date)){
        return false;
    }

    // check that date is a valid date
    const d = new Date(date);

    return d instanceof Date && !isNaN(d);
}

async function createEvent(req, res){
    const { name, description, location, startTime, endTime, capacity, points, published} = req.body;

    // check for invalid fields
    const validFields = ['name', 'description', 'location', 'startTime', 'endTime', 'capacity', 'points', 'published'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check for missing fields
    if (!name || !description || !location || !startTime || !endTime || !points){
        return res.status(400).json({ message: "Missing field" });
    }

    if (!validDate(startTime) || !validDate(endTime)){
        return res.status(400).json({ message: "Invalid date: must be in ISO8601 format" });
    }

    // check that the date is in the future and end is after start
    const today = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start < today || start > end){
        return res.status(400).json({ message: "Invalid date: start must not be in the past and end must be after start" });
    }

    // check that if capacity is passed it's a valid number
    if (capacity !== undefined && capacity !== null && (capacity < 0 || !Number.isInteger(capacity))){
        return res.status(400).json({ message: "capacity must be a positive integer value" });
    }

    // check points is a positive integer
    if (points < 0 || !Number.isInteger(points)){
        return res.status(400).json({ message: "points must be a positive integer value" });
    }

    // create the 
    const { id } = req.user;
    const data = { name, description, location, startTime, endTime, capacity, points, published };
    const event = await eventService.createEvent(data, id);

    return res.status(201).json(event);
}

async function retrieveEventsList(req, res){
    // check that only valid fields are passed
    const validFields = ['name', 'location', 'started', 'ended', 'published', 'showFull', 'page', 'limit', 'orderBy', 'order'];
    if (!validateFields(req.query, validFields)){
        return res.status(404).json({ message: "Invalid URL parameter" });
    }

    const { name, location, started, ended, published, showFull, page, limit, orderBy, order } = req.query;
    const { role, id } = req.user;

    // only managers can access these
    if ((role === 'regular' || role === 'cashier') && published === 'false'){
        return res.status(403).json({ message: "Unauthorized" });
    }

    const validBools = ['true', 'false'];
    if (started && ended){
        return res.status(400).json({ message: "Cannot have both started and ended" });
    }
    if ((started && !validBools.includes(started)) || (ended && !validBools.includes(ended)) || (published && !validBools.includes(published)) || (showFull && !validBools.includes(showFull))){
        return res.status(400).json({ message: "Invalid type: should be boolean" });
    }
    if (page && isNaN(parseInt(page)) || page && page < 0 ){
        return res.status(400).json({ message: "invalid page param" });
    }
    if (limit && isNaN(parseInt(limit)) || limit && limit < 0 ){
        return res.status(400).json({ message: "invalid skip param" });
    }

    // get the events
    const filters = { name, location, started, ended, published, showFull, page, limit, orderBy, order };
    const events = await eventService.retrieveEventsList(filters, role, id);

    return res.status(200).json(events);
}

async function retrieveEvent(req, res){
    const { eventId } = req.params;
    const { role, id } = req.user;

    // check that the id is an integer
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }

    // get the event
    const event = await eventService.retrieveEvent(parseInt(eventId), role, id);
    if (event.error){
        return res.status(event.status).json({ message: event.error });
    }

    return res.status(200).json(event);
}

async function updateEvent(req, res){  
    // check that all fields given are valid
    const validFields = ['name', 'description', 'location', 'startTime', 'endTime', 'capacity', 'points', 'published'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // get required data
    const { eventId } = req.params;
    const { name, description, location, startTime, endTime, capacity, points, published } = req.body;
    const { role, id } = req.user;

    // check that given fields are valid
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (startTime && (!validDate(startTime) || start < now)){
        return res.status(400).json({ message: "start date must be in ISO8601 format and not in the past" });
    }
    if (endTime && (!validDate(endTime) || end < now)){
        return res.status(400).json({ message: "end date must be in ISO8601 format and not in the past" });
    }
    if ((startTime && endTime) && (start > end)){  
        return res.status(400).json({ message: "start must not be after end" });
    }
    if (capacity !== undefined && capacity !== null && (capacity < 0 || !Number.isInteger(capacity))){
        return res.status(400).json({ message: "capacity must be a positive integer value" });
    }
    // if ((points || published) && role !== 'manager'){
    //     return res.status(403).json({ message: "Unauthorized" });
    // }
    if (points && (points < 0 || !Number.isInteger(points))){
        return res.status(400).json({ message: "points must be a positive integer value" });
    }
    if (published !== undefined && published !== null && typeof published !== 'boolean'){
        return res.status(400).json({ message: "published must be a boolean" });
    }

    // update the event
    const data = { name, description, location, startTime, endTime, capacity, points, published };
    const event = await eventService.updateEvent(parseInt(eventId), data, id, role);
    if (event.error){
        return res.status(event.status).json({ message: event.error });
    }

    return res.status(200).json(event);
}

async function deleteEvent(req, res){
    // get the event id
    const { eventId } = req.params;

    // check that the id is an integer
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }

    // delete the event
    const event = await eventService.deleteEvent(parseInt(eventId));
    if (event.error){
        return res.status(event.status).json({ message: event.error });
    }

    return res.status(204).json({ message: event.message });
}

async function addOrganizer(req, res){
    const { eventId } = req.params;
    const { utorid } = req.body;

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }
    if (!utorid){
        return res.status(400).json({ message: "Missing field" });
    }

    // add the organizer
    const organizer = await eventService.addOrganizer(parseInt(eventId), utorid);
    if (organizer.error){
        return res.status(organizer.status).json({ message: organizer.error });
    }

    return res.status(201).json(organizer);
}

async function removeOrganizer(req, res){
    const { eventId, userId } = req.params;

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId)) || !Number.isInteger(parseInt(userId))){
        return res.status(400).json({ message: "eventid and userid must be an integer" });
    }

    // remove the organizer
    const organizer = await eventService.removeOrganizer(parseInt(eventId), parseInt(userId));
    if (organizer.error){
        return res.status(organizer.status).json({ message: organizer.error });
    }

    return res.status(204).json({ message: organizer.message });
}

async function addGuest(req, res){
    const { eventId } = req.params;
    const { utorid } = req.body;
    const { role, id } = req.user

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }
    if (!utorid){
        return res.status(400).json({ message: "Missing field" });
    }

    // add the guest
    const guest = await eventService.addGuest(role, parseInt(eventId), utorid, id);
    if (guest.error){
        return res.status(guest.status).json({ message: guest.error });
    }

    return res.status(201).json(guest);
}

async function removeGuest(req, res){
    const { eventId, userId } = req.params;
    const { id: requesterId, role: requesterRole } = req.user;

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId)) || !Number.isInteger(parseInt(userId))){
        return res.status(400).json({ message: "eventid and userid must be an integer" });
    }

    // remove the guest, passing the requester's role
    const guest = await eventService.removeGuest(parseInt(eventId), parseInt(userId), requesterId, requesterRole);
    if (guest.error){
        return res.status(guest.status).json({ message: guest.error });
    }

    return res.status(204).json({ message: guest.message });
}

async function addCurrentUserAsGuest(req, res){
    const { eventId } = req.params;
    const { id } = req.user;

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }

    // add the guest
    const guest = await eventService.addCurrentUserAsGuest(parseInt(eventId), id);
    if (guest.error){
        return res.status(guest.status).json({ message: guest.error });
    }

    return res.status(201).json(guest);
}

async function removeCurrentUserAsGuest(req, res){
    const { eventId } = req.params;
    const { id } = req.user;

    // check that data is valid
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }

    // remove the guest
    const guest = await eventService.removeCurrentUserAsGuest(parseInt(eventId), id);
    if (guest.error){
        return res.status(guest.status).json({ message: guest.error });
    }

    return res.status(204).json({ message: guest.message });
}

async function createRewardTransaction(req, res){
    // check that all fields given are valid
    const validFields = ['type', 'utorid', 'amount'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that payload is valid
    const { eventId } = req.params;
    if (!Number.isInteger(parseInt(eventId))){
        return res.status(400).json({ message: "event id must be an integer" });
    }

    const { type, utorid, amount } = req.body;
    if (!type || type !== 'event' || !amount || isNaN(amount) || amount < 0 ){
        return res.status(400).json({ message: "Invalid type: only event" });
    }

    // create the transaction
    const { id: userId, utorid: userUtorid, role: userRole } = req.user;
    const transaction = await eventService.createRewardTransaction(type, parseInt(eventId), utorid, amount, userId, userUtorid, userRole);
    if (transaction.error){
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(201).json(transaction);

}

const eventController = {
    createEvent,
    retrieveEventsList,
    retrieveEvent,
    updateEvent,
    deleteEvent,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    addCurrentUserAsGuest,
    removeCurrentUserAsGuest,
    createRewardTransaction
};

module.exports = eventController;