import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getCalendar = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Get calendar gagal",
      error: error.message,
    });
  }
};
