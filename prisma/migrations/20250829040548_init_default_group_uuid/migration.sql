/*
  Warnings:

  - The `id_group` column on the `Caddy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Group` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[group_name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id_group` on the `Libur` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_group` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Caddy" DROP CONSTRAINT "Caddy_id_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Libur" DROP CONSTRAINT "Libur_id_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_id_group_fkey";

-- AlterTable
ALTER TABLE "public"."Caddy" DROP COLUMN "id_group",
ADD COLUMN     "id_group" INTEGER;

-- AlterTable
ALTER TABLE "public"."Group" DROP CONSTRAINT "Group_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Libur" DROP COLUMN "id_group",
ADD COLUMN     "id_group" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "id_group",
ADD COLUMN     "id_group" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_group_name_key" ON "public"."Group"("group_name");

-- AddForeignKey
ALTER TABLE "public"."Caddy" ADD CONSTRAINT "Caddy_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Libur" ADD CONSTRAINT "Libur_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
