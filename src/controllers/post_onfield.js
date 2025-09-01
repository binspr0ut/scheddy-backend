import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

const postOnField = async (req, res) => {
  try {
    const data = {
      id: crypto.randomUUID(),
      ...req.body,
      date_turun: new Date(req.body.date_turun),
      booked: req.body.booked ?? false,
      status: 0,
    };

    const newOnField = await prisma.onField.create({
      data,
    });

    res.status(201).json({
      message: "OnField berhasil ditambahkan",
      data: newOnField,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan OnField", error: error.message });
  }
};

export default postOnField;
