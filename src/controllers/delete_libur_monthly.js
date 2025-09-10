import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const deleteLiburByMonth = async (req, res) => {
  try {
    const { bulan } = req.body; // contoh: "09 2025" (atau "01 2025")

    if (!bulan) {
      return res.status(400).json({
        success: false,
        message: "Bulan harus disertakan",
      });
    }

    // Parsing bulan dan tahun dari request body
    const [monthNum, yearStr] = bulan.split(" ");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthNum, 10) - 1; // 0 = Jan

    const startDate = new Date(year, monthIndex, 1, 0, 0, 0);
    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0);

    // Hapus semua data libur dalam bulan tsb
    const deleted = await prisma.libur.deleteMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Berhasil menghapus ${deleted.count} data libur di bulan ${bulan}`,
    });
  } catch (err) {
    console.error("ERROR deleteLiburByMonth:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus data libur",
      error: err.message,
    });
  }
};

export default deleteLiburByMonth;
