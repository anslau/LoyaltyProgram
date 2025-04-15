const transactionService = require('../services/transactionService');
const { validateFields } = require('../utils/validate');

async function createPurchaseTransaction(req, res) {
    // check that only valid fields are passed
    const { utorid, type, spent, promotionIds, remark } = req.body;
    const data = { utorid, type, spent, promotionIds, remark };
    const validFields = ['utorid', 'type', 'spent', 'promotionIds', 'remark'];
    if (!validateFields(data, validFields)) {
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all required fields are passed
    if (!utorid || !type || !spent) {
        return res.status(400).json({ message: "Missing field" });
    }

    // check that type is purchase, spent is positive, and promotionIds is an array
    if (type !== 'purchase') {
        return res.status(400).json({ message: "Invalid type: only purchase" });
    }
    if (spent < 0) {
        return res.status(400).json({ message: "spent must be a positive numeric value" });
    }
    if (!Array.isArray(promotionIds)) {
        return res.status(400).json({ message: "promotionIds must be an array" });
    }

    // create the transaction
    const { utorid: cashierUtorid } = req.user;
    
    const transaction = await transactionService.createTransaction(data, cashierUtorid);

    if (transaction.error) {
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(201).json(transaction);
}

async function createAdjustmentTransaction(req, res) {
    const { utorid, type, amount, relatedId, promotionIds, remark } = req.body;
    const data = { utorid, type, amount, relatedId, promotionIds, remark };
    const validFields = ['utorid', 'type', 'amount', 'relatedId', 'promotionIds', 'remark'];
    if (!validateFields(data, validFields)) {
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all required fields are passed
    if (!utorid || !type || !amount || !relatedId) {
        return res.status(400).json({ message: "Missing field" });
    }

    // check that type is adjustment, spent is positive, and promotionIds is an array
    if (type !== 'adjustment') {
        return res.status(400).json({ message: "Invalid type: only adjustment" });
    }
    if (promotionIds && !Array.isArray(promotionIds)) {
        return res.status(400).json({ message: "promotionIds must be an array" });
    }

    // create the transaction
    const { utorid: requesterUtorid } = req.user;
    
    const transaction = await transactionService.createTransaction(data, requesterUtorid);

    if (transaction.error) {
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(201).json(transaction);
}

async function createTransaction(req, res) {
    const { type } = req.body;
    if (type === 'purchase') {
        return createPurchaseTransaction(req, res);

    }else if (type === 'adjustment') {
        // only managers and above can create adjustments
        const { role } = req.user;
        if (role === 'cashier') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        return createAdjustmentTransaction(req, res);

    }else{
        return res.status(400).json({ message: "Invalid transaction type" });
    }
}

async function retrieveTransactions(req, res) {
    // validate filters
    const validFilters = ['name', 'createdBy', 'suspicious', 'promotionId', 'type', 'relatedId', 'amount', 'operator', 'page', 'limit', 'orderBy', 'order'];
    if (!validateFields(req.query, validFilters)) {
        return res.status(400).json({ message: "Invalid filter" });
    }
    
    // get the filter parameters
    const { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit, orderBy, order } = req.query;

    // check that filters are valid
    if (suspicious && (suspicious !== 'true' && suspicious !== 'false')) {
        return res.status(400).json({ message: "Invalid suspicious value" });
    }

    // promotionId must be a number
    if (promotionId && isNaN(parseInt(promotionId))) {
        return res.status(400).json({ message: "Invalid promotion ID" });
    }

    // type must be valid
    const validTypes = ['purchase', 'adjustment', 'redemption', 'event', 'transfer'];
    if (type && !validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
    }

    // if relatedId is given, type must also be given
    if (relatedId && !type) {
        return res.status(400).json({ message: "type must be given if relatedId is given" });
    }

    // relatedId is a number
    if (relatedId && isNaN(parseInt(relatedId))) {
        return res.status(400).json({ message: "Invalid related ID" });
    }

    // if amount is given, operator must also be given
    if ((amount && !operator) || (!amount && operator)) {
        return res.status(400).json({ message: "operator must be given if amount is given" });
    }

    // operator must be gte or lte
    if (operator && operator !== 'gte' && operator !== 'lte') {
        return res.status(400).json({ message: "Invalid operator" });
    }

    // amount must be a number
    if (amount && isNaN(parseFloat(amount))) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    // page and limit must be numbers
    if (page && isNaN(parseInt(page)) || page && page < 0 ){
        return res.status(400).json({ message: "invalid page param" });
    }
    if (limit && isNaN(parseInt(limit)) || limit && limit < 0 ){
        return res.status(400).json({ message: "invalid skip param" });
    }

    // get the transactions
    const filters = { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit, orderBy, order };
    const transactions = await transactionService.retrieveTransactions(filters);
    
    return res.status(200).json(transactions);
}

async function retrieveSpecificTransaction(req, res) {
    const { transactionId } = req.params;
    if (isNaN(parseInt(transactionId))) {
        return res.status(404).json({ message: "Invalid transaction ID" });
    }

    const transaction = await transactionService.retrieveSpecificTransaction(parseInt(transactionId));

    if (transaction.error) {
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(200).json(transaction);
}

async function transactionSuspicious(req, res) {
    // check the transaction ID
    const { transactionId } = req.params;
    if (isNaN(parseInt(transactionId))) {
        return res.status(404).json({ message: "Invalid transaction ID" });
    }

    // check the payload is valid
    const { suspicious } = req.body;
    if (suspicious === undefined || typeof suspicious !== 'boolean' || !validateFields(req.body, ['suspicious'])) {
        return res.status(400).json({ message: "Invalid field " });
    }

    // update the transaction
    const transaction = await transactionService.transactionSuspicious(parseInt(transactionId), suspicious);
    if (transaction.error) {
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(200).json(transaction);
}

async function completeRedemption(req, res) {
    // check that only valid fields are passed
    const { processed } = req.body;
    if (processed === undefined || typeof processed !== 'boolean' || !validateFields(req.body, ['processed'])) {
        return res.status(400).json({ message: "Invalid field" });
    }else if (processed !== true){
        return res.status(400).json({ message: "processed must be set to true" });
    }

    // check the transaction ID
    const { transactionId } = req.params;
    if (isNaN(parseInt(transactionId))) {
        return res.status(404).json({ message: "Invalid transaction ID" });
    }

    // complete the redemption
    const { utorid: processedByUtorid, id: processedById } = req.user;
    const transaction = await transactionService.completeRedemption(parseInt(transactionId), processedByUtorid, processedById);
    if (transaction.error) {
        return res.status(transaction.status).json({ message: transaction.error });
    }

    return res.status(200).json(transaction);
}

const transactionController = {
    createTransaction,
    retrieveSpecificTransaction,
    transactionSuspicious,
    completeRedemption,
    retrieveTransactions
};

module.exports = transactionController;