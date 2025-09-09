import prisma from "../configs/prisma.js";

// get caddy dengan status done pada hari ini
const getCaddyDone = async (req, res) => {
  try {
    // set tanggal hari ini
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log("Start Of Day: " + startOfDay)
    console.log("End Of Day: " + endOfDay)
    console.log("Today: " + today)
    
    const groups = await prisma.caddyGroup.findMany({
      select: {
        group_name: true,
        caddies: {
          where: {
            onFields: {
              some: {
                status: 1,
                date_turun: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            onFields: {
              where: {
                status: 0,
                date_turun: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              orderBy: {
                date_turun: "asc",
              },
              select: {
                date_turun: true,
              },
            },
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
        message: "No caddy done found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Caddy done retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching caddy done:", error);

    // Fallback error umum
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getCaddyDone;
