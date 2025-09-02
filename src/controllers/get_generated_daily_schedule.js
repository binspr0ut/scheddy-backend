import { endOfDay, startOfDay, subDays, addDays } from "date-fns";
import prisma from "../configs/prisma.js";

const finalResult = [];

const getGeneratedSchedule = async (req, res) => {
  try {

    // set tanggal
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);

    // Get today’s onField entries
    const hasOnFieldToday = await prisma.onField.findMany({
      where: {
        date_turun: {
          gte: startOfDay(today),
          lt: endOfDay(today),
        },
      },
      select: {
        id_caddy: true,
      },
    });

    const hasOnFieldIds = hasOnFieldToday.map(c => c.id_caddy);

    // hitung jumlah turun per caddy
    const turunCountMap = {};

    hasOnFieldIds.forEach(id => {
      if (!turunCountMap[id]) {
        turunCountMap[id] = 1;
      } else {
        turunCountMap[id] += 1;
      }
    });

    // Get group libur tomorrow
    const groupLiburTomorrow = await prisma.libur.findFirst({
      where: {
        date: {
           gte: startOfDay(tomorrow),
           lt: endOfDay(tomorrow),
        },
      },
      select: {
        caddy_group: {
           select: {
            group_name: true,
           },
        },
      },
    });

    const liburTomorrow = groupLiburTomorrow?.caddy_group?.group_name;
    
    // Get group libur yesterday
    const groupLiburYesterday = await prisma.libur.findFirst({
      where: {
        date: {
          gte: startOfDay(yesterday),
          lt: endOfDay(yesterday),
        },
      },
      select: {
        caddy_group: {
          select: {
            group_name: true,
          },
        },
      },
    });

    const liburYesterday = groupLiburYesterday?.caddy_group?.group_name;

    // Group yang akan dihitung dan diurutkan
    const allGroups = await prisma.caddyGroup.findMany({
      include: {
        caddies: {
          select: { id: true, name: true },
        },
      },
    });

    const countedGroups = allGroups.filter(
      g => g.group_name !== liburTomorrow && g.group_name !== liburYesterday
    );

    // hitung caddies tidak onfield hari ini pada setiap group
    const result = countedGroups.map(g => {
      const notOnField = g.caddies.filter(c => !hasOnFieldIds.includes(c.id));
  
      const allCaddiesDetail = g.caddies.map(c => ({
        id: c.id,
        name: c.name,
        turunCount: turunCountMap[c.id] || 0,
      }));
  
      return {
        group_name: g.group_name,
        notOnFieldCount: notOnField.length,
        allCaddiesDetail,
      };
    });
  
    // Urutkan
    const sortedResult = result.sort((a, b) => b.notOnFieldCount - a.notOnFieldCount);
  
    // Tambahkan group_order setelah sorting
    const finalGroups = sortedResult.map((g, index) => ({
      ...g,
      group_order: index + 1, // urut setelah sort
    }));
  
    // Susun finalResult
    const finalResult = [
      ...(groupLiburYesterday?.caddy_group?.group_name
        ? [
          {
            "Libur Yesterday": {
              groups: [{ group_name: groupLiburYesterday.caddy_group.group_name }],
            },
          },
        ]
      : []),
      {
        "Generated Schedule": {
          groups: finalGroups,
        },
      },
    ];
  

    res.status(200).json({
      message:
        "Berhasil mendapatkan daftar Caddy sesuai urutan dengan sorting berdasarkan OnField kemarin",
      data: finalResult,
    });
  } catch (error) {
    console.log("Get Caddy Standby Sorted ada yang error : " + error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default getGeneratedSchedule;
