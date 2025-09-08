import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient()

// Config
const GROUPS_COUNT = 8;
const WEEKDAYS = ["Tuesday", "Wednesday", "Thursday", "Friday"]; // only Tue-Fri
const START_DATE = new Date("2025-09-09"); // fallback if table empty

// Utility: get weekday name
function getWeekday(date) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
}

// Utility: find next valid working day (Tue–Fri)
function nextWorkingDay(date) {
    let d = addDays(date, 1);
    while (!WEEKDAYS.includes(getWeekday(d))) {
        d = addDays(d, 1);
    }
    return d;
}

const seedLibur = async (req, res) => {

    try {
        const { cycles = 1 } = req.body;

        // 1) Load groups and sort by number in "Group N"
        const groupsRaw = await prisma.caddyGroup.findMany({
            select: { id: true, group_name: true },
        });

        console.log("GROUPS RAW : " + JSON.stringify(groupsRaw))

        const groups = [...groupsRaw].sort((a, b) => {
            const numA = parseInt(a.group_name.split(" ")[1], 10);
            const numB = parseInt(b.group_name.split(" ")[1], 10);
            return numA - numB;
        });

        console.log("GROUPS FOUND : " + groups)
        console.log("GROUPS FOUND : " + JSON.stringify(groups))

        if (groups.length === 0) {
            return res.status(400).json({ error: "No groups found." });
        }

        // 2) Find last holiday to continue sequence and compute cycle offset
        const lastLibur = await prisma.libur.findFirst({ orderBy: { date: "desc" } });
        const totalRecords = await prisma.libur.count();
        const completedCycles = Math.floor(totalRecords / groups.length);
        let offset = completedCycles % WEEKDAYS.length; // rotate Tue→Wed→Thu→Fri each cycle

        console.log("LAST LIBURR : " + JSON.stringify(lastLibur))

        let currentDate;
        let startIndex; // index in groups[] to start from this generation run

        if (lastLibur) {
            // continue from the next working day
            currentDate = nextWorkingDay(new Date(lastLibur.date));

            // make the next group the one after the last assigned
            const lastIdx = groups.findIndex(g => g.id === lastLibur.id_group);
            startIndex = (lastIdx + 1) % groups.length;
        } else {
            // first time: start from configured start date, Group 1
            currentDate = START_DATE;
            startIndex = 0;
        }

        const results = [];

        // 3) Generate full cycles with strict weekday rotation
        for (let cycle = 0; cycle < cycles; cycle++) {
            for (let dayInCycle = 0; dayInCycle < groups.length; dayInCycle++) {
                // rotate by startIndex (sequence continuity) + dayInCycle + offset (weekday fairness)
                const groupIndex = (startIndex + dayInCycle + offset) % groups.length;
                const group = groups[groupIndex];

                const payload = {
                    id_group: group.id,     
                    date: currentDate,
                    is_request: false,
                };

                // Log with group_name 
                console.log("CURRENT DATA :", JSON.stringify({
                    ...payload,
                    weekday: getWeekday(currentDate),
                    group_name: group.group_name,
                }));

                await prisma.libur.create({
                    data: {
                      date: currentDate,
                      is_request: false,
                      id_caddy_group: group.id,
                    },
                  });
                  

                results.push({
                    id_group: group.id,
                    group_name: group.group_name,
                    date: currentDate,
                    weekday: getWeekday(currentDate),
                });

                currentDate = nextWorkingDay(currentDate);
            }

            // shift weekday mapping for the next cycle (Tue→Wed→Thu→Fri→Tue…)
            offset = (offset + 1) % WEEKDAYS.length;
        }

        res.status(201).json({ message: "Libur generated (preview)", data: results });
    } catch (err) {
        console.error("ERROR DI CATCH :", err);
        res.status(500).json({ error: "Failed to generate libur" });
    }


}

export default seedLibur