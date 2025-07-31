/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status_id` to the `Quotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "status_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_id_key" ON "Invoice"("id");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
