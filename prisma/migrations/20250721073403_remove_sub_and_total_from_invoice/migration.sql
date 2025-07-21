/*
  Warnings:

  - You are about to drop the column `sub_total` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "sub_total",
DROP COLUMN "total_amount";
