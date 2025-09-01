import { Prisma, PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { parse } from "csv-parse";

const prisma = new PrismaClient();

async function seedUser() {

    const records = []
    const csvFilePath = ""

    createReadStream(csvFilePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => records.push(data))
        .on('end', async () => {
            try {
                console.log(records)

                const users = []

                for (const record of records) {
                    for (const key in record) {
                        console.log("User found: " + record)
                        console.log("User key found: " + record[key])
                        if (record[key]) {
                            users.push({
                                name: record[key],
                                password: 'default123',
                                role: 0
                            })
                        }

                    }
                }

                console.log("User to push: " + users)
                console.log("Number of users: " + users.length)

                for (const user of users) {
                    console.log("USER YANG MAU DI PUSH : " + user)
                    await prisma.user.create({
                        data: user
                    })
                }

            } catch (error) {
                console.log("ËRROR: " + error)
            }
        })
}

seedUser()
    .then(() => console.log("✅ Database seeded!"))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // await prisma.$disconnect()
        console.log("In Finally")
    })