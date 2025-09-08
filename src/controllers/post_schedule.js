import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postSchedule = async (req, res) => {
  try {
    const schedules = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res
        .status(400)
        .json({ message: "Body harus berupa array data schedule" });
    }

    const data = schedules.map((item, index) => ({
      id: crypto.randomUUID(),
      id_caddy_group: item.id_caddy_group,
      urutan: item.urutan ?? index + 1,
      date: new Date(item.date),
      shift: item.shift,
    }));

    const result = await prisma.schedule.createMany({
      data: data,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: "Schedule berhasil ditambahkan",
      count: result.count,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Post schedule gagal",
      error: error.message,
    });
  }
};

export default postSchedule;
