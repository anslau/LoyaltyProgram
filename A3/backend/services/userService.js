const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crypto = require('crypto');
const authService = require('./authService');

async function registerNewUser(utorid, name, email){
    try{
        // check if the user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { utorid },
                    { email }
                ]
            }
        });

        // check if the user already exists
        if (existingUser){
            return { error: 'user with given utorid or email already exists', status: 409 };
        }

        // generate the reset token and its 7day expiry
        const resetToken = crypto.randomUUID();
        var cur = new Date();
        cur.setDate(cur.getDate() + 7);
        const resetTokenExpiry = cur.toISOString();

        // store new info in the database
        const user = await prisma.user.create({
            data: {
                utorid,
                name,
                email,
                resetToken,
                resetTokenExpiry
            }
        });

        return {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            verified: user.verified,
            expiresAt: user.resetTokenExpiry,
            resetToken: user.resetToken
        };

    }catch(e){
        console.error(`error in registerNewUser ${e.message}`);
        console.error(e.stack);
    }

}

async function retrieveUsersList(name, role, verified, activated, page, limit) {
    try{
        // for pagination
        let pageNum = parseInt(page) || 1;
        let take = parseInt(limit) || 10;
        const skip = (pageNum - 1) * take;

        // check if the name exists. if it does, see whether it matches the name or utorid
        const nameFilter = name
            ? {
                OR: [
                    { name: { contains: name } },
                    { utorid: { contains: name } }
                ]
            }
            : {};

        // check if the role, verified, and activated exist
        const roleFilter = role ? { role: role } : {};
        const verifiedFilter = verified ? { verified: verified === 'true' } : {};

        // if activated is true, then the lastLogin must not be null
        const activatedFilter = activated ? { lastLogin: activated === 'true' ? {not: null} : null } : {};

        // search for users
        const users = await prisma.user.findMany({
            where: {
                ...nameFilter,
                ...roleFilter,
                ...verifiedFilter,
                ...activatedFilter
            },
            skip,
            take,
            orderBy: {
                id: 'asc'
            }
        });

        // for the total count
        const total = await prisma.user.count({
            where: {
                ...nameFilter,
                ...roleFilter,
                ...verifiedFilter,
                ...activatedFilter
            }
        });

        return {
            count: total,
            results: users
        }

    }catch(e){
        console.error(`error in retrieveUsersList ${e.message}`);
        console.error(e.stack);
    }

}

async function retrieveSpecificUser(id, clearance){
    try{
        // cashiers have less priveleges
        const email = clearance === 'cashier' ? {} : { email: true };
        const birthday = clearance === 'cashier' ? {} : { birthday: true };
        const role = clearance === 'cashier' ? {} : { role: true };
        const createdAt = clearance === 'cashier' ? {} : { createdAt : true };
        const lastLogin = clearance === 'cashier' ? {} : { lastLogin: true };
        const avatarUrl = clearance === 'cashier' ? {} : { avatarUrl: true };


        // get the user with the given id
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                utorid: true,
                name: true,
                ...email,
                ...birthday,
                ...role,
                points: true,
                ...createdAt,
                ...lastLogin,
                verified: true,
                ...avatarUrl,
                promotions: {
                    where: {
                        used: false
                    },
                    select: {
                        promotion: {
                            select: {
                                id: true,
                                name: true,
                                minSpending: true,
                                rate: true,
                                points: true
                            }
                        }
                    }
                }
            }
        });

        // if the user does not exist
        if (!user){
            return { error: 'user not found with given id', status: 404 };
        }

        // formatting the dates to be strings and flattening promotions
        if (clearance !== 'cashier'){
            user.createdAt = user.createdAt.toISOString();
            if (user.lastLogin){
                user.lastLogin = user.lastLogin.toISOString();
            }
        }
        user.promotions = user.promotions.map(promo => promo.promotion);

        return user;

    }catch(e){
        console.error(`error in retrieveSpecificUser ${e.message}`);
        console.error(e.stack);
    }


}

async function updateSpecificUserInfo(id, data){
    try{
        // check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select:{
                id: true,
                utorid: true,
                name: true
            }
        });

        // check if the user exists
        if (!user){
            return { error: 'user not found with given id', status: 404 };
        }    
        
        // check what update data has been given
        const update = {};
        if (data.email){
            update.email = data.email;
        }
        if (data.verified){
            // always set to true
            update.verified = true;
        }
        if (data.suspicious){
            update.suspicious = data.suspicious;
        }
        if (data.role){
            update.role = data.role;

            // if the role is being changed to cashier, then suspicious should be false
            if (data.role === 'cashier'){
                update.suspicious = false;
            }
        }

        // update the user
        await prisma.user.update({
            where: {
                id
            },
            data: update
        });

        // return the user
        return {...user, ...update};

    }catch(e){
        console.error(`error in updateSpecificUserInfo ${e.message}`);
        console.error(e.stack);
    }

    
}

async function updateUserInfo(utorid, name, email, birthday, avatar){
    try{
        // check that if an email was passed, it is not already in use
        if (email){
            const existingEmail = await prisma.user.findUnique({
                where: {
                    email
                }
            });

            if (existingEmail){
                return { error: 'email already in use', status: 409 };
            }
        }

        // check if new info was added
        const updatedEmail = email ? { email } : {};
        const updatedName = name ? { name } : {};
        const updatedBirthday = birthday ? { birthday } : {};
        const updatedAvatar = avatar ? { avatarUrl: avatar } : {};
        const updatedLogin = new Date();

        await prisma.user.update({
            where: {
                utorid
            },
            data: {
                ...updatedName,
                ...updatedEmail,
                ...updatedBirthday,
                lastLogin: updatedLogin,            
                ...updatedAvatar

            }
        });

        const user = await prisma.user.findUnique({
            where: {
                utorid
            },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
            }
        });

        return {...user, createdAt: user.createdAt.toISOString(), lastLogin: user.lastLogin.toISOString()}

    }catch(e){
        console.error(`error in updateUserInfo ${e.message}`);
        console.error(e.stack);
    }


}

async function retrieveUserInfo(utorid){
    try{
        // find the given user
        // user should be logged in so no need to check if utorid exists
        const user = await prisma.user.findUnique({
            where: {
                utorid
            },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                promotions: {
                    select: {
                        promotion: {
                            select: {
                                id: true,
                                name: true,
                                minSpending: true,
                                rate: true,
                                points: true
                            }
                        }
                    }
                }
            }
        });

        // flatten the promotions list
        user.promotions = user.promotions.map(promo => promo.promotion);

        return {...user, createdAt: user.createdAt.toISOString(), lastLogin: user.lastLogin.toISOString()}

    }catch(e){
        console.error(`error in retrieveUserInfo ${e.message}`);
        console.error(e.stack);
    }

}

async function updateUserPassword(utorid, oldPassword, newPassword){
    try{
        // check if the old password is correct
        // user is logged in so their login info is unique
        const user = await prisma.user.findUnique({
            where: {
                utorid,
                password: oldPassword
            }
        });

        if (!user){
            return { error: 'Provided password does not match the password on account', status: 403 };
        }

        // update the password
        await prisma.user.update({
            where: {
                utorid
            },
            data: {
                password: newPassword
            }
        });

        return { message: 'Password updated', status: 200 };

    }catch(e){
        console.error(`error in updateUserPassword ${e.message}`);
        console.error(e.stack);
    }


}

async function transferTransaction(senderId, recipientId, amount, type, remark){
    try{
        // get the logged in user's info
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId
            },
            select: {
                utorid: true,
                points: true,
                verified: true
            }
        });

        // if the sender does not have enough points or is not verified
        if (sender.points < amount){
            return { error: 'Insufficient points', status: 400 };
        }
        if (!sender.verified){
            return { error: 'User is not verified', status: 403 };
        }

        // get the recipient's info
        const recipient = await prisma.user.findUnique({
            where: {
                id: recipientId
            },
            select: {
                utorid: true,
                points: true,
            }
        });

        if (!recipient){
            return { error: 'Recipient not found', status: 404 };
        }

        // process the transaction
        const [ senderUpdate, recipientUpdate ] = await prisma.$transaction([
            // create the transaction for the sender
            prisma.transaction.create({
                data: {
                    utorid: sender.utorid,
                    type,
                    amount,
                    relatedId: recipientId,
                    remark,
                    customerId: senderId,
                    createBy: sender.utorid
                }
            }),

            // create the transaction for the recipient
            prisma.transaction.create({
                data: {
                    utorid: recipient.utorid,
                    type,
                    amount,
                    relatedId: senderId,
                    remark,
                    customerId: recipientId,
                    createBy: sender.utorid
                }
            }),

            // update the sender's points
            prisma.user.update({
                where: {
                    id: senderId
                },
                data: {
                    points: {
                        decrement: amount
                    }
                }
            }),

            // update the recipient's points
            prisma.user.update({
                where: {
                    id: recipientId
                },
                data: {
                    points: {
                        increment: amount
                    }
                }
            })
        ]);

        // return the updated transaction
        return {
            id: senderUpdate.id,
            sender: senderUpdate.utorid,
            recipient: recipientUpdate.utorid,
            type,
            sent: amount,
            remark: senderUpdate.remark,
            createdBy: sender.utorid
        }

    }catch(e){
        console.error(`error in transferTransaction ${e.message}`);
        console.error(e.stack);
    }


}

async function createRedemption(userId, type, amount, remark){
    try{
        // find the user
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                utorid: true,
                points: true,
                verified: true
            }
        });

        // check if they have enough points
        if (amount && (user.points < amount)){
            return { error: 'Insufficient points', status: 400 };
        }

        // check if they're verified
        if (!user.verified){
            return { error: 'User is not verified', status: 403 };
        }

        // create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                utorid: user.utorid,
                type,
                amount: amount || 0,
                remark,
                customerId: userId,
                createBy: user.utorid
            },
            select: {
                id: true,
                type: true,
                amount: true,
                remark: true,
                processedBy: true,
            }
        });

        return {
            id: transaction.id,
            utorid: user.utorid,
            type: transaction.type,
            processedBy: transaction.processedBy,
            amount: transaction.amount,
            remark: transaction.remark,
            createdBy: user.utorid
        };

    }catch(e){
        console.error(`error in createRedemption ${e.message}`);
        console.error(e.stack);
    }


}

async function retrieveOwnTransactions(filters, userId){
    try{
        // get the filters
        const { type, relatedId, promotionId, amount, operator, page, limit } = filters;

        // for pagination
        let pageNum = parseInt(page) || 1;
        let take = parseInt(limit) || 10;
        const skip = (pageNum - 1) * take;

        // filtering
        const where = {customerId: userId};

        if (promotionId) { // filtering by a specific promotion
            where.promotions = {
                some: {
                    promotionId: parseInt(promotionId)
                }
            };
        }
        if (type) {
            where.type = type;
        }
        if (relatedId) {
            where.relatedId = parseInt(relatedId);
        }
        if (amount && operator){
            if (operator === 'gte'){
                where.amount = {
                    gte: parseInt(amount)
                };
            }else{
                where.amount = {
                    lte: parseInt(amount)
                };
            }
        }

        // get the transactions
        const transactions = await prisma.transaction.findMany({
            where,
            select: {
                id: true,
                utorid: true,
                spent: true,
                type: true,
                amount: true,
                promotions: {
                    select: {
                        promotionId: true
                    }
                },
                relatedId: true,
                remark: true,
                createBy: true,
                processedBy: true
            },
            skip,
            take,
            orderBy: {
                id: 'asc'
            }
        });

        // for the total count
        const count = await prisma.transaction.count({
            where
        });

            // some formatting
        const transformedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            utorid: transaction.utorid,        
            spent: transaction.type === 'purchase' ? transaction.spent : undefined,
            amount: transaction.amount,
            type: transaction.type,
            relatedId: transaction.type !== 'purchase' ? transaction.relatedId : undefined,
            promotionIds: transaction.promotions.map(promotion => promotion.promotionId),
            redeemed: transaction.type === 'redemption' ? transaction.amount : undefined,
            remark: transaction.remark,
            createdBy: transaction.createBy,
            processedBy: transaction.type === 'redemption' ? transaction.processedBy : undefined
        }));

        return {
            count,
            results: transformedTransactions
        }

    }catch(e){
        console.error(`error in retrieveOwnTransactions ${e.message}`);
        console.error(e.stack);
    }


}

const userService = {
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

module.exports = userService;
