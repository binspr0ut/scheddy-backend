/*
  Warnings:

  - You are about to drop the column `id_group` on the `Caddy` table. All the data in the column will be lost.
  - You are about to drop the column `id_group` on the `Libur` table. All the data in the column will be lost.
  - You are about to drop the column `id_group` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_caddy_group` to the `Libur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_caddy_group` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Caddy" DROP CONSTRAINT "Caddy_id_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Libur" DROP CONSTRAINT "Libur_id_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_id_group_fkey";

-- AlterTable
ALTER TABLE "public"."Caddy" DROP COLUMN "id_group",
ADD COLUMN     "id_caddy_group" INTEGER;

-- AlterTable
ALTER TABLE "public"."Libur" DROP COLUMN "id_group",
ADD COLUMN     "id_caddy_group" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "id_group",
ADD COLUMN     "id_caddy_group" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Group";

-- CreateTable
CREATE TABLE "public"."CaddyGroup" (
    "group_name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "CaddyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaddyGroup_group_name_key" ON "public"."CaddyGroup"("group_name");

-- AddForeignKey
ALTER TABLE "public"."Caddy" ADD CONSTRAINT "Caddy_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Libur" ADD CONSTRAINT "Libur_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
