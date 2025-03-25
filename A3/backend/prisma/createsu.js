/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSuperUser(utorid, email, password){
    try {
        const superUser = await prisma.user.create({
            data: {
                utorid,
                email,
                password,
                role: 'superuser',
                verified: true
            }
        });
    }
    catch (error) {
        console.error('Could not create superuser', error);
    }
    finally {
        await prisma.$disconnect();
    }
}

// command line contains the executable, path, and arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Usage: node prisma/createsu.js utorid email password');
    process.exit(1);
}

const [utorid, email, password] = args;
createSuperUser(utorid, email, password);
