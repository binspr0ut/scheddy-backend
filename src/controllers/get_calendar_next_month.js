import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCalendarNextMonth = async (req, res) => {
    try {
    const month = req.params.month;
    const year = new Date().getFullYear();
    const start = new Date(`${year}-${month}-1`);
    const end = new Date(year, month + 1, 0);

    const liburRaw = await prisma.libur.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        caddy_group: {
          select: {
            group_name: true,
          },
        },
      },
    });

    const bookingRaw = await prisma.booking.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        caddy: {
          select: {
            name: true,
          },
        },
      },
    });

    const libur = liburRaw.map((l) => ({
      ...l,
      group_name: l.caddy_group?.group_name || null,
      caddy_group: undefined,
    }));

    const booking = bookingRaw.map((b) => ({
      ...b,
      caddy_name: b.caddy?.name || null,
      caddy: undefined,
    }));

    res.status(200).json({
      message: "Get calendar berhasil",
      data: {
        bulan: month,
        libur: libur,
        booking: booking,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Get calendar gagal",
      error: error.message,
    });
  }
}

export default getCalendarNextMonth;