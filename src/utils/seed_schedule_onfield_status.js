import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const seedSchedulesOnFieldAndStatus = async (req, res) => {

    try {

        const orderedArray = []

        const { date } = req.body

        console.log("DATE DARI REQ BODY : " + date)

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        console.log("SEKARANG HARII : " + startOfDay.getDay())

        const grupYangLibur = await prisma.libur.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        })

        console.log("GRUP YANG LIBUR : " + JSON.stringify(grupYangLibur))

        const semuaGrup = await prisma.caddyGroup.findMany()

        console.log("SEMUA GRUPP : " + JSON.stringify(semuaGrup))

        const grupYangMain = semuaGrup.filter(g => g.id != grupYangLibur.id_caddy_group)

        console.log("GRUP YANG MAINN : " + JSON.stringify(grupYangMain))

        const kemaren = new Date(startOfDay)
        kemaren.setDate(startOfDay.getDate() - 1)

        console.log("KEMARENN : " + kemaren)

        // check weekday
        const weekday = kemaren.toLocaleDateString("en-US", { weekday: "long" });
        console.log("WEEKDAYYY : " + weekday)

        // valid weekdays
        const validDays = ["Tuesday", "Wednesday", "Thursday", "Friday"];

        let finalDate;

        if (validDays.includes(weekday)) {
            // yesterday is valid → use it
            finalDate = kemaren;
        } else {
            // yesterday is Sat/Sun/Mon → go back to last Friday
            finalDate = new Date(startOfDay);

            // move backwards until it's Friday
            while (finalDate.toLocaleDateString("en-US", { weekday: "long" }) !== "Friday") {
                console.log(finalDate.toLocaleDateString("en-US", { weekday: "long" }))
                finalDate.setDate(finalDate.getDate() - 1);
            }
        }

        const finalDateRapi = finalDate.toISOString().split("T")[0];

        console.log("FINAL DATE :", finalDateRapi);

        const kemarenGte = new Date(finalDate);
        kemarenGte.setHours(0, 0, 0, 0);

        const kemarenLte = new Date(finalDate);
        kemarenLte.setHours(23, 59, 59, 999);

        console.log("Kemaren GTE : " + kemarenGte)
        console.log("Kemaren LTE : " + kemarenLte)

        const yangOnFieldKemaren = await prisma.onField.findMany({
            where: {
                date_turun: {
                    gte: kemarenGte,
                    lte: kemarenLte
                }
            },
            include: {
                caddy: {
                    include: {
                        caddy_group: true
                    }
                }
            }
        })

        console.log("YANG ONFIELD KEMAREN ADAA : " + yangOnFieldKemaren.length)

        if (yangOnFieldKemaren.length < 1) {
            console.log("GAADA YANG MAIN BANG")

            // random grup yang mau onfield (Group 1 - Group 8)
            const randomGrupYangMauOnFieldDiTanggalItu = Math.floor(Math.random() * grupYangMain.length + 1)
            console.log("GRUP YANG MAU DI ON FIELD ADALAH GRUP 1 - " + randomGrupYangMauOnFieldDiTanggalItu)
            let i = 1

            for (const grup of grupYangMain) {
                console.log("CURRENT GRUP YANG MAU DI PUSH DI IF : " + JSON.stringify(grup))
                grup.group_name.includes(`${i}`) ? orderedArray.push(grup) : ""

                const masukinGrupKeTable = await prisma.schedule.create({
                    data: {
                        date: startOfDay,
                        shift: i < 5 ? 0 : 1,
                        urutan: i,
                        id_caddy_group: grup.id
                    }
                })

                console.log("MASUKIN GRUP KE TABLE : " + JSON.stringify(masukinGrupKeTable))

                if (i < randomGrupYangMauOnFieldDiTanggalItu) {
                    console.log("I MASIH : " + i)

                    const caddyDiIYangMauDiOnField = await prisma.caddy.findMany({
                        where: {
                            id_caddy_group: grup.id
                        }
                    })

                    console.log("CADDY NYA ADA SEGINI BANG : " + caddyDiIYangMauDiOnField.length)

                    //tinggal di push ke onField tapi waktunya increment

                    const jamNyaBang = new Date(startOfDay)

                    let pNoCaddy = 1
                    for (const caddy of caddyDiIYangMauDiOnField) {

                        console.log("CADDY NYA ADA SEGINI BANG : " + caddyDiIYangMauDiOnField.length)
                        console.log("P NO CADDY : " + pNoCaddy)

                        jamNyaBang.setMinutes(jamNyaBang.getMinutes() + i * 5)

                        console.log("JAM NYA BANG : " + jamNyaBang)

                        const data = {
                            id_caddy: caddy.id,
                            kode: `${pNoCaddy + 100}`,
                            nama_pemain: `Pemain Yanto ${pNoCaddy + 1}`,
                            date_turun: jamNyaBang,
                            booked: false,
                            status: 0,
                            wood_quantity: 0,
                            iron_quantity: 0,
                            putter_quantity: 0,
                            umbrella_quantity: 0,

                        }

                        const yokPushSemua = await prisma.onField.create({
                            data: data
                        })

                        console.log("DATA YANG MAU DI PUSH : " + JSON.stringify(data))

                        pNoCaddy++
                    }

                    pNoCaddy = 0

                } else if (i === randomGrupYangMauOnFieldDiTanggalItu) {
                    console.log("INI I NYA : " + i + " TERUS randomGrupYangMauOnFieldDiTanggalItu : " + randomGrupYangMauOnFieldDiTanggalItu)

                    const caddyDiIYangMauDiOnField = await prisma.caddy.findMany({
                        where: {
                            id_caddy_group: grup.id
                        }
                    })

                    console.log("CADDY NYA ADA SEGINI BANG : " + caddyDiIYangMauDiOnField.length)

                    // random grup ini yang mau main sebagian berapa
                    const yangMauMainSebagianBerapa = Math.floor(Math.random() * caddyDiIYangMauDiOnField.length)
                    console.log("SEBAGIAN CADDY YANG MAIN ADA SEBANYAK : " + yangMauMainSebagianBerapa)

                    //tinggal di push ke onField tapi waktunya increment

                    const jamNyaBang = new Date(startOfDay)

                    let pNoCaddy = 1
                    for (const caddy of caddyDiIYangMauDiOnField) {

                        if (pNoCaddy === yangMauMainSebagianBerapa) {
                            console.log("OKEH UDAH SELESAI MASUKKINNYA")
                            break
                        }

                        // console.log("CADDY NYA ADA SEGINI BANG : " + yangMauMainSebagianBerapa)
                        console.log("P NO CADDY : " + pNoCaddy)

                        jamNyaBang.setMinutes(jamNyaBang.getMinutes() + i * 5)

                        console.log("JAM NYA BANG : " + jamNyaBang)

                        const data = {
                            id_caddy: caddy.id,
                            kode: `${pNoCaddy + 100}`,
                            nama_pemain: `Pemain Yanto ${pNoCaddy + 1}`,
                            date_turun: jamNyaBang,
                            booked: false,
                            status: 0,
                            wood_quantity: 0,
                            iron_quantity: 0,
                            putter_quantity: 0,
                            umbrella_quantity: 0,

                        }

                        const yokPushSemua = await prisma.onField.create({
                            data: data
                        })

                        console.log("DATA YANG MAU DI PUSH : " + JSON.stringify(data))

                        pNoCaddy++
                    }

                    pNoCaddy = 0

                } else {
                    console.log("UDAH BANG")
                }
                i++
            }

        } else {
            for (const grup of grupYangMain) {
                const perGrupPerHari = yangOnFieldKemaren.filter(ym => ym.caddy.id_caddy_group == grup.id)
                console.log("PER GRUPP : " + perGrupPerHari.length)
            }
        }

        // const kemarenRapi = kemaren.toISOString().split("T")[0]
        // console.log("KEMARENN RAPI : " + kemarenRapi)

        res.status(201).json({
            message: "Berhasil apa ni bang",
            data: "mantap"
        })

    } catch (error) {
        res.status(500).json({ message: "error " + error })
    }

}

export default seedSchedulesOnFieldAndStatus