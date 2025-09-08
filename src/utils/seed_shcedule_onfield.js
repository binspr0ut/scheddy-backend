import { PrismaClient } from "@prisma/client";
import { addDays, parseISO, formatISO } from "date-fns";

const prisma = new PrismaClient();

const seedSchedulesAndOnField = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: "Please provide start and end dates (YYYY-MM-DD)" });
        }

        const startDate = parseISO(start).toISOString();
        const endDate = parseISO(end).toISOString();

        console.log("Start date: " + startDate)
        console.log("End date: " + endDate)

        // Get all groups
        const groups = await prisma.caddyGroup.findMany({
            include: { caddies: true }
        });
        const totalGroups = groups.length;

        console.log("All groups : " + groups)
        console.log("Groups length: " + totalGroups)

        let currentDate = startDate;

        console.log("Current Date: " + currentDate)

        while (currentDate <= endDate) {
            // const dateStr = formatISO(currentDate, { representation: "date" });
            const dateStr = startDate.split("T")[0];
            console.log("Date String: " + dateStr)

            // Step 1: Look at yesterday’s schedule & onfield
            const yesterday = addDays(currentDate, -1);

            // make sure these are Date objects, not strings
            const startOfDay = new Date(yesterday);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(yesterday);
            endOfDay.setHours(23, 59, 59, 999);

            // query schedules
            const yesterdaySchedules = await prisma.schedule.findMany({
                where: {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

            console.log("Yesterday Date:", yesterday.toISOString());
            console.log("Yesterday groups:", yesterdaySchedules);
            console.log("Yesterday groups length:", yesterdaySchedules.length);

            // query onField
            const yesterdayOnField = await prisma.onField.findMany({
                where: {
                    date_turun: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

            console.log("Yesterday on fields length: " + yesterdayOnField.length)

            let yesterdayRestGroup = null;
            if (yesterdaySchedules.length > 0) {
                const yesterdayPlayedGroups = yesterdaySchedules.map(s => s.id_caddy_group);
                yesterdayRestGroup = groups.find(
                    g => !yesterdayPlayedGroups.includes(g.id)
                );
            }

            console.log("Yesterday rest group (yang sekarang main) : " + JSON.stringify(yesterdayRestGroup))

            // Step 2: Today’s groups
            let todayGroups;
            if (yesterdayRestGroup) {
                todayGroups = groups.filter(g => g.id !== yesterdayRestGroup.id);
            } else {
                todayGroups = groups.slice(0, totalGroups - 1); // first seed: groups 1-7
            }

            // Step 3: Ordering
            let orderedGroups = [];
            if (yesterdayRestGroup) {
                orderedGroups.push(yesterdayRestGroup); // rest group goes first
            }

            console.log("Ordered groups (harusnya yesterday rest yang pertama) : " + JSON.stringify(orderedGroups))

            const withUnplayed = [];
            const allPlayed = [];

            for (const group of todayGroups) {
                const caddies = group.caddies;
                const playedCaddies = yesterdayOnField.map(o => o.id_caddy);

                const hasUnplayed = caddies.some(c => !playedCaddies.includes(c.id));``

                if (hasUnplayed) {
                    withUnplayed.push(group);
                } else {
                    allPlayed.push(group);
                }
            }

            orderedGroups = [...orderedGroups, ...withUnplayed, ...allPlayed];

            // Step 4: Insert schedules
            for (let i = 0; i < orderedGroups.length - 1; i++) {
                const group = orderedGroups[i];

                await prisma.schedule.create({
                    data: {
                        date: currentDate,
                        shift: 0, // or random shift if needed
                        urutan: i + 1,
                        id_caddy_group: group.id
                    }
                });

                const dataSchedule = {
                    date: dateStr,
                    shift: 0, // or random shift if needed
                    urutan: i + 1,
                    id_caddy_group: group.id
                }

                console.log("Yang mau di insert ke schedule: " + JSON.stringify(dataSchedule))

                // Step 5: Random OnField seeding
                const caddies = group.caddies;
                if (caddies.length > 0) {
                    const numToPlay = Math.max(1, Math.floor(Math.random() * caddies.length));
                    const shuffled = [...caddies].sort(() => Math.random() - 0.5);
                    const chosen = shuffled.slice(0, numToPlay);

                    for (const caddy of chosen) {
                        await prisma.onField.create({
                            data: {
                                date_turun: currentDate,
                                id_caddy: caddy.id,
                                // id_caddy_group: group.id,
                                kode: "567",
                                nama_pemain: "Rusdi",
                                booked: false,
                                status: 0,
                                wood_quantity: 5,
                                iron_quantity: 5,
                                putter_quantity: 5,
                                umbrella_quantity: 0
                            }
                        });

                        const dataCaddie = {
                            date: dateStr,
                            id_caddy: caddy.id,
                            id_caddy_group: group.id
                        }

                        console.log("Yang mau di insert ke on field : " + dataCaddie)
                    }
                }
            }

            // Move to next day
            currentDate = addDays(currentDate, 1);
        }

        res.status(200).json({
            message: `Successfully seeded schedules and onfield from ${start} to ${end}`
        });
    } catch (error) {
        console.error("Seeding error: ", error);
        res.status(500).json({ message: "Error during seeding", error });
    } finally {
        await prisma.$disconnect();
    }
};

export default seedSchedulesAndOnField;
