/*
  Warnings:

  - The `cheque_date` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "cheque_date",
ADD COLUMN     "cheque_date" VARCHAR(20);
