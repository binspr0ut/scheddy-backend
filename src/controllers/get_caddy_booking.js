import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCaddyBooking = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (!date) {
      return res.status(400).json({ message: "Parameter date wajib diisi" });
    }

    const caddies = await prisma.caddy.findMany({
      where: {
        bookings: {
          none: {
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 59)),
            },
          },
        },
      },
    });
    res.status(200).json({
      message: "Get caddies for booking berhasil",
      data: caddies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get caddy for booking gagal",
      error: error.message,
    });
  }
};

export default getCaddyBooking;
