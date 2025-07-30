/*
  Warnings:

  - A unique constraint covering the columns `[company_name]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vendor_contact_no_key";

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "contact_no" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_company_name_key" ON "Vendor"("company_name");
