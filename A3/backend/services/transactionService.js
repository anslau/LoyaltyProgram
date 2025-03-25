const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPurchaseTransaction(data, requesterUtorid) {
    try{
        const { utorid, type, spent, promotionIds, remark } = data;

        // get the customer
        const customer = await prisma.user.findUnique({
            where: {
                utorid
            },
            select: {
                id: true,
                points: true
            }
        });

        if (!customer) {
            return { error: "Customer not found", status: 404 };
        }

        // default rate
        let earned = Math.round(1 / 0.25 * spent);
        const validPromotionsIds = [];

        if (promotionIds && promotionIds.length > 0){
            // check that the promotions are valid
            for (const promotionId of promotionIds) {
                const promotion = await prisma.userPromotions.findUnique({
                    where: {
                        promotionId_userId: {
                            promotionId: promotionId,
                            userId: customer.id
                        }
                    },
                    select: {
                        used: true,
                        promotion: {
                            select: {
                                id: true,
                                startTime: true,
                                endTime: true,
                                minSpending: true
                            }
                        }
                    }
                });

                // check if the promotion exists, has been used, is applicable, and has not expired
                if (!promotion || promotion.used || promotion.promotion.startTime > new Date() || promotion.promotion.endTime < new Date()) {
                    return { error: "promotion does not exist, has been used, is not applicable yet, or has already expired", status: 400 };
                }

                // check if the spent amount is more than the minimum required
                if (promotion.promotion.minSpending && promotion.promotion.minSpending > spent) {
                    return { error: "Spent amount is less than the minimum required", status: 400 };
                }
            }
            
            // after checking all promotions are valid, we can now calculate the total points
            for (const promotionId of promotionIds) {
                const promotion = await prisma.userPromotions.findUnique({
                    where: {
                        promotionId_userId: {
                            promotionId: promotionId,
                            userId: customer.id
                        }
                    },
                    select: {
                        used: true,
                        promotion: {
                            select: {
                                id: true,
                                type: true,
                                rate: true,
                                points: true,
                            }
                        }
                    }
                });

                // check if the promotion has a rate, and if so, add it to the total rate
                if (promotion.promotion.rate) {
                    earned += Math.round(promotion.promotion.rate * (spent * 100));
                }

                // check if the promotion has points, and if so, add it to the customer's points
                if (promotion.promotion.points) {
                    earned += promotion.promotion.points;
                }

                // update the promotion to be used
                if (promotion.promotion.type === 'one-time') {
                    await prisma.userPromotions.update({
                        where: {
                            promotionId_userId: {
                                promotionId: promotionId,
                                userId: customer.id
                            }
                        },
                        data: {
                            used: true
                        }
                    });
                }

                // add the promotion to the list of valid promotions
                validPromotionsIds.push({ promotionId: promotionId });
            }
        }
        

        // create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                utorid,
                type,
                spent,
                amount: earned,
                remark: remark || "",
                createBy: requesterUtorid,
                customerId: customer.id,
                promotions: {
                    create: validPromotionsIds
                }
            }
        });

        // we only update user points if the cashier is not suspicious 
        const cashier = await prisma.user.findUnique({
            where: {
                utorid: requesterUtorid
            },
            select: {
                suspicious: true
            }
        });

        if (!cashier.suspicious) {
            // update the user points
            await prisma.user.update({
                where: {
                    utorid
                },
                data: {
                    points: customer.points + earned
                }
            });
        }else{
            // if the cashier is suspicious, mark the transaction as suspicious
            await prisma.transaction.update({
                where: {
                    id: transaction.id
                },
                data: {
                    suspicious: true
                }
            });
            earned = 0;
        }

        // return the transaction
        return {
            id: transaction.id,
            utorid,
            type,
            spent,
            earned,
            remark: remark || "",
            promotionIds: validPromotionsIds.map(promotion => promotion.promotionId),
            createdBy: requesterUtorid
        }

    }catch(e){
        console.error(`error in createPurchaseTransaction ${e.message}`);
        console.error(e.stack);
    }
}

async function createAdjustmentTransaction(data, requesterUtorid) {
    try{
        const { utorid, type, amount, relatedId, promotionIds, remark } = data;

        // get the customer
        const customer = await prisma.user.findUnique({
            where: {
                utorid
            },
            select: {
                id: true,
                points: true
            }
        });

        if (!customer) {
            return { error: "Customer not found", status: 404 };
        }

        // find the related transaction
        const relatedTransaction = await prisma.transaction.findUnique({
            where: {
                id: relatedId
            },
            select: {
                id: true,
                type: true,
                spent: true
            }
        });

        if (!relatedTransaction) {
            return { error: "Related transaction not found", status: 404 };
        }

        const validPromotionsIds = [];
        // check that promotions are valid
        if (promotionIds && promotionIds.length > 0){
            for (const promotionId of promotionIds) {
                const promotion = await prisma.userPromotions.findUnique({
                    where: {
                        promotionId_userId: {
                            promotionId: promotionId,
                            userId: customer.id
                        }
                    },
                    select: {
                        used: true,
                        promotion: {
                            select: {
                                id: true,
                                startTime: true,
                                endTime: true,
                                minSpending: true
                            }
                        }
                    }
                });

                // check if the promotion exists, has been used, is applicable, and has not expired
                if (!promotion || promotion.used || promotion.promotion.startTime > new Date() || promotion.promotion.endTime < new Date()) {
                    return { error: "promotion does not exist, has been used, is not applicable yet, or has already expired", status: 400 };
                }
            }

            // after checking all promotions are valid, mark one-time promotions as used
            for (const promotionId of promotionIds) {
                const promotion = await prisma.userPromotions.findUnique({
                    where: {
                        promotionId_userId: {
                            promotionId: promotionId,
                            userId: customer.id
                        }
                    },
                    select: {
                        used: true,
                        promotion: {
                            select: {
                                id: true,
                                type: true,
                                rate: true,
                                points: true,
                            }
                        }
                    }
                });

                // update the promotion to be used
                if (promotion.promotion.type === 'one-time') {
                    await prisma.userPromotions.update({
                        where: {
                            promotionId_userId: {
                                promotionId: promotionId,
                                userId: customer.id
                            }
                        },
                        data: {
                            used: true
                        }
                    });
                }

                // add the promotion to the list of valid promotions
                validPromotionsIds.push({ promotionId: promotionId });
            }
        }

        // create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                utorid,
                type,
                amount,
                relatedId,
                remark: remark || "",
                createBy: requesterUtorid,
                customerId: customer.id,
                relatedId: relatedId,
                promotions: {
                    create: validPromotionsIds
                }
            }
        });

        // update the user points
        await prisma.user.update({
            where: {
                utorid
            },
            data: {
                points: customer.points + amount
            }
        });

        // return the transaction
        return {
            id: transaction.id,
            utorid,
            amount,
            type,
            relatedId,
            remark: remark || "",
            promotionIds: validPromotionsIds.map(promotion => promotion.promotionId),
            createdBy: requesterUtorid
        }

    }catch(e){
        console.error(`error in createAdjustmentTransaction ${e.message}`);
        console.error(e.stack);
    }


}

async function createTransaction(data, requesterUtorid) {
    const { type } = data;

    if (type === 'purchase') {
        return createPurchaseTransaction(data, requesterUtorid);
    }else if (type === 'adjustment') {
        return createAdjustmentTransaction(data, requesterUtorid);
    }
}

async function retrieveTransactions(filters){
    try{
        const {name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit} = filters;

        // for pagination
        let pageNum = parseInt(page) || 1;
        let take = parseInt(limit) || 10;
        const skip = (pageNum - 1) * take;
        
        // handling which filters were applied
        const where = {};
        
        if (name) { // filter by name, can be user name or utorid
            where.user = {
                OR: [
                    { utorid: { contains: name} },
                    { name: { contains: name} }
                ]
            };
        }
        if (createdBy) {
            where.createBy = createdBy;
        }
        if (suspicious !== undefined) {
            where.suspicious = suspicious === 'true';
        }
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
                amount: true,
                type: true,
                spent: true,
                relatedId: true,
                promotions: {
                    select: {
                        promotionId: true
                    }
                },
                suspicious: true,
                remark: true,
                createBy: true,
                processedBy: true
            },
            take,
            skip,
            orderBy: {
                id: 'asc'
            }
        });

        const count = await prisma.transaction.count({
            where
        });

        // some formatting
        const transformedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            utorid: transaction.utorid,
            amount: transaction.amount,
            type: transaction.type,
            spent: transaction.type === 'purchase' ? transaction.spent : undefined,
            relatedId: transaction.type !== 'purchase' ? transaction.relatedId : undefined,
            promotionIds: transaction.promotions.map(promotion => promotion.promotionId),
            suspicious: transaction.type !== 'redemption' ? transaction.suspicious : undefined,
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
        console.error(`error in retrieveTransactions ${e.message}`);
        console.error(e.stack);
    }

}

async function retrieveSpecificTransaction(transactionId){
    try{
        // get the transaction
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            },
            select: {
                id: true,
                utorid: true,
                type: true,
                amount: true,
                spent: true,
                relatedId: true,
                remark: true,
                createBy: true,
                suspicious: true,
                promotions: {
                    select: {
                        promotionId: true
                    }
                }
            }
        });

        if (!transaction) {
            return { error: "Transaction not found", status: 404 };
        }

        // return different fields depending on type
        const type = transaction.type;
        const spent = type === 'purchase' ? {spent: transaction.spent }: {};
        const relatedId = type !== 'purchase' ? {relatedId: transaction.relatedId} : {};
        const suspicious = type !== 'redemption' ? {suspicious: transaction.suspicious} : {};

        return {
            id: transaction.id,
            utorid: transaction.utorid,
            type: transaction.type,
            ...spent,
            amount: transaction.amount,
            ...relatedId,
            promotionIds: transaction.promotions.map(promotion => promotion.promotionId),
            ...suspicious,
            remark: transaction.remark,
            createdBy: transaction.createBy
        }

    }catch(e){
        console.error(`error in retrieveSpecificTransaction ${e.message}`);
        console.error(e.stack);
    }
    
    

}

async function transactionSuspicious(transactionId, suspicious){
    try{
        // get the transaction
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            },
            select: {
                id: true,
                utorid: true,
                type: true,
                amount: true,
                suspicious: true,
            }
        });

        if (!transaction) {
            return { error: "Transaction not found", status: 404 };
        }

        // get the user related to the transaction
        const user = await prisma.user.findUnique({
            where: {
                utorid: transaction.utorid
            },
            select: {
                points: true
            }
        });

        // check we're not changing the flag to the same value
        if (suspicious && !transaction.suspicious){
            // if we're changing the flag from not suspicious to suspicious, deduct the amount
            await prisma.user.update({
                where: {
                    utorid: transaction.utorid
                },
                data: {
                    points: user.points - transaction.amount
                }
            });
        }else if (!suspicious && transaction.suspicious){
            // if we're changing the flag from suspicious to not suspicious, add the amount
            await prisma.user.update({
                where: {
                    utorid: transaction.utorid
                },
                data: {
                    points: user.points + transaction.amount
                }
            });
        }

        // update the transaction
        const updatedTransaction = await prisma.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                suspicious
            },
            select: {
                id: true,
                utorid: true,
                type: true,
                spent: true,
                relatedId: true,
                amount: true,
                promotions: {
                    select: {
                        promotionId: true
                    }
                },
                suspicious: true,
                remark: true,
                createBy: true
            }
        });

        // const spent = updatedTransaction.type === 'purchase' ? {spent: updatedTransaction.spent }: {};
        // const relatedId = updatedTransaction.type !== 'purchase' ? {relatedId: updatedTransaction.relatedId} : {};

        return {
            id: updatedTransaction.id,
            utorid: updatedTransaction.utorid,
            type: updatedTransaction.type,
            // ...spent,
            spent: updatedTransaction.spent,
            amount: updatedTransaction.amount,
            // ...relatedId,
            relatedId: updatedTransaction.relatedId,
            promotionIds: updatedTransaction.promotions.map(promotion => promotion.promotionId),
            suspicious: updatedTransaction.suspicious,
            remark: updatedTransaction.remark,
            createdBy: updatedTransaction.createBy
        }

    }catch(e){
        console.error(`error in transactionSuspicious ${e.message}`);
        console.error(e.stack);
    }


}

async function completeRedemption(transactionId, processedByUtorid, processedById){
    try{
        // find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            },
            select: {
                id: true,
                utorid: true,
                type: true,
                amount: true,
                processedBy: true
            }
        });

        if (!transaction) {
            return { error: "Transaction not found", status: 404 };
        }

        // check if the transaction is not a redemption and if it's already processed
        if (transaction.type !== 'redemption') {
            return { error: "Transaction is not a redemption", status: 400 };
        }
        if (transaction.processedBy) {
            return { error: "Transaction is already processed", status: 400 };
        }

        // update the transaction
        const [updatedTransaction, updatedUser] = await prisma.$transaction([
            // set the processedBy field
            prisma.transaction.update({
                where: {
                    id: transactionId
                },
                data: {
                    processedBy: processedByUtorid,
                    relatedId: processedById
                },
                select: {
                    id: true,
                    utorid: true,
                    type: true,
                    amount: true,
                    processedBy: true,
                    remark: true,
                    createBy: true
                }
            }),

            // update the user points
            prisma.user.update({
                where: {
                    utorid: transaction.utorid
                },
                data: {
                    points: {
                        decrement: transaction.amount
                    }
                }
            })
        ]);

        return {
            id: updatedTransaction.id,
            utorid: updatedTransaction.utorid,
            type: updatedTransaction.type,
            processedBy: updatedTransaction.processedBy,
            redeemed: updatedTransaction.amount,
            remark: updatedTransaction.remark,
            createdBy: updatedTransaction.createBy
        }

    }catch(e){
        console.error(`error in completeRedemption ${e.message}`);
        console.error(e.stack);
    }

}

const transactionService = {
    createTransaction,
    retrieveSpecificTransaction,
    transactionSuspicious,
    completeRedemption,
    retrieveTransactions
};

module.exports = transactionService;