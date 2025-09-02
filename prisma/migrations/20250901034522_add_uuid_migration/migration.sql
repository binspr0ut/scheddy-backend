/*
  Warnings:

  - The primary key for the `CaddyGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Caddy" DROP CONSTRAINT "Caddy_id_caddy_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Libur" DROP CONSTRAINT "Libur_id_caddy_group_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_id_caddy_group_fkey";

-- AlterTable
ALTER TABLE "public"."Caddy" ALTER COLUMN "id_caddy_group" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."CaddyGroup" DROP CONSTRAINT "CaddyGroup_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CaddyGroup_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CaddyGroup_id_seq";

-- AlterTable
ALTER TABLE "public"."Libur" ALTER COLUMN "id_caddy_group" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Schedule" ALTER COLUMN "id_caddy_group" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."Caddy" ADD CONSTRAINT "Caddy_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Libur" ADD CONSTRAINT "Libur_id_caddy_group_fkey" FOREIGN KEY ("id_caddy_group") REFERENCES "public"."CaddyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
