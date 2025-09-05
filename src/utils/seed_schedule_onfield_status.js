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

            let i = 1

            for (const grup of grupYangMain) {
                console.log("CURRENT GRUP YANG MAU DI PUSH DI IF : " + JSON.stringify(grup))
                grup.group_name.includes(`${i}`) ? orderedArray.push(grup) : ""

                // random grup yang mau onfield (Group 1 - Group 8)
                const randomGrupYangMauOnFieldDiTanggalItu = Math.floor(Math.random() * 9)
                console.log("GRUP YANG MAU DI ON FIELD ADALAH GRUP 1 - " + randomGrupYangMauOnFieldDiTanggalItu)

                for (let i = 1; i <= randomGrupYangMauOnFieldDiTanggalItu; i++) {

                    if (i === randomGrupYangMauOnFieldDiTanggalItu) {

                        const jumlahCaddyDiGrup = await prisma.caddy.count({
                            where: {
                                id_caddy_group: grup.id
                            }
                        })

                        console.log("JUMLAH CADDY DI " + grup.group_name + " ADALAH " + jumlahCaddyDiGrup)

                        //random grup terakhir yang mau di onfield
                        const randomYangMauDiOnFieldDiGrupTerakhir = Math.floor(Math.random() * jumlahCaddyDiGrup)
                    } else {
                        // seed ke onfield semua
                    }

                }

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