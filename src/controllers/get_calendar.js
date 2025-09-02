import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCalendar = async (req, res) => {
  try {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const start = new Date(`${year}-${month}-1`);
    const end = new Date(`${year}-${month}-31`);

    const libur = await prisma.libur.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const booking = await prisma.booking.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    res.status(200).json({
      message: "Get calendar berhasil",
      data: {
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
};

export default getCalendar;
