/*
  Warnings:

  - You are about to alter the column `qty` on the `Invoice_Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `qty` on the `Quotation_Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Invoice_Item" ALTER COLUMN "qty" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Quotation_Item" ALTER COLUMN "qty" SET DATA TYPE INTEGER;
