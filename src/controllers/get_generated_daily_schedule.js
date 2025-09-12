import { endOfDay, startOfDay, addDays } from "date-fns";
import prisma from "../configs/prisma.js";

const getGeneratedSchedule = async (req, res) => {
  try {
    // set tanggal
    const today = new Date();
    const tomorrow = addDays(today, 1);

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
      turunCountMap[id] = (turunCountMap[id] || 0) + 1;
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
            id: true,
            group_name: true,
            caddies: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Get group libur today
    const groupLiburToday = await prisma.libur.findFirst({
      where: {
        date: {
          gte: startOfDay(today),
          lt: endOfDay(today),
        },
      },
      select: {
        caddy_group: {
          select: {
            id: true,
            group_name: true,
            caddies: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Group yang akan dihitung dan diurutkan
    const allGroups = await prisma.caddyGroup.findMany({
      include: {
        caddies: {
          select: { id: true, name: true },
        },
      },
    });

    const countedGroups = allGroups.filter(
      g =>
        g.group_name !== groupLiburTomorrow?.caddy_group?.group_name &&
        g.group_name !== groupLiburToday?.caddy_group?.group_name
    );

    // hitung caddies tidak onfield hari ini pada setiap group
    const result = countedGroups.map(g => {
      const notOnField = g.caddies.filter(c => !hasOnFieldIds.includes(c.id));

      const allCaddiesDetail = g.caddies
        .map(c => ({
          id: c.id,
          name: c.name,
          turunCount: turunCountMap[c.id] || 0,
        }))
        .sort((a, b) => a.turunCount - b.turunCount); // urut ASC

      return {
        id_group: g.id,
        group_name: g.group_name,
        notOnFieldCount: notOnField.length,
        allCaddiesDetail,
      };
    });

    // Urutkan group berdasarkan jumlah caddy tidak onfield
    const sortedResult = result.sort(
      (a, b) => b.notOnFieldCount - a.notOnFieldCount
    );

    // Tambahkan group_order setelah sorting
    const finalGroups = sortedResult.map((g, index) => ({
      ...g,
      group_order: index + 1, // urut setelah sort
    }));

    // Susun finalResult
    const finalResult = [
      ...(groupLiburToday?.caddy_group
        ? [
            {
              "Libur Today": {
                groups: [
                  {
                    id_group: groupLiburToday.caddy_group.id,
                    group_name: groupLiburToday.caddy_group.group_name,
                    allCaddiesDetail: groupLiburToday.caddy_group.caddies
                      .map(c => ({
                        id: c.id,
                        name: c.name,
                        turunCount: turunCountMap[c.id] || 0,
                      }))
                      .sort((a, b) => a.turunCount - b.turunCount), // ASC
                  },
                ],
              },
            },
          ]
        : []),
      ...(groupLiburTomorrow?.caddy_group
        ? [
            {
              "Libur Tomorrow": {
                groups: [
                  {
                    id_group: groupLiburToday.caddy_group.id,
                    group_name: groupLiburTomorrow.caddy_group.group_name,
                    allCaddiesDetail: groupLiburTomorrow.caddy_group.caddies
                      .map(c => ({
                        id: c.id,
                        name: c.name,
                        turunCount: turunCountMap[c.id] || 0,
                      }))
                      .sort((a, b) => a.turunCount - b.turunCount), // ASC
                  },
                ],
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
