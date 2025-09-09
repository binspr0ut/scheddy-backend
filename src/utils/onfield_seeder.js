import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedOnField = async (req, res) => {
  try {

    const { date } = req.body;

    console.log("DATE DARI REQ BODY : " + date)

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("START OF DAY : " + startOfDay)
    console.log("END OF DAY : " + endOfDay)

    console.log("SEKARANG HARII : " + startOfDay.getDay())

    const semuaGrupYangMain = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    })

    console.log("SEMUA GRUP YANG MAIN : " + JSON.stringify(semuaGrupYangMain))

    const randomYangOnFieldBerapaGrup = Math.floor(Math.random() * (semuaGrupYangMain.length + 1));
    console.log("GRUP YANG MAIN ADA : " + randomYangOnFieldBerapaGrup)

    for (const grup of semuaGrupYangMain) {
      if (grup.urutan < randomYangOnFieldBerapaGrup) {
        const caddyDiGrupItu = await prisma.caddy.findMany({
          where: {
            id_caddy_group: grup.id_caddy_group
          }
        })

        console.log("JUMLAH CADDY DI GRUP ITU : " + caddyDiGrupItu.length)

        const jamNyaBang = new Date(startOfDay)
        jamNyaBang.setMinutes(jamNyaBang.getMinutes() + grup.urutan * 5)
        console.log("JAM NYA BANG : " + jamNyaBang)

        for (const caddy of caddyDiGrupItu) {
          const data = {
            id_caddy: caddy.id,
            kode: `${grup.urutan + 100}`,
            nama_pemain: `Pemain Yanto ${grup.urutan + 1}`,
            date_turun: jamNyaBang,
            booked: false,
            status: 0,
            wood_quantity: 0,
            iron_quantity: 0,
            putter_quantity: 0,
            umbrella_quantity: 0,
          }

          await prisma.onField.create({
            data: data
          })
          console.log("YES")
        }

      } else if (grup.urutan === randomYangOnFieldBerapaGrup) {
        console.log("INI I NYA : " + grup.urutan + " TERUS GRUP YANG DI RANDOM PEMAINNYA GRUP : " + randomYangOnFieldBerapaGrup)

        const caddyDiGrupItu = await prisma.caddy.findMany({
          where: {
            id_caddy_group: grup.id_caddy_group
          }
        })

        const randomJumlahYangMainDiGrup = Math.floor(Math.random() * (caddyDiGrupItu.length + 1));
        console.log("JUMLAH CADDY YANG MAIN DI GRUP ITU : " + randomJumlahYangMainDiGrup)

        const jamNyaBang = new Date(startOfDay)
        jamNyaBang.setMinutes(jamNyaBang.getMinutes() + grup.urutan * 5)
        console.log("JAM NYA BANG : " + jamNyaBang)

        for (const caddy of randomJumlahYangMainDiGrup) {
          const data = {
            id_caddy: caddy.id,
            kode: `${grup.urutan + 100}`,
            nama_pemain: `Pemain Yanto ${grup.urutan + 1}`,
            date_turun: jamNyaBang,
            booked: false,
            status: 0,
            wood_quantity: 0,
            iron_quantity: 0,
            putter_quantity: 0,
            umbrella_quantity: 0,
          }

          await prisma.onField.create({
            data: data
          })
          console.log("YES")
        }

      } else {
        console.log("APANI BANG KOK MASUK SINI")
      }
    }

    // for (const grup of semuaGrupYangMain) {
    //   } else {
    //     console.log("APANI BANG KOK MASUK SINI")
    //   }
    // }

    // // 2️⃣ Generate 20 dummy OnField entries
    // for (let i = 0; i < 25; i++) {
    //   const randomCaddy = caddies[Math.floor(Math.random() * caddies.length)];

    //   await prisma.onField.create({
    //     data: {
    //       id_caddy: randomCaddy.id,
    //       kode: `${i*10 + 10 + Math.floor(Math.random() * 10)}`,
    //     //   nama_pemain: `Player ${i + 1}`,
    //       nama_pemain: Math.random() < 0.3 ? "Yanto" : "Rusdi",
    //       date_turun: new Date(Date.now()), 
    //       booked: Math.random() < 0.5,
    //       jumlah_hole: null,
    //       status: Math.floor(Math.random() * 3), // example: 0=pending,1=active,2=done
    //       wood_quantity: Math.floor(Math.random() * 3),
    //       iron_quantity: Math.floor(Math.random() * 5),
    //       putter_quantity: Math.floor(Math.random() * 2),
    //       umbrella_quantity: Math.floor(Math.random() * 2),
    //       other_items: Math.random() < 0.3 ? "Payung" : null
    //     }
    //   });

    //   console.log(`✅ OnField ${i + 1} created for caddy: ${randomCaddy.name}`);
    // }

    // console.log("🎉 Successfully seeded 20 OnField records!");

    res.status(201).json({
      message: "Berhasil apa ni bang",
      data: "mantap"
    })
  } catch (error) {
    console.error("❌ ERROR seeding OnField:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export default seedOnField;
