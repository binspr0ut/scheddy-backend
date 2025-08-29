/*
  Warnings:

  - The primary key for the `Caddy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `caddy_type` to the `Caddy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `Caddy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Caddy" DROP CONSTRAINT "Caddy_pkey",
ADD COLUMN     "caddy_type" INTEGER NOT NULL,
ADD COLUMN     "id_group" TEXT,
ADD COLUMN     "id_user" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Caddy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Caddy_id_seq";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "id_group" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Libur" (
    "id" TEXT NOT NULL,
    "id_group" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "is_request" BOOLEAN NOT NULL,

    CONSTRAINT "Libur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "id_caddy" TEXT NOT NULL,
    "nama_pemain" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnField" (
    "id" TEXT NOT NULL,
    "id_caddy" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama_pemain" TEXT NOT NULL,
    "date_turun" TIMESTAMP(3) NOT NULL,
    "booked" BOOLEAN NOT NULL,
    "jumlah_hole" INTEGER,
    "status" INTEGER NOT NULL,
    "wood_quantity" INTEGER NOT NULL,
    "iron_quantity" INTEGER NOT NULL,
    "putter_quantity" INTEGER NOT NULL,
    "umbrella_quantity" INTEGER NOT NULL,
    "other_items" TEXT,

    CONSTRAINT "OnField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Caddy" ADD CONSTRAINT "Caddy_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Caddy" ADD CONSTRAINT "Caddy_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Libur" ADD CONSTRAINT "Libur_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_id_caddy_fkey" FOREIGN KEY ("id_caddy") REFERENCES "public"."Caddy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnField" ADD CONSTRAINT "OnField_id_caddy_fkey" FOREIGN KEY ("id_caddy") REFERENCES "public"."Caddy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
