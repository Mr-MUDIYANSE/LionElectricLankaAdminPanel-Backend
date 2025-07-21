/*
  Warnings:

  - Added the required column `payment_status_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "payment_status_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Payment_Status" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_Status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_payment_status_id_fkey" FOREIGN KEY ("payment_status_id") REFERENCES "Payment_Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
