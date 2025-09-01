import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const postLibur = async (req, res) => {
  try {
    const libur = await prisma.libur.create({
      data: {
        id: crypto.randomUUID(),
        is_request: true,
        ...req.body,
      },
    });

    res.status(201).json({
      message: "Create libur berhasil",
      data: libur,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Create libur gagal",
      error: error.message,
    });
  }
};

export default postLibur;
