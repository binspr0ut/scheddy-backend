import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const putCheckout = async (req, res) => {
  try {
    const checkout = await prisma.onField.update({
      where: { id: req.params.id },
      data: {
        status: 1,
        jumlah_hole: req.body.jumlah_hole,
      },
    });

    res.status(200).json({
      message: "Update data berhasil, checkout berhasil",
      data: checkout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Checkout gagal",
      error: error.message,
    });
  }
};

export default putCheckout;
