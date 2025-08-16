/*
  Warnings:

  - You are about to drop the column `cheque_date` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paid_amount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method_id` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status_id` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the `Payment_Method` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment_Status` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `total_amount` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CLEARED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_payment_status_id_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "cheque_date",
DROP COLUMN "paid_amount",
DROP COLUMN "payment_method_id",
DROP COLUMN "payment_status_id",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "total_amount" SET NOT NULL;

-- DropTable
DROP TABLE "Payment_Method";

-- DropTable
DROP TABLE "Payment_Status";

-- CreateTable
CREATE TABLE "Payment_History" (
    "id" SERIAL NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cheque_Details" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "cheque_number" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "cheque_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cheque_Details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cheque_Details_payment_id_key" ON "Cheque_Details"("payment_id");

-- AddForeignKey
ALTER TABLE "Payment_History" ADD CONSTRAINT "Payment_History_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque_Details" ADD CONSTRAINT "Cheque_Details_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment_History"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
