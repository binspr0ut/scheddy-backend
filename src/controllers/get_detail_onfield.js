import prisma from "../configs/prisma.js";

const getDetailOnField = async (req, res) => {
  try {
    const { id_caddy } = req.query; // ambil dari query parameter ?id_caddy=xxx

    if (!id_caddy) {
      return res.status(400).json({
        success: false,
        message: "id_caddy parameter is required",
      });
    }

    // ambil 1 data onfield untuk caddy tertentu dengan status = 0
    const onField = await prisma.onfield.findFirst({
      where: {
        id_caddy,
        status: 0,
      },
      select: {
        id: true,
        id_caddy: true,
        kode: true,
        nama_pemain: true,
        date_turun: true,
        booked: true,
        jumlah_hole: true,
        wood_quantity: true,
        iron_quantity: true,
        putter_quantity: true,
        umbrella_quantity: true,
        other_items: true,
        caddy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!onField) {
      return res.status(404).json({
        success: false,
        message: "No active onfield record found for this caddy",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail onfield retrieved successfully",
      data: onField,
    });
  } catch (error) {
    console.error("Error fetching detail onfield:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getDetailOnField;
