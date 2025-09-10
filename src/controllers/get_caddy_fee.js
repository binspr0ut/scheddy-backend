import { PrismaClient } from "@prisma/client";
import { parse, startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient()

const getCaddyFee = async (req, res) => {


    try {
        console.log("P MASUK TRY BANG")

        const { month } = req.body

        if (!month) {
            return res.status(400).json({
                message: "Month is required"
            })
        } else {
            console.log("MONTH DARI REQUEST BODY : " + month)
        }

        const firstDay = parse(month, "MMMM yyyy", new Date());
        const start = startOfMonth(firstDay);
        const end = endOfMonth(firstDay);

        console.log("START : " + start)
        console.log("END : " + end)

        const allGroups = await prisma.caddyGroup.findMany({
            include: {
                caddies: true
            }
        })

        console.log("JUMLAH ALL GROUPS : " + allGroups.length)

        for (const group of allGroups) {
            console.log("JUMLAH CADDY ON ALL GROUP : " + group.caddies.length)
        }

        const caddyOnField = await prisma.onField.findMany({
            where: {
                date_turun: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                caddy: true
            }
        })

        console.log("CADDY ON FIELD : " + caddyOnField.length)

        const caddyMapping = {}

        for (const record of caddyOnField) {

            const caddyId = record.id_caddy

            if (!caddyMapping[caddyId]) {
                caddyMapping[caddyId] = { count: 0 }
            }
            caddyMapping[caddyId].count++;

        }

        console.log("CADDY MAPPING : " + JSON.stringify(caddyMapping))

        console.log("ALL GROUPS : " + JSON.stringify(allGroups))

        const result = allGroups.map((group) => {
            const caddies = group.caddies.map((caddy) => {
                const stats = caddyMapping[caddy.id]
                const fee_onfield = caddy.caddy_type == 0 ? 50000 : 60000
                const fee = stats ? stats.count * fee_onfield : 0

                return {
                    id: caddy.id,
                    name: caddy.name,
                    total_onfields: stats ? stats.count : 0,
                    total_fee: fee
                }
            })

            const totalGroupFee = caddies.reduce((sum, c) => sum + c.total_fee, 0);

            return {
                id_group: group.id,
                group_name: group.group_name,
                total_group_fee: totalGroupFee,
                caddies,
            };
        })

        // 1. Get all groups
        // 2. Count how many caddies is in the onfield table for this month
        // 3. Calculate the fee for each group
        // 4. Assign each caddy to their corresponding group

        res.status(200).json({
            message: "GET CADDY FEE DONE BANG",
            data: result
        })
    } catch (error) {
        console.log("ADA ERROR BANG DI CATCH : " + error)
        res.status(500).json({
            message: "ADA ERROR BANG DI CATCH",
            error: error.message
        })
    }

}

export default getCaddyFee