const authService = require('../services/authService');
const { validateFields } = require('../utils/validate');

async function tokens(req, res){
    // check that only allowed fields are passed
    const validFields = ['utorid', 'password'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    // check that both fields are filled
    const { utorid, password } = req.body;
    if (!utorid || !password || utorid === "" || password === "") {
        return res.status(400).json({ message: "utorid and password required to log in" });
    }

    // try to authenticate the user and generate the token
    const token = await authService.tokens(utorid, password);
    if (token.error){
        return res.status(token.status).json({ message: token.error });
    }
    
    // return the token and expiration date
    return res.status(200).json(token);
}

async function resets(req, res){  
    // check that the field is filled
    const { utorid, password } = req.body;
    if (!utorid) {
        return res.status(400).json({ message: "Invalid utorid" });
    }

    // if password is filled then this meant to go to resetToken
    // but if this endpoint is called then no reset token was provided
    if (password){ 
        return res.status(404).json({ message: "No reset token" });
    }

    // try to generate the reset token
    const { ip } = req;
    const resetToken = await authService.resets(utorid, ip);
    if (resetToken.error){
        return res.status(resetToken.status).json({ message: resetToken.error });
    }

    return res.status(202).json(resetToken);

}

async function resetToken(req, res){
    // check that only allowed fields are passed
    const validFields = ['utorid', 'password'];
    if (!validateFields(req.body, validFields)){
        return res.status(400).json({ message: "Invalid field" });
    }

    const { utorid, password } = req.body;
    const { resetToken } = req.params;

    // check that the reset token exists
    if (!resetToken) {
        return res.status(404).json({ message: "Reset token not found" });
    }

    // // check that both fields are filled
    if (!utorid || !password) {
        return res.status(400).json({ message: "Invalid utorid or password" });
    }

    // check that the password is valid
    // at least one uppercase letter (?=.*[A-Z])
    // at least one lowercase letter (?=.*[a-z])
    // at least one digit (?=.*\d)
    // at least one special character (?=.*[\W])

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W])[A-Za-z\d\W]{8,20}$/;
    if (!passwordRegex.test(password)){
        return res.status(400).json({ message: "Password must be 8-20 characters long with 1 upper, 1 lower, 1 digit, and 1 symbol" });
    }

    // try to reset the password
    const reset = await authService.resetToken(utorid, password, resetToken);
    if (reset.error){
        return res.status(reset.status).json({ message: reset.error });
    }

    return res.status(200).json({ message: reset.success });
}

const authController = {
    tokens,
    resets,
    resetToken
};

module.exports = authController;