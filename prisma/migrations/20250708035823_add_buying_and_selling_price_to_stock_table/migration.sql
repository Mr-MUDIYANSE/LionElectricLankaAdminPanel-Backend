/*
  Warnings:

  - You are about to drop the column `unit_price` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `unit_buying_price` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_selling_price` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "unit_price",
ADD COLUMN     "unit_buying_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unit_selling_price" DOUBLE PRECISION NOT NULL;
