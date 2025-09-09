import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay, subHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

const getCaddyStandbySorted = async (req, res) => {
  try {
    const timeZone = "Asia/Jakarta"; // WIB
    const now = new Date();
    const todayStartLocal = startOfDay(now);
    const todayEndLocal = endOfDay(now);

    console.log("Today Start: " + todayStartLocal)
    console.log("Today End: " + todayEndLocal)

    const todayStartShifted = subHours(todayStartLocal, 7);
    const todayEndShifted = subHours(todayEndLocal, 7);

    // Convert to UTC so it matches DB
    const todayStart = toZonedTime(todayStartShifted, timeZone);
    const todayEnd = toZonedTime(todayEndShifted, timeZone);

    console.log("Today Start UTC: " + todayStart)
    console.log("Today End UTC: " + todayEnd)

    // 1) Get ONLY today's schedules (still including the group), ordered by urutan
    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: { caddy_group: true },
      orderBy: { urutan: "asc" },
    });

    console.log("SCHEDULES TODAY BANG : " + JSON.stringify(schedules));

    // 2) Collect all caddy IDs that are on-field TODAY
    const onFieldToday = await prisma.onField.findMany({
      where: {
        date_turun: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: { id_caddy: true, status: true },
    });

    console.log("ON FIELD TODAY BANG: " + JSON.stringify(onFieldToday));

    const caddiesOnFieldToday = new Set(onFieldToday.map((o) => o.id_caddy));

    console.log("CADDIES ON FIELD TODAY BANG: " + [...caddiesOnFieldToday]);
    console.log("CADDIES ON FIELD TODAY BANG: " + caddiesOnFieldToday.size);

    // 3) For each schedule, attach ONLY caddies NOT on-field today, and add urutan
    const schedulesWithCaddies = await Promise.all(
      schedules.map(async (schedule) => {
        const caddies = await prisma.caddy.findMany({
          where: { id_caddy_group: schedule.id_caddy_group },
        });

        console.log("CADDIES BUAT GRUP : " + schedule.id_caddy_group + " ADA : " + caddies.length);

        // NOTE: If your Caddy model uses `id` (not `id_caddy`) as PK,
        // change `c.id_caddy` below to `c.id`.
        const standbyCaddies = caddies.filter(
          (c) => !caddiesOnFieldToday.has(c.id)
        );

        console.log("STANDBY CADDIES BANG: " + standbyCaddies.length);
        // console.log("STANDBY CADDIES BANG : " + JSON.stringify(standbyCaddies, null, 2));

        const caddiesWithOrder = standbyCaddies.map((caddy, index) => ({
          ...caddy,
          urutan: index + 1,
        }));

        return {
          ...schedule,
          caddies: caddiesWithOrder,
        };
      })
    );

    // (Structure is the same: { message: string, data: [...] })
    res.status(200).json({
      message:
        "Berhasil mendapatkan daftar Caddy standby untuk hari ini (exclude yang OnField hari ini).",
      data: schedulesWithCaddies,
    });
  } catch (error) {
    console.error("Get Caddy Standby Sorted error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default getCaddyStandbySorted;
