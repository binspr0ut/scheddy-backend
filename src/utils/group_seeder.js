import Prisma from "@prisma/client";

const prisma = new Prisma.PrismaClient();

async function seedGroup() {
    const group = await prisma.group.createMany({
        data: [{
            group_name: "Group 1",
        },
        {
            group_name: "Group 2",
        },
        {
            group_name: "Group 3",
        },
        {
            group_name: "Group 4",
        },
        {
            group_name: "Group 5",
        },
        {
            group_name: "Group 6",
        },
        {
            group_name: "Group 7",
        },
        {
            group_name: "Group 8",
        },
        ],
    });
}

seedGroup()
    .then(() => console.log("✅ Database seeded!"))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })