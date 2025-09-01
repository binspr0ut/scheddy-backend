import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const putUpdateDone = async (req, res) => {
  try {
    const update = await prisma.onField.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
      },
    });

    res.status(200).json({
      message: "Update data berhasil",
      data: update,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update gagal",
      error: error.message,
    });
  }
};

export default putUpdateDone;
