const LEVELS = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];

const clearance = (required) => {
    return (req, res, next) => {
        console.log('User clearance index:', LEVELS.indexOf(req.user.role), 'Required index:', LEVELS.indexOf('cashier'));
        const { role } = req.user;
        const userClearance = LEVELS.indexOf(role);
        const requiredClearance = LEVELS.indexOf(required);

        if (userClearance < requiredClearance){
            return res.status(403).json({ message: "Requires higher clearance" });
        }

        next();
    }
}

module.exports = clearance;