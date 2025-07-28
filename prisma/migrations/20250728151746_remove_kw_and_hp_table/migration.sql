/*
  Warnings:

  - You are about to drop the `Horse_Power` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kilo_Watt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category_Config" DROP CONSTRAINT "Category_Config_horse_power_id_fkey";

-- DropForeignKey
ALTER TABLE "Category_Config" DROP CONSTRAINT "Category_Config_kilo_watt_id_fkey";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Horse_Power";

-- DropTable
DROP TABLE "Kilo_Watt";
