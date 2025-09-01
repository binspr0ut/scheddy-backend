import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const records = [];
  const csvFilePath = "";

  createReadStream(csvFilePath)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on("data", (data) => records.push(data))
    .on("end", async () => {
      try {
        console.log("CSV Parsed:", records);

        for (const record of records) {
          for (const key in record) {
            const caddyName = record[key];
            if (!caddyName) continue;

            // 1️⃣ Create a User first
            const user = await prisma.user.create({
              data: {
                name: caddyName,
                password: "default123",
                role: 0
              }
            });

            // 2️⃣ Find or create the Group
            let group = await prisma.group.findUnique({
              where: { group_name: key }
            });

            if (!group) {
              group = await prisma.group.create({
                data: { group_name: key }
              });
            }

            // 3️⃣ Create the Caddy linked to both User & Group
            await prisma.caddy.create({
              data: {
                name: caddyName,
                caddy_type: 0, // or whatever default
                id_user: user.id,
                id_group: group.id
              }
            });

            console.log(`✅ Created Caddy: ${caddyName} (User ID: ${user.id}, Group: ${group.group_name})`);
          }
        }
      } catch (error) {
        console.error("❌ ERROR:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

seed()
  .then(() => console.log("✅ Database seeded!"))
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
