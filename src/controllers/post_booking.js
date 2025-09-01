import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import crypto from "crypto";

const postBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        ...req.body,
        date: new Date(req.body.date),
      },
    });

    res.status(201).json({
      message: "Create booking berhasil",
      data: booking,
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
