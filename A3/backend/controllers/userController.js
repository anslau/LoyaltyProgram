const userService = require('../services/userService');
const { validateFields, validateClearance } = require('../utils/validate');

async function registerNewUser(req, res){
    // check that only valid fields are passed
    const validFields = ['utorid', 'name', 'email'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    const { utorid, name, email} = req.body;

    // check that utorid is alphanumeric and 8 characters long
    // name must be 1-50 characters long
    // email must have . between the first and last name and end in @mail.utoronto.ca
    const utoridRegex = /^[a-zA-Z0-9]{8}$/;
    const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;

    if (!utorid || utorid === '' || !name || name === '' || !email || email === ''){
        return res.status(400).json({ message: "utorid, name, or email is missing" });
    }else if (!utoridRegex.test(utorid)){
        return res.status(400).json({ message: "utorid must be alphanumeric and 8 characters long" });
    }else if (!nameRegex.test(name)){
        return res.status(400).json({ message: "name must be 1-50 characters" });
    }else if (!emailRegex.test(email)){
        return res.status(400).json({ message: "email must be in the format [first].[last]@mail.utoronto.ca" });
    }else{
        // create the new user and return
        const newUser = await userService.registerNewUser(utorid, name, email);
        if (newUser.error){
            return res.status(newUser.status).json({ message: newUser.error });
        }

        return res.status(201).json(newUser);
        
    }
}

async function retrieveUsersList(req, res){
    // check that only valid filters are passed
    const validFields = ['name', 'role', 'verified', 'activated', 'page', 'limit', 'orderBy', 'order'];
    if (!validateFields(req.query, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // get the filters and pagination info
    const { name, role, verified, activated, page, limit, orderBy, order } = req.query;

    // validate the filters
    const validRoles = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];
    const validBools = ['true', 'false'];
    if (role && !validRoles.includes(role)){
        return res.status(400).json({ message: "invalid role param" });
    }
    if (verified && !validBools.includes(verified)){
        return res.status(400).json({ message: "invalid verified param" });
    }
    if (activated && !validBools.includes(activated)){
        return res.status(400).json({ message: "invalid activated param" });
    }
    if (page && isNaN(parseInt(page)) || page && page < 0 ){
        return res.status(400).json({ message: "invalid page param" });
    }
    if (limit && isNaN(parseInt(limit)) || limit && limit < 0 ){
        return res.status(400).json({ message: "invalid skip param" });
    }

    // retrieve the users
    const filters = { name, role, verified, activated, page, limit, orderBy, order };
    const users = await userService.retrieveUsersList(filters);
    if (users.error){
        return res.status(users.status).json({ message: users.error });
    }

    return res.status(200).json(users);
}

async function retrieveSpecificUser(req, res){
    // get the user id and check that it's valid
    const { userId } = req.params;

    if (isNaN(parseInt(userId))){
        return res.status(400).json({ message: "Invalid id" });
    }

    // retrieve the user info
    // different data depending on the user clearance
    const user = await userService.retrieveSpecificUser(parseInt(userId), req.user.role);
    if (user.error){
        return res.status(user.status).json({ message: user.error });
    }

    return res.status(200).json(user);
}

async function updateSpecificUserInfo(req, res){
    // check that only valid fields are passed
    const validFields = ['email', 'verified', 'suspicious', 'role'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that body is not empty
    if (Object.keys(req.body).length === 0){
        return res.status(400).json({ message: "No fields to update" });
    }

    // get the user information
    const { userId } = req.params;
    const { email, verified, suspicious, role } = req.body;

    // check the user has clearance to change the role
    const managerRoles = ['regular', 'cashier']
    const allRoles = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];
    const { role: userRole } = req.user;
    if (role){
        if (!allRoles.includes(role)){
            return res.status(400).json({ message: "Invalid role" });
        }else if (userRole === 'manager' && !managerRoles.includes(role)){
            return res.status(403).json({ message: "You do not have clearance to change the role" });
        }
    }

    // // check that fields are not all empty
    if ((email && email === '') && (verified && verified === '') && (suspicious && suspicious === '') && (role && role === '')){
        return res.status(400).json({ message: "fields cannot all be empty" });
    }

    // check that the input fields are valid
    const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;
    if (email && !emailRegex.test(email)){
        return res.status(400).json({ message: "email must be in the format [first].[last]@mail.utoronto.ca" });
    }
    if (verified !== undefined && verified !== null && (verified !== true)){
        return res.status(400).json({ message: "verified must be true" });
    }
    if (suspicious !== undefined && suspicious !== null && (typeof suspicious !== 'boolean')){
        return res.status(400).json({ message: "suspicious must be a boolean" });
    }

    // update the user info
    const updatedUser = await userService.updateSpecificUserInfo(parseInt(userId), { email, verified, suspicious, role });
    if (updatedUser.error){
        return res.status(updatedUser.status).json({ message: updatedUser.error });
    }

    return res.status(200).json(updatedUser);
}

function validDate(date){
    // get the year, month, and day from the date string
    const [year, month, day] = date.split('-').map(num => parseInt(num));
    const checkDate = new Date(year, month - 1, day);

    // check that the date is valid
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)){
        return false;
    }else{
        const valid = checkDate.getFullYear() === year && checkDate.getMonth() === month - 1 && checkDate.getDate() === day;
        return valid;
    }
}

async function updateUserInfo(req, res){
    // check that only valid fields are passed
    const validFields = ['name', 'email', 'birthday', 'avatar'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // name must be 1-50 characters long
    const nameRegex = /^[a-zA-Z ]{1,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;
    
    // check for valid inputs
    const { name, email, birthday, avatar } = req.body;
    const date = new Date(birthday);

    if (!name && !email && !birthday && !avatar){
        return res.status(400).json({ message: "No fields to update" });
    }

    if ((name && name === '') && (email && email === '') && (birthday && birthday === '')){
        return res.status(400).json({ message: "fields cannot all be empty" });
    }

    if (name && !nameRegex.test(name)){
        return res.status(400).json({ message: "name must be 1-50 characters" });
    }
    if (email && !emailRegex.test(email)){
        return res.status(400).json({ message: "email must be in the format [first].[last]@mail.utoronto.ca" });
    }
    if (birthday && !validDate(birthday)){
        return res.status(400).json({ message: "birthday must be in the format YYYY-MM-DD and valid" });
    }

    // update the user info
    const updatedUser = await userService.updateUserInfo(req.user.utorid, name, email, birthday, avatar);
    if (updatedUser.error){
        return res.status(updatedUser.status).json({ message: updatedUser.error });
    }

    // return the updated user
    return res.status(200).json(updatedUser);

}

async function retrieveUserInfo(req, res) {
    // retrieve the user info
    const { utorid } = req.user;
    const user = await userService.retrieveUserInfo(utorid);

    // return the user
    return res.status(200).json(user);
}

async function updateUserPassword(req, res){
    // check that only valid fields are passed
    const validFields = ['old', 'new'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all fields were filled
    const { old: oldPassword, new : newPassword} = req.body;
    if (!oldPassword || !newPassword){
        return res.status(400).json({ message: "Old or new password is missing" });
    }
    if (oldPassword === newPassword){
        return res.status(400).json({ message: "Old and new password cannot be the same" });
    }

    // check that the new password is btw 8-20 chars, 1 upper, 1 lower, 1 number, 1 symbol
    // TODO: uncomment this code block
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W])[A-Za-z\d\W]{8,20}$/;
    if (!passwordRegex.test(newPassword)){
        return res.status(400).json({ message: "Include 8–20 characters with upper, lower, number & symbol" });
    }

    // try to update the password
    const { utorid } = req.user;
    const updatedPassword = await userService.updateUserPassword(utorid, oldPassword, newPassword);
    if (updatedPassword.error){
        return res.status(updatedPassword.status).json({ message: updatedPassword.error });
    }

    return res.status(200).json({ message: "Password updated successfully" });
}

async function transferTransaction(req, res){
    // check that the userId is valid
    const { userId: recipientId } = req.params;
    if (isNaN(parseInt(recipientId))){
        return res.status(400).json({ message: "Invalid id" });
    }

    // check that only valid fields are passed
    const validFields = ['type', 'amount', 'remark'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all required fields were filled
    const { type, amount, remark } = req.body;
    if (!type || !amount){
        return res.status(400).json({ message: "recipient or amount is missing" });
    }

    // check that the type and amount are valid
    if (type !== 'transfer'){
        return res.status(400).json({ message: "Invalid type: only transfer" });
    }
    if (amount < 0){
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    // try to transfer the amount
    const { id: senderId } = req.user;
    const transfer = await userService.transferTransaction(senderId, parseInt(recipientId), amount, type, remark);
    if (transfer.error){
        return res.status(transfer.status).json({ message: transfer.error });
    }

    return res.status(201).json(transfer);
}

async function createRedemption(req, res){
    // check that only valid fields are passed
    const validFields = ['type', 'amount', 'remark'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that all required fields were filled
    const { type, amount, remark } = req.body;
    if (!type || type !== 'redemption'){
        return res.status(400).json({ message: "invalid type" });
    }
    if (amount && amount < 0){
        return res.status(400).json({ message: "amount must be a positive number" });
    }

    // try to create the redemption
    const { id: userId } = req.user;
    const redemption = await userService.createRedemption(userId, type, amount, remark);
    if (redemption.error){
        return res.status(redemption.status).json({ message: redemption.error });
    }

    return res.status(201).json(redemption);
}

async function retrieveOwnTransactions(req, res){
    // validate filters
    const validFilters = ['type', 'relatedId', 'promotionId', 'amount', 'operator', 'page', 'limit', 'orderBy', 'order'];
    if (!validateFields(req.query, validFilters)) {
        return res.status(400).json({ message: "Invalid filter" });
    }
    
    // get the filter parameters
    const { type, relatedId, promotionId, amount, operator, page, limit, orderBy, order } = req.query;

    // check that filters are valid
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
    const filters = { type, relatedId, promotionId, amount, operator, page, limit, orderBy, order };
    const { id } = req.user;
    const transactions = await userService.retrieveOwnTransactions(filters, id);
    
    return res.status(200).json(transactions);
}

const userController = {
    registerNewUser,
    retrieveUsersList,
    retrieveSpecificUser,
    updateSpecificUserInfo,
    updateUserInfo,
    retrieveUserInfo,
    updateUserPassword,
    transferTransaction,
    createRedemption,
    retrieveOwnTransactions
};

module.exports = userController;