const LEVELS = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];

const clearance = (required) => {
    return (req, res, next) => {
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