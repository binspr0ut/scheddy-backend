import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCaddyBooking = async (req, res) => {
  try {
    const caddies = await prisma.caddy.findMany();
    res.status(200).json(caddies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get caddy for booking gagal",
      error: error.message,
    });
  }
};

export default getCaddyBooking;
