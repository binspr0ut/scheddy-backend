import prisma from "../configs/prisma.js";

// set tanggal hari ini
const today = new Date();
const startOfDay = new Date(today.setHours(0, 0, 0, 0));
const endOfDay = new Date(today.setHours(23, 59, 59, 999));

// get caddy dengan status onfield pada hari ini
const getCaddyOnField = async (req, res) => {
  try {
    const groups = await prisma.caddyGroup.findMany({
      select: {
        group_name: true,           // join tabel group dan caddy
        caddies: {
          where: {
            onFields: {             // join tabel onfield
              some: {
                status: 0,          // filter status onfield
                date_turun: {       // filter hanya yang tanggalnya hari ini
                  gte: startOfDay,  // gte = greater than or equal
                  lte: endOfDay,    // lt = less than
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Bentuk ulang JSON ke struktur yang diinginkan
    const result = groups.map((g) => ({
      group: {
        nama: g.group_name,
        caddies: g.caddies.map((c) => ({
          id: c.id,
          nama: c.name,
        })),
      },
    }));

    if (!result.length || result.every((g) => g.group.caddies.length === 0)) {
      return res.status(404).json({
        success: false,
        message: "No caddy onfield found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Caddy onfield retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching caddy onfield:", error);

    // Fallback error umum
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getCaddyOnField;
