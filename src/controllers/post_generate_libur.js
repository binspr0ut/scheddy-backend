import { PrismaClient } from "@prisma/client";
import { parse, startOfMonth, endOfMonth, addDays } from "date-fns";

const prisma = new PrismaClient()

// Config
const GROUPS_COUNT = 8;
const WEEKDAYS = ["Tuesday", "Wednesday", "Thursday", "Friday"]; // only Tue-Fri
const START_DATE = new Date("2025-09-09"); // fallback if table empty

// Utility: count cycles in month
function countCyclesInMonth(monthString) {
    const [monthNum, yearStr] = monthString.split(" ");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthNum, 10) - 1;

    const start = startOfMonth(new Date(year, monthIndex, 1));
    const end = endOfMonth(start);

    let cycles = 0;
    let current = start;

    while (current <= end) {
        // Find the first Tuesday of the current week (or stay within month start)
        let weekStart = current;
        while (weekStart.getDay() !== 2 && weekStart > start) {
            weekStart = addDays(weekStart, -1);
        }

        // Define cycle range Tue → Fri (or whatever exists in the month)
        const tuesday = weekStart;
        const friday = addDays(tuesday, 3);

        // If any part of Tue–Fri exists inside the month → count as 1 cycle
        if (tuesday <= end && friday >= start) {
            // Overlaps with this month
            if (tuesday <= end && friday >= start) {
                cycles++;
            }
        }

        // Jump to next week (next Tuesday)
        current = addDays(weekStart, 7);
    }

    return cycles;
}


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

const generateLiburByMonth = async (req, res) => {

    try {
        const { bulan } = req.body; 

        // Parse bulan & tahun (request body: "09 2025" atau "01 2025")
        const [monthNum, yearStr] = bulan.split(" ");
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthNum, 10) - 1; // 0 = Jan, 11 = Dec

        // Range awal & akhir bulan
        const startDate = new Date(year, monthIndex, 1, 0, 0, 0);
        const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0);

        // cek apakah sudah ada data libur di bulan ini
        const availabilityLibur = await prisma.libur.findFirst({
          where: {
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
        });

        if (availabilityLibur) {
          return res.status(200).json({
            success: true,
            message: "data sudah ada dalam database",
          });
        }

        const cycles = countCyclesInMonth(bulan);
        // console.log("CYCLES : " + cycles)

        // 1) Load groups and sort by number in "Group N"
        const groupsRaw = await prisma.caddyGroup.findMany({
            select: { id: true, group_name: true },
        });

        // console.log("GROUPS RAW : " + JSON.stringify(groupsRaw))

        const groups = [...groupsRaw].sort((a, b) => {
            const numA = parseInt(a.group_name.split(" ")[1], 10);
            const numB = parseInt(b.group_name.split(" ")[1], 10);
            return numA - numB;
        });

        // console.log("GROUPS FOUND : " + groups)
        // console.log("GROUPS FOUND : " + JSON.stringify(groups))

        if (groups.length === 0) {
            return res.status(400).json({ error: "No groups found." });
        }

        // 2) Find last holiday to continue sequence and compute cycle offset
        const lastLibur = await prisma.libur.findFirst({ orderBy: { date: "desc" } });
        const totalRecords = await prisma.libur.count();
        const completedCycles = Math.floor(totalRecords / groups.length);
        let offset = completedCycles % WEEKDAYS.length; // rotate Tue→Wed→Thu→Fri each cycle

        // console.log("LAST LIBURR : " + JSON.stringify(lastLibur))

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

        const targetMonth = currentDate.getMonth(); // 0=Jan..11=Dec
        const targetYear = currentDate.getFullYear();


        // 3) Generate full cycles with strict weekday rotation
        for (let cycle = 0; cycle < cycles; cycle++) {
            for (let dayInCycle = 0; dayInCycle < groups.length; dayInCycle++) {

                if (
                    currentDate.getMonth() !== targetMonth ||
                    currentDate.getFullYear() !== targetYear
                ) {
                    // console.log("CURRENT MONTH : " + currentDate.getMonth())
                    // console.log("TARGET MONTH : " + targetMonth)
                    // console.log("CURRENT YEAR : " + currentDate.getFullYear())
                    // console.log("TARGET YEAR : " + targetYear)
                    // console.log("BREAK INNER LOOP")
                    break; // break inner loop
                }

                // rotate by startIndex (sequence continuity) + dayInCycle + offset (weekday fairness)
                const groupIndex = (startIndex + dayInCycle + offset) % groups.length;
                const group = groups[groupIndex];

                const payload = {
                    id_group: group.id,
                    date: currentDate,
                    is_request: false,
                };

                // Log with group_name 
                // console.log("CURRENT DATA :", JSON.stringify({
                //     ...payload,
                //     weekday: getWeekday(currentDate),
                //     group_name: group.group_name,
                // }));

                await prisma.libur.create({
                    data: {
                        date: currentDate,
                        is_request: false,
                        id_caddy_group: group.id,
                    },
                });


                const data = {
                    date: currentDate,
                    is_request: false,
                    id_caddy_group: group.id,
                }

                // console.log("DATA : " + JSON.stringify(data))

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

export default generateLiburByMonth