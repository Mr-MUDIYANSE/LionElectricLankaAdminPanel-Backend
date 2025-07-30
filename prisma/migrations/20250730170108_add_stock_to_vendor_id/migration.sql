/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_vendorId_fkey";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "vendorId",
ADD COLUMN     "vendor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
