const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
    try {
        const testUser = await prisma.user.create({
            data: {
                utorid: 'testuser',
                name: 'Test User',
                email: 'testuser@mail.utoronto.ca',
                password: 'TestUser123!',
                role: 'regular',
                verified: true,
                points: 0
            }
        });

        console.log('Test user created successfully:', testUser);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('Test user already exists');
        } else {
            console.error('Error creating test user:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser(); 