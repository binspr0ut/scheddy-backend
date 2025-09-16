import prisma from "../configs/prisma.js";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// get caddy dengan status onfield pada hari ini
const getCaddyOnField = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // console.log("Start Of Day: " + startOfDay)
    // console.log("End Of Day: " + endOfDay)
    // console.log("Today: " + today)

    const groups = await prisma.caddyGroup.findMany({
      select: {
        group_name: true,
        caddies: {
          where: {
            onFields: {
              some: {
                status: 0,
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

    // Bentuk ulang JSON
    const result = groups.map((g) => {
      const sortedCaddies = g.caddies
        .map((c) => ({
          id: c.id,
          nama: c.name,
          date_turun: c.onFields.length > 0 ? c.onFields[0].date_turun : null,
        }))
        .sort((a, b) => {
          if (!a.date_turun) return 1;
          if (!b.date_turun) return -1;
          return new Date(a.date_turun) - new Date(b.date_turun);
        });
    
      return {
        group: {
          nama: g.group_name,
          caddies: sortedCaddies,
        },
      };
    });

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
