const promotionService = require('../services/promotionService');
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

async function createPromotion(req, res){
    // check that only valid fields are passed
    const validFields = ['name', 'description', 'type', 'startTime', 'endTime', 'minSpending', 'rate', 'points'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all required fields are passed
    const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
    if (!name || !description || !type || !startTime || !endTime){
        return res.status(400).json({ message: "Missing field" });
    }

    // check that each the type of promotion is valid
    const validTypes = ['automatic', 'one-time'];
    if (!validTypes.includes(type)){
        return res.status(400).json({ message: "Invalid type: only automatic or one-time" });
    }

    // check dates are in IS8061 format
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

    // check that the minSpending, rate, and points are valid
    if (minSpending && minSpending < 0){
        return res.status(400).json({ message: "minSpending must be a positive numeric value" });
    }
    if (rate && rate < 0){
        return res.status(400).json({ message: "rate must be a positive numeric value" });
    }
    if (points && (points < 0 || !Number.isInteger(points))){
        return res.status(400).json({ message: "points must be a positive integer value" });
    }

    // create the promotion
    const data = { name, description, type, startTime, endTime, minSpending, rate, points };
    const promotion = await promotionService.createPromotion(data);
    return res.status(201).json(promotion);

}

async function retrievePromotionsList(req, res){
    // check that only valid fields are passed
    const validFields = ['name', 'type', 'page', 'limit', 'started', 'ended'];
    if (!validateFields(req.query, validFields)){
        return res.status(404).json({ message: "Invalid URL parameter" });
    }

    const { name, type, page, limit, started, ended } = req.query;
    const { id, role } = req.user;

    // only managers can access these
    if ((role === 'regular' || role === 'cashier') && (started || ended)){
        return res.status(403).json({ message: "Unauthorized" });
    }

    // check for valid queries
    const validTypes = ['automatic', 'one-time'];
    const validBools = ['true', 'false'];
    if (type && !validTypes.includes(type)){
        return res.status(400).json({ message: "Invalid type: only automatic or one-time" });
    }

    if (started && ended){ 
        return res.status(400).json({ message: "Started and ended cannot be used together and must be boolean" });
    }else if (started && !validBools.includes(started)){
        return res.status(400).json({ message: "Started must be a boolean" });
    }else if (ended && !validBools.includes(ended)){
        return res.status(400).json({ message: "Ended must be a boolean" });
    }
    if (page && isNaN(parseInt(page)) || page && page < 0 ){
        return res.status(400).json({ message: "invalid page param" });
    }
    if (limit && isNaN(parseInt(limit)) || limit && limit < 0 ){
        return res.status(400).json({ message: "invalid skip param" });
    }

    // get the promotions
    const filters = { name, type, page, limit, started, ended };
    const promotions = await promotionService.retrievePromotionsList(id, filters, role);

    return res.status(200).json(promotions);
}

async function retrieveSpecificPromotion(req, res){
    // get the promotion
    const { promotionId } = req.params;
    const { role } = req.user;

    if (isNaN(parseInt(promotionId))){
        return res.status(400).json({ message: "promotion id must be an int" });
    }

    const promotion = await promotionService.retrieveSpecificPromotion(promotionId, role);

    if (promotion.error){
        return res.status(promotion.status).json({ message: promotion.error });
    }

    return res.status(200).json(promotion);
}

async function updatePromotion(req, res){
    const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;

    // check that all fields given are valid
    const validFields = ['name', 'description', 'type', 'startTime', 'endTime', 'minSpending', 'rate', 'points'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that each field is given the correct type
    const validTypes = ['automatic', 'one-time'];    
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (type && !validTypes.includes(type)){
        return res.status(400).json({ message: "Invalid type: only automatic or one-time" });
    }
    if (startTime && (!validDate(startTime) || start < now)){
        return res.status(400).json({ message: "start date must be in ISO8601 format and not in the past" });
    }
    if (endTime && (!validDate(endTime) || end < now)){
        return res.status(400).json({ message: "end date must be in ISO8601 format and not in the past" });
    }
    if ((startTime && endTime) && (start > end)){  
        return res.status(400).json({ message: "start must not be after end" });
    }
    if (minSpending && minSpending < 0){
        return res.status(400).json({ message: "minSpending must be a positive numeric value" });
    }
    if (rate && rate < 0){
        return res.status(400).json({ message: "rate must be a positive numeric value" });
    }
    if (points && (points < 0 || !Number.isInteger(points))){
        return res.status(400).json({ message: "points must be a positive integer value" });
    }

    // update the promotion
    const { promotionId } = req.params;
    const data = { name, description, type, startTime, endTime, minSpending, rate, points };
    const promotion = await promotionService.updatePromotion(data, parseInt(promotionId));

    if (promotion.error){
        return res.status(promotion.status).json({ message: promotion.error });
    }

    return res.status(200).json(promotion);
}

async function deletePromotion(req, res){
    // get the promotion
    const { promotionId } = req.params;
    if (!promotionId){
        return res.status(400).json({ message: "promotion id is required" });
    }

    if (isNaN(parseInt(promotionId))){
        return res.status(400).json({ message: "promotion id must be an int" });
    }

    // delete the promotion
    const promotion = await promotionService.deletePromotion(parseInt(promotionId));
    if (promotion.error){
        return res.status(promotion.status).json({ message: promotion.error });
    }

    return res.status(promotion.status).json(promotion);
}

const promotionController = {
    createPromotion,
    retrievePromotionsList,
    retrieveSpecificPromotion,
    updatePromotion,
    deletePromotion
};

module.exports = promotionController;