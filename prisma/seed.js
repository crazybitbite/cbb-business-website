const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcryptjs.hash('admin123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'admin@crazybitbite.com' },
        update: {},
        create: {
            email: 'admin@crazybitbite.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log('Admin user created/updated:', user);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
