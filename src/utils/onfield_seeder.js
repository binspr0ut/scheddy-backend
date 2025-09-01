import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedOnField() {
  try {
    // 1️⃣ Get all caddies (to assign randomly)
    const caddies = await prisma.caddy.findMany();
    if (caddies.length === 0) {
      throw new Error("No caddies found. Seed Caddy table first!");
    }

    // 2️⃣ Generate 20 dummy OnField entries
    for (let i = 0; i < 20; i++) {
      const randomCaddy = caddies[Math.floor(Math.random() * caddies.length)];

      await prisma.onField.create({
        data: {
          id_caddy: randomCaddy.id,
          kode: `${i*10 + 10 + Math.floor(Math.random() * 10)}`,
        //   nama_pemain: `Player ${i + 1}`,
          nama_pemain: Math.random() < 0.3 ? "Yanto" : "Rusdi",
          date_turun: new Date(Date.now()), 
          booked: Math.random() < 0.5,
          jumlah_hole: null,
          status: Math.floor(Math.random() * 3), // example: 0=pending,1=active,2=done
          wood_quantity: Math.floor(Math.random() * 3),
          iron_quantity: Math.floor(Math.random() * 5),
          putter_quantity: Math.floor(Math.random() * 2),
          umbrella_quantity: Math.floor(Math.random() * 2),
          other_items: Math.random() < 0.3 ? "Payung" : null
        }
      });

      console.log(`✅ OnField ${i + 1} created for caddy: ${randomCaddy.name}`);
    }

    console.log("🎉 Successfully seeded 20 OnField records!");
  } catch (error) {
    console.error("❌ ERROR seeding OnField:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedOnField();
