const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPromotion(promotion) {
    try {
        // get the promotion info and handle optional fields
        const { name, description, type, startTime, endTime } = promotion;
        const minSpending = promotion.minSpending ? { minSpending: promotion.minSpending } : {};
        const rate = promotion.rate ? { rate: promotion.rate } : {};
        const points = promotion.points ? { points: promotion.points } : {};

        // create the promotion
        const newPromotion = await prisma.promotion.create({
            data: {
                name,
                description,
                type,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                ...minSpending,
                ...rate,
                ...points
            }
        });

        // assign the promotion to all users
        const users = await prisma.user.findMany();
        const userPromotions = users.map(user => ({
            userId: user.id,
            promotionId: newPromotion.id,
            used: false
        }));

        // make sure to update the userPromotions table
        await prisma.userPromotions.createMany({
            data: userPromotions
        });

        return newPromotion;

    } catch (e) {
        console.error(`error in createPromotion ${e.message}`);
        console.error(e.stack);
    }

}

async function retrievePromotionsList(id, filters, role) {
    try {
        const where = {};

        // for pagination
        let pageNum = parseInt(filters.page) || 1;
        let take = parseInt(filters.limit) || 10;
        const skip = (pageNum - 1) * take;

        // if the user is regular, show only available promotions
        if (role === 'regular' || role === 'cashier') {
            // has started but has not ended
            const now = new Date();
            where.startTime = { lte: now };
            where.endTime = { gt: now };

            // not used
            where.users = {
                some: {
                    userId: id,
                    used: false
                }
            };
        }

        // handle optional filters
        if (filters.name) {
            where.name = {
                contains: filters.name
            };
        }
        if (filters.type) {
            where.type = filters.type;
        }

        // only managers will have these filters. one or the other
        if (filters.started !== undefined) {
            where.startTime = filters.started === 'true' ? { lte: new Date() } : { gt: new Date() };
        } else if (filters.ended !== undefined) {
            where.endTime = filters.ended === 'true' ? { lte: new Date() } : { gt: new Date() };
        }

        // get the promotions
        const promotions = await prisma.promotion.findMany({
            where,
            select: {
                id: true,
                name: true,
                type: true,
                startTime: true,
                endTime: true,
                minSpending: true,
                rate: true,
                points: true
            },

            skip,
            take,
            orderBy: {
                id: 'asc'
            }
        });

        // count the total number of promotions
        const total = await prisma.promotion.count({
            where
        });

        return {
            count: total,
            results: promotions
        }

    } catch (e) {
        console.error(`error in retrievePromotionsList ${e.message}`);
        console.error(e.stack);
    }


}

async function retrieveSpecificPromotion(promotionId, role) {
    try {
        // regular and cashiers can only see active promotions
        const now = new Date();
        // const startTime = role === 'regular' || role === 'cashier' ? { startTime: { lte: now } } : {};
        // const endTime = role === 'regular' || role === 'cashier' ? { endTime: { gt: now } } : {};

        // get the promotion
        const promotion = await prisma.promotion.findUnique({
            where: {
                id: parseInt(promotionId),
                // ...startTime,
                // ...endTime
            },
            select: {
                name: true,
                description: true,
                type: true,
                startTime: true,
                endTime: true,
                minSpending: true,
                rate: true,
                points: true
            }
        });

        if (!promotion) {
            return { error: "Promotion not found", status: 404 };
        }

        return {
            id: parseInt(promotionId),
            ...promotion
        };

    } catch (e) {
        console.error(`error in retrieveSpecificPromotion ${e.message}`);
        console.error(e.stack);
    }

}

async function updatePromotion(updateData, promotionId) {
    try {
        // find the promotion
        const promotion = await prisma.promotion.findUnique({
            where: {
                id: promotionId
            }
        });

        if (!promotion) {
            return { error: "Promotion not found", status: 404 };
        }

        // track what needs to be updated
        const updates = {};

        // tracking updates from optional fields
        if (updateData.name && updateData.name !== promotion.name) {
            updates.name = updateData.name;
        }
        if (updateData.description && updateData.description !== promotion.description) {
            updates.description = updateData.description;
        }
        if (updateData.type && updateData.type !== promotion.type) {
            updates.type = updateData.type;
        }
        if (updateData.startTime && new Date(updateData.startTime).getTime() !== (promotion.startTime).getTime()) {
            updates.startTime = new Date(updateData.startTime);
        }
        if (updateData.endTime && new Date(updateData.endTime).getTime() !== (promotion.endTime).getTime()) {
            updates.endTime = new Date(updateData.endTime);
        }

        if (updateData.minSpending) {
            updates.minSpending = updateData.minSpending;
        }
        if (updateData.rate) {
            updates.rate = updateData.rate;
        }
        if (updateData.points) {
            updates.points = updateData.points;
        }

        // checking for bad requests
        // when trying to update a promotion that has already started
        // trying to update the end time after the promotion has ended
        const checking = ['name', 'description', 'type', 'startTime', 'minSpending', 'rate', 'points'];
        const exists = checking.some(field => field in updates);
        if (exists && (new Date() > new Date(updateData.startTime))) {
            return { error: "Cannot update promotion after it has started", status: 400 };
        }
        if (new Date(updateData.endTime) in updates && (new Date() > new Date(updateData.endTime))) {
            return { error: "Cannot update promotion after it has ended", status: 400 };
        }

        // update the promotion
        const updatedPromotion = await prisma.promotion.update({
            where: {
                id: promotionId
            },
            data: updates
        });

        // return the updated promotion
        const ret = {
            id: updatedPromotion.id,
            name: updatedPromotion.name,
            type: updatedPromotion.type
        }

        Object.keys(updates).forEach((key) => {
            ret[key] = updatedPromotion[key];
        });

        return ret;
    } catch (e) {
        console.error(`error in updatePromotion ${e.message}`);
        console.error(e.stack);
    }



}

async function deletePromotion(promotionId) {
    try {
        // find the promotion
        const promotion = await prisma.promotion.findUnique({
            where: {
                id: promotionId
            }
        });

        if (!promotion) {
            return { error: "Promotion not found", status: 404 };
        }

        // if the promotion already started, it cannot be deleted
        if (new Date() > promotion.startTime) {
            return { error: "Cannot delete promotion after it has started", status: 403 };
        }

        // delete the promotion from the database
        await prisma.promotion.delete({
            where: {
                id: promotionId
            }
        });

        return { message: "Promotion deleted", status: 204 };

    } catch (e) {
        console.error(`error in deletePromotion ${e.message}`);
        console.error(e.stack);
    }

}

const promotionService = {
    createPromotion,
    retrievePromotionsList,
    retrieveSpecificPromotion,
    updatePromotion,
    deletePromotion
};

module.exports = promotionService;