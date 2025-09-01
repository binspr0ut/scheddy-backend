// import { Prisma, PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { parse } from "csv-parse";

// const prisma = new PrismaClient();

async function seedCaddy() {

    const records = []
    const csvFilePath = ""

    createReadStream(csvFilePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => records.push(data))
        .on('end', async () => {
            try {
                console.log(records)

                const caddies = []

                for (const record of records) {
                    for (const key in record) {
                        if (record[key]) {
                            console.log("caddy key: " + key)
                            console.log("caddy key: " + record[key])

                            caddies.push({
                                name: record[key],
                                caddy_type: null,
                                id_user: null,
                                id_group: key.split(' ')[1]
                            })
                        }


                    }
                }
            } catch (error) {
                console.log("ËRROR: " + error)
            }
        })
}

seedCaddy()
    .then(() => console.log("✅ Database seeded!"))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // await prisma.$disconnect()
        console.log("In Finally")
    })