import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCalendarDetail = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (!date) {
      return res.status(400).json({ message: "Parameter date wajib diisi" });
    }
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 59));

    const libur = await prisma.libur.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
    });

    const booking = await prisma.libur.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
    });

    res.status(200).json({
      message: "Get calendar detail berhasil",
      data: {
        libur: libur,
        booking: booking,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Get calendar detail gagal",
      error: error.message,
    });
  }
};

export default getCalendarDetail;
