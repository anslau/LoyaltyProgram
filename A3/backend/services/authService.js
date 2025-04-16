const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SECRET_KEY='s3cR3tK3y!@';
const requests = new Map();

const crypto = require('crypto');

async function tokens(utorid, password) {
    try {
    // find the user with the given utorid
        const user = await prisma.user.findUnique({
            where: {
                utorid
            }
        });

        // check if the user exists or if they provided the correct password
        if (!user) {
            return { error: 'utorid not found', status: 401 };
        }else if (!user.password){
            return { error: 'No password set', status: 401 };
        }else if (user.password !== password) {
            return { error: 'Incorrect password', status: 401 };
        } else {
            // generate a JWT token
            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '14d' });
            var cur = new Date();
            cur.setDate(cur.getDate() + 14);
            const tokenExpiry = cur.toISOString();

            // update the token and expiration in the database
            await prisma.user.update({
                where: {
                    utorid
                },
                data: {
                    token,
                    tokenExpiry,
                    lastLogin: new Date()
                }
            });

            return {
                token,
                expiresAt: tokenExpiry
            };
        }

    }catch (e){
        console.error(`error in tokens ${e.message}`);
        console.error(e.stack);
    }
}

function rateLimit(ip){
    // get the user ip and the current time they're making the request
    const now = Date.now();

    // check if the user has made more than one request in the last minute
    if (requests.has(ip)) {
        const lastRequest = requests.get(ip);
        const diff = now - lastRequest;

        // note the difference is in milliseconds
        if (diff < 60000) {
            return {error: 'Too many requests, wait 60s', status: 429};
        }
    }else{
        requests.set(ip, now);
    }

    return;
}

async function resets(utorid, ip){
    try {
        // find the user with the given utorid
        const user = await prisma.user.findUnique({
            where: {
                utorid
            }
        });

        // check if the user exists
        if (!user) {
            return { error: 'utorid not found', status: 404 };
        }

        // generate a reset token
        const resetToken = crypto.randomUUID();
        var cur = new Date();
        cur.setHours(cur.getHours() + 1);
        const resetTokenExpiry = cur.toISOString();

        // store the reset token and expiration in the database
        await prisma.user.update({
            where: {
                utorid
            },
            data: {
                resetToken,
                resetTokenExpiry: cur
            }
        });

        const rate = rateLimit(ip);
        if (rate !== undefined && rate.error){
            return {error: rate.error, status: rate.status};
        }

        return {
            expiresAt: resetTokenExpiry,
            resetToken: resetToken
        };

    }catch(e){
        console.error(`error in resets ${e.message}`);
        console.error(e.stack);
    }
}

async function resetToken(utorid, password, rToken) {
    try{
        // fetch the token using resetToken
        const resetToken = await prisma.user.findFirst({
            where: {
                resetToken: rToken
            },
            select: {
                utorid: true
            }
        });

        // check if the reset token exists
        if (!resetToken) {
            return { error: 'Reset token not found', status: 404 };
            
        }

        // check if the user associated with the reset token matches the given utorid
        if (resetToken.utorid !== utorid) {
            return { error: 'Reset token does not match utorid', status: 401 };
        }

        // fetch the user
        const user = await prisma.user.findUnique({
            where: {
                utorid
            },
            select: {
                resetToken: true,
                resetTokenExpiry: true
            }
        });

        // check if the user exists
        if (!user) {
            return { error: 'utorid not found', status: 404 };
        }

        // check the user's reset token and expiry
        if (!user.resetToken) {
            return { error: 'No reset token', status: 404 };
        } else if (user.resetToken !== rToken) {
            return { error: 'Reset token does not match', status: 401 };
        } else if (Date.now() > Date.parse(user.resetTokenExpiry)) {
            return { error: 'Reset token expired', status: 410 };
        }

        // update their password and remove the reset token
        await prisma.user.update({
            where: {
                utorid
            },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return { success: 'Password successfully reset' };

    }catch (e){
        console.error(`error in resetToken ${e.message}`);
        console.error(e.stack);
    }

}

const authService = {
    tokens,
    resets,
    resetToken
};

module.exports = authService;
