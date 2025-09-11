import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getScheduleAfter = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    const schedulesRaw = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        caddy_group: {
          include: {
            caddies: true,
          },
        },
      },
      orderBy: {
        urutan: "asc",
      },
    });

    const schedules = schedulesRaw.map((s) => ({
      ...s,
      group_name: s.caddy_group.group_name,
      allCaddiesDetail: s.caddy_group.caddies,
      caddy_group: undefined,
    }));

    res.status(200).json({
      message: "Get Schedule After berhasil",
      data: schedules.length > 0 ? schedules : [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Get Schedule After gagal",
      error: error.message,
    });
  }
};
//yabegitulah
export default getScheduleAfter;
