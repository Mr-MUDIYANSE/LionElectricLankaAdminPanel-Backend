-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_vendorId_fkey";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "vendorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
