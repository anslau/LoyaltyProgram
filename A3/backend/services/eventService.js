const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEvent(event, id) {
    try{
        // get the event info and handle optional fields
        const { name, description, location, startTime, endTime, capacity, points } = event;
        const maxCapacity = capacity ? { capacity: capacity } : {};

        // create the event
        const newEvent = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                ...maxCapacity,
                pointsRemain: points
            },
            select: {
                id: true, 
                name: true,
                description: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsRemain: true,
                pointsAwarded: true,
                published: true,
                organizers: true,
                guests: true,
            }
        });

        // add the creator as an organizer
        await prisma.eventOrganizer.create({
            data: {
                userId: id,
                eventId: newEvent.id
            }
        });

        return newEvent;

    }catch (e){
        console.error(`error in createEvent ${e.message}`);
        console.error(e.stack);
    }

}

async function retrieveEventsList(filters, role, userId) {
    try{
        // handle filters
        const where = {};
        where.name = filters.name ? { equals: filters.name } : {};
        where.location = filters.location ? { equals: filters.location } : {};
        
        if (filters.started){
            const now = new Date();
            where.startTime = filters.started === 'true' ? { lte: now } : { gt: now };
        }

        if (filters.ended){
            const now = new Date();
            where.endTime = filters.ended === 'true' ? { lte: now } : { gt: now };
        }

        // modified to allow events where the user is an organizer to be shown, 
        // even if they are not a manager+
        const conditionals = [];
        if (role === 'regular' || role === 'cashier'){
            // where.published = true;
            conditionals.push({
                OR: [
                    { published: true },
                    { organizers: { some: { user: { id: userId } } } }
                ]
            });
        }else if (filters.published){
            where.published = filters.published === 'true';
        }
        
        if (filters.showFull !== 'true') {
            // where.OR = [
            //     { capacity: null }, 
            //     { numGuests: { lt: prisma.event.fields.capacity } } 
            // ];
            conditionals.push({
                OR: [
                    { capacity: null },
                    { numGuests: { lt: prisma.event.fields.capacity } }
                ]
            });
        }

        if (conditionals.length > 0) {
            where.AND = conditionals;
        }

        // for pagination
        let pageNum = parseInt(filters.page) || 1;
        let take = parseInt(filters.limit) || 10;
        const skip = (pageNum - 1) * take;

        // get the events
        const events = await prisma.event.findMany({
            where,
            select: {
                id: true,
                name: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsRemain: role !== 'regular' && role !== 'cashier',
                pointsAwarded: role !== 'regular' && role !== 'cashier',
                published: role !== 'regular' && role !== 'cashier',
                numGuests: true,
            },
            skip,
            take,
            orderBy: {
                id: 'asc'
            }
        });

        // count the total number of promotions
        const total = await prisma.event.count({
            where
        });

        return {count: total,
                results: events};

    }catch(e){
        console.error(`error in retrieveEventsList ${e.message}`);
        console.error(e.stack);
    }
}

async function retrieveEvent(eventId, role, userId) {
    try{
        // get the event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsRemain: true,
                pointsAwarded: true,
                published: true,
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                utorid: true,
                                name: true
                            }
                        }
                    }
                },
                guests: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                utorid: true,
                                name: true
                            }
                        }
                    }
                },
                numGuests: true
            }
        });

        // check if the event exists    
        if (!event){
            return {error: "Event not found", status: 404};
        }    

        // if the user is not a manager/superuser/organizer, they can only see published events
        const lowerPrivilege = ['regular', 'cashier'];
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === userId);

        // formatting the organizers and guests
        event.organizers = event.organizers.map(organizer => organizer.user);
        event.guests = event.guests.map(guest => guest.user);

        if (lowerPrivilege.includes(role) && !event.published && !isOrganizer){
            return {error: "Event not found", status: 404};
        }else if (lowerPrivilege.includes(role) && !isOrganizer && event.published){
            const { pointsRemain, pointsAwarded, published, guests, ...publicEvent } = event;
            return publicEvent;
        }

        const { numGuests, ...publicEvent } = event;
        return publicEvent;

    }catch(e){
        console.error(`error in retrieveEvent ${e.message}`);
        console.error(e.stack);
    }
}

async function updateEvent(eventId, data, userId, role) {
    try{
        // find the event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsAwarded: true,
                pointsRemain: true,
                published: true,
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        // checking if the event exists
        if (!event){
            return {error: "Event not found", status: 404};
        }

        // check for clearance if the user is not an organizer
        const lowerPrivilege = ['regular', 'cashier'];
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === userId);
        if (lowerPrivilege.includes(role) && !isOrganizer){
            return {error: "Unauthorized", status: 403};
        }

        // track what needs to be updated
        // don't update if the data is the same
        const updates = {};
        if (data.name && data.name !== event.name){
            updates.name = data.name;
        }
        if (data.description && data.description !== event.description){
            updates.description = data.description;
        }
        if (data.location && data.location !== event.location){
            updates.location = data.location;
        }
        if (data.startTime && new Date(data.startTime).getTime() !== event.startTime.getTime()){
            updates.startTime = new Date(data.startTime);
        }
        if (data.endTime && new Date(data.endTime).getTime() !== event.endTime.getTime()){
            updates.endTime = new Date(data.endTime);
        }
        if (data.published && data.published !== event.published){
            updates.published = data.published;
        }

        // if the number of guests attending is greater than the new capacity, return an error
        if (data.capacity){
            if (event.numGuests >= data.capacity){
                return {error: "Cannot reduce capacity below the number of guests", status: 400};
            }
            updates.capacity = data.capacity;
        }

        // if the number of points remaining is less than the number of points awarded, return an error
        if (data.points){
            if (data.points + event.pointsRemain < 0){
                return {error: "Cannot reduce points below the number of points awarded", status: 400};
            }
            if (data.points < event.pointsAwarded){
                return {error: "Cannot reduce points below the number of points awarded", status: 400};
            }
            updates.pointsRemain = data.points;
        }

        // check for bad requests
        const checking = ['name', 'description', 'location', 'startTime', 'capacity'];
        const exists = checking.some(field => field in updates);
        if (exists && (new Date() > event.startTime)){
            return {error: "Cannot update these fields after it has started", status: 400};
        }
        if (new Date(data.endTime) in updates && (new Date() > new Date(data.endTime))) {
            return { error: "Cannot update event deadline after it has ended", status: 400 };
        }

        // update the event
        const updatedEvent = await prisma.event.update({
            where: {
                id: eventId
            },
            data: updates
        });

        // return only the fields that were updated
        const ret = {
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location
        }

        Object.keys(updates).forEach((key) => {
            ret[key] = updatedEvent[key];
        });
        
        return ret;

    }catch(e){
        console.error(`error in updateEvent ${e.message}`);
        console.error(e.stack);
    }

    
}

async function deleteEvent(eventId) {
    try{
        // find the event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        }else if (event.published){
            return {error: "Cannot delete a published event", status: 400};
        }

        // delete the event
        await prisma.event.delete({
            where: {
                id: eventId
            }
        });

        return {message: "Event deleted"};
    }catch(e){
        console.error(`error in deleteEvent ${e.message}`);
        console.error(e.stack);
    }

}

async function addOrganizer(eventId, utorid) {
    try{
        // make sure the event exists and has not ended
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            include: {
                guests: true
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        } else if (event.endTime < new Date()){
            return {error: "Cannot add an organizer to an event that has ended", status: 410};
        } 
        
        // make sure the new organizer has an account
        const user = await prisma.user.findUnique({
            where: {
                utorid
            }
        });

        if (!user){
            return {error: "user not found", status: 404};
        }

        // make sure the user is not already a guest
        if (event.guests.some(guest => guest.userId === user.id)){
            return {error: "User is already a guest, remove them first and try again", status: 400};
        }

        // add the user as an organizer
        await prisma.eventOrganizer.create({
            data: {
                userId: user.id,
                eventId
            }
        });

        // get all of the event organizers
        const organizers = await prisma.eventOrganizer.findMany({
            where: {
                eventId
            },
            select: {
                user: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        });

        // return the updated list of organizers
        return {
            id: event.id,
            name: event.name,
            location: event.location,
            organizers: organizers.map(organizer => organizer.user)
        }

    }catch(e){
        console.error(`error in addOrganizer ${e.message}`);
        console.error(e.stack);
    }

}

async function removeOrganizer(eventId, userId) {
    try{
        // make sure the event exists and has not ended
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        } else if (event.endTime < new Date()){
            return {error: "Cannot remove an organizer from an event that has ended", status: 410};
        } 
        
        // make sure the user is an organizer
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === userId);
        if (!isOrganizer){
            return {error: "User is not an organizer", status: 400};
        }

        // remove the user as an organizer
        await prisma.eventOrganizer.delete({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        return { message: "Organizer removed" };

    }catch(e){
        console.error(`error in removeOrganizer ${e.message}`);
        console.error(e.stack);
    }

}

async function addGuest(role, eventId, utorid, requesterId) {
    try{
        // get the event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                id: true,
                name: true,
                location: true,
                endTime: true,
                capacity: true,
                numGuests: true,
                published: true
            }
        });

        // check that the event exists
        if (!event){
            return {error: "Event not found", status: 404};
        } 

        // check that is the requester is less privileged than they must be an organizer to add a guest
        const lessPrivilege = ['regular', 'cashier'].includes(role);
        const requesterIsOrganizer = event.organizers.some(organizer => organizer.user.id === requesterId);
        if (lessPrivilege && !requesterIsOrganizer){
            return {error: "Unauthorized", status: 403};
        }

        // check that the event is visible to the requester, has not ended, and has room
        if (lessPrivilege && !event.published){
            return {error: "Event not found", status: 404};
        }else if (event.endTime < new Date()){
            return {error: "Cannot add a guest to an event that has ended", status: 410};
        }else if (event.capacity !== null && event.numGuests >= event.capacity){
            return {error: "Event is full", status: 410};
        }

        // check that the new guest user exists
        const guest = await prisma.user.findUnique({
            where: {
                utorid
            }, 
            select: {
                id: true,
                utorid: true,
                name: true
            }
        });

        if (!guest){
            return {error: "User not found", status: 404};
        }

        // check that the new guest is not already an organizer for the event
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === guest.id);
        if (isOrganizer){
            return {error: "User is already an organizer, remove as organizer and retry", status: 400};
        }

        // add the user as a guest
        await prisma.eventGuest.create({
            data: {
                userId: guest.id,
                eventId
            }
        });

        // update the number of guests
        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                numGuests: {
                    increment: 1
                }
            }
        });

        return {
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: guest,
            numGuests: event.numGuests + 1
        }

    }catch(e){
        console.error(`error in addGuest ${e.message}`);
        console.error(e.stack);
    }

}

async function removeGuest(eventId, userId, requesterId) {
    try{
        // make sure the event exists
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                numGuests: true,
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                guests: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        }

        // check that the requester is not an organizer for this event
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === requesterId);
        if (isOrganizer){
            return {error: "Organizers cannot remove guests", status: 403};
        }

        // check that the user is a guest for this event
        const isGuest = event.guests.some(guest => guest.user.id === userId);
        if (!isGuest){
            return {error: "User is not a guest", status: 400};
        }

        // remove the user as a guest
        await prisma.eventGuest.delete({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        // update the number of guests
        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                numGuests: {
                    decrement: 1
                }
            }
        });

        return { message: "Guest removed" };

    }catch(e){
        console.error(`error in removeGuest ${e.message}`);
        console.error(e.stack);
    }

}

async function addCurrentUserAsGuest(eventId, userId) {
    try{
        // get the event and make sure it exists
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                id: true,
                name: true,
                location: true,
                endTime: true,
                numGuests: true,
                capacity: true,
                guests: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        }

        // check that the user is not already on the guest list
        const isGuest = event.guests.some(guest => guest.user.id === userId);
        if (isGuest){
            return {error: "User is already a guest", status: 400};
        }

        // check that the event is not already full and has not ended
        if (event.endTime < new Date()){
            return {error: "Cannot add a guest to an event that has ended", status: 410};
        }
        if (event.capacity !== null && event.numGuests >= event.capacity){
            return {error: "Event is full", status: 410};
        }

        // add the user as a guest
        await prisma.eventGuest.create({
            data: {
                userId,
                eventId
            }
        });

        // update the number of guests
        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                numGuests: {
                    increment: 1
                }
            }
        });

        // get the user info
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                utorid: true,
                name: true
            }
        });

        return {
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: user,
            numGuests: event.numGuests + 1
        }

    }catch(e){
        console.error(`error in addCurrentUserAsGuest ${e.message}`);
        console.error(e.stack);
    }

}

async function removeCurrentUserAsGuest(eventId, userId) {
    try{
        // get the event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                numGuests: true,
                endTime: true,
                guests: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        }

        // check that the user is a guest for this event
        const isGuest = event.guests.some(guest => guest.user.id === userId);
        if (!isGuest){
            return {error: "User is not a guest", status: 404};
        }

        // check that the event has not ended
        if (event.endTime < new Date()){
            return {error: "Cannot remove a guest from an event that has ended", status: 410};
        }

        // remove the user as a guest
        await prisma.eventGuest.delete({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        // update the number of guests
        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                numGuests: {
                    decrement: 1
                }
            }
        });

        return { message: "Guest removed" };

    }catch(e){
        console.error(`error in removeCurrentUserAsGuest ${e.message}`);
        console.error(e.stack);
    }


}

async function createRewardTransaction(type, eventId, utorid, amount, userId, userUtorid, userRole) {
    try{
        // check that if the user is not a manager+, they must be an
        // organizer for this event
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            select: {
                organizers: {
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                guests: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                utorid: true
                            }
                        }
                    }
                },
                numGuests: true,
                pointsRemain: true
            }
        });

        if (!event){
            return {error: "Event not found", status: 404};
        }

        const underPrivilege = ['regular', 'cashier'];
        const isOrganizer = event.organizers.some(organizer => organizer.user.id === userId);
        if (underPrivilege.includes(userRole) && !isOrganizer){
            return {error: "Unauthorized", status: 403};
        }

        // check that there are enough points to award
        const numGuests = utorid ? 1 : event.numGuests;
        if (event.pointsRemain < numGuests * amount){
            return {error: "Not enough points to award", status: 400};
        }

        // if a user is provided
        if (utorid){
            // check that the user is a guest for this event
            const isGuest = event.guests.some(guest => guest.user.utorid === utorid);
            if (!isGuest){
                return {error: "User is not a guest", status: 400};
            }

            // find the user to get their id
            const user = await prisma.user.findUnique({
                where: {
                    utorid
                },
                select: {
                    id: true
                }
            });

            const transaction = await prisma.$transaction([
                prisma.transaction.create({
                    data: {
                        utorid,
                        type,
                        amount,
                        relatedId: eventId,
                        remark: `Awarded ${amount} points for attending event ${eventId}`,
                        createdBy: userUtorid,
                        customerId: user.id
                    }
                }),

                prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        points: {
                            increment: amount
                        }
                    }
                }),

                prisma.event.update({
                    where: {
                        id: eventId
                    },
                    data: {
                        pointsRemain: {
                            decrement: amount
                        },
                        pointsAwarded: {
                            increment: amount
                        }
                    }
                }),
                
            ]);

            return {
                id: transaction[0].id,
                recipient: utorid,
                awarded: amount,
                type: type,
                relatedId: eventId,
                remark: `Awarded ${amount} points for attending event ${eventId}`,
                createdBy: userUtorid
            }

        }else{
            const transactions = [];
            const updatedUsers = [];
            // award points to all guests
            for (const guest of event.guests){
                transactions.push(
                    prisma.transaction.create({
                        data: {
                            utorid: guest.user.utorid,
                            type,
                            amount,
                            relatedId: eventId,
                            remark: `Awarded ${amount} points for attending event ${eventId}`,
                            createdBy: userUtorid,
                            customerId: guest.user.id
                        }
                    })
                );

                updatedUsers.push(
                    prisma.user.update({
                        where: {
                            id: guest.user.id
                        },
                        data: {
                            points: {
                                increment: amount
                            }
                        }
                    })
                );
            }    

            // create the transaction and update the event
            const newTransactions = await prisma.$transaction([
                // create transactions
                ...transactions,

                // update the users
                ...updatedUsers,

                // update the event
                prisma.event.update({
                    where: {
                        id: eventId
                    },
                    data: {
                        pointsRemain: {
                            decrement: transactions.length * amount
                        },
                        pointsAwarded: {
                            increment: transactions.length * amount
                        }
                    }
                })
            ]);

            return event.guests.map((guest, index) => ({
                id: newTransactions[index].id,
                recipient: guest.user.utorid,
                awarded: amount,
                type: 'event',
                relatedId: eventId,
                remark: `Awarded ${amount} points for attending event ${eventId}`,
                createdBy: userUtorid
            }))
        }
    }catch(e){
        console.error(`error in createRewardTransaction ${e.message}`);
        console.error(e.stack);
    }
    
}


const eventService = {
    createEvent,
    retrieveEventsList,
    retrieveEvent,
    updateEvent,
    deleteEvent,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    addCurrentUserAsGuest,
    removeCurrentUserAsGuest,
    createRewardTransaction
};

module.exports = eventService;