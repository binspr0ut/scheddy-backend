import { PrismaClient } from "@prisma/client";
import { subDays, startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

const getCaddyStandbySorted = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);

    // 1. Get schedules with their groups
    const schedules = await prisma.schedule.findMany({
      include: {
        caddy_group: true,
      },
      orderBy: {
        urutan: "asc",
      },
    });

    // 2. Get yesterday’s onField entries
    const onFieldYesterday = await prisma.onField.findMany({
      where: {
        date_turun: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
      },
      select: {
        id_caddy: true,
      },
    });

    const caddiesOnFieldYesterday = new Set(
      onFieldYesterday.map((o) => o.id_caddy)
    );

    // 3. Attach caddies for each group, sorted + add urutan
    const schedulesWithCaddies = await Promise.all(
      schedules.map(async (schedule) => {
        const caddies = await prisma.caddy.findMany({
          where: {
            id_caddy_group: schedule.id_caddy_group,
          },
        });

        const notOnField = caddies.filter(
          (c) => !caddiesOnFieldYesterday.has(c.id)
        );
        const onField = caddies.filter((c) =>
          caddiesOnFieldYesterday.has(c.id)
        );

        // add urutan field to each caddy
        const sortedCaddies = [...notOnField, ...onField].map((caddy,index) => ({
          ...caddy,
          urutan: index + 1,
        }));

        return {
          ...schedule,
          caddies: sortedCaddies,
        };
      })
    );

    res.status(200).json({
      message:
        "Berhasil mendapatkan daftar Caddy sesuai urutan dengan sorting berdasarkan OnField kemarin",
      data: schedulesWithCaddies,
    });
  } catch (error) {
    console.log("Get Caddy Standby Sorted ada yang error bang : " + error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default getCaddyStandbySorted;
