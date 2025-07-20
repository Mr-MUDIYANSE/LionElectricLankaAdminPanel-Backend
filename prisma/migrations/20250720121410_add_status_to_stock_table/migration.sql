/*
  Warnings:

  - Made the column `status_id` on table `Stock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_status_id_fkey";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "status_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
