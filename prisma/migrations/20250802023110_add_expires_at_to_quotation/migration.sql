/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Quotation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `Quotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_id_key" ON "Quotation"("id");
