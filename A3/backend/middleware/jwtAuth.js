const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SECRET_KEY='s3cR3tK3y!@';

// from lecture
const jwtAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, async (err, data) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: data.userId
                }
            });

            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user = user;
            next();

        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
};

module.exports = jwtAuth;