import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postBooking = async (req, res) => {
  try {
    const checkout = await prisma.booking.create({
      data: {
        ...req.body,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Create booking gagal",
      error: error.message,
    });
  }
};

export default postBooking;
