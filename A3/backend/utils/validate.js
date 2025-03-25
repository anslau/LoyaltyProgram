// check that only allowed fields are passed
function validateFields(fields, validFields){
    for (const field in fields){
        if (!validFields.includes(field)){
            return false;
        }
    }
    return true;
}

module.exports = {
    validateFields
};