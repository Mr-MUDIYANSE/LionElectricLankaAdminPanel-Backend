-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "status_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
