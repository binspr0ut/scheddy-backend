import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const getCaddyBooking = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const booked = await prisma.booking.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        res.status(200).json({
            message: "Berhasil mendapatkan daftar Caddy yang di booking hari ini",
            data: booked
        })
    } catch (error) {
        console.log("Get Caddy Booking error: " + error)
    }
}

export default getCaddyBooking