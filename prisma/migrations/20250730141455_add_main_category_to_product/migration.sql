/*
  Warnings:

  - Added the required column `main_category_id` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "main_category_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_main_category_id_fkey" FOREIGN KEY ("main_category_id") REFERENCES "Main_Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
