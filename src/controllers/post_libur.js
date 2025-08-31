import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postLibur = async (req, res) => {
  try {
    const libur = await prisma.libur.create({
      data: {
        ...req.body,
      },
    });

    res.status(200).json({
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
