import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)
    const user = await prisma.user.upsert({
        where: { email: 'admin@crazybitbite.com' },
        update: {},
        create: {
            email: 'admin@crazybitbite.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })
    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
