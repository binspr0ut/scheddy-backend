import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCaddyAvailable = async (req, res) => {
  try {
    const today = new Date(req.params.date);
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const caddies = await prisma.booking.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    res.status(200).json({
      message: "Get caddy available berhasil",
      data: caddies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Get caddy available gagal",
      error: error.message,
    });
  }
};

export default getCaddyAvailable;
