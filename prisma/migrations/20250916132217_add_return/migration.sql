-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'RETURN';

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "total_amount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice_Item" ADD COLUMN     "discount_amount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "returned_qty" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Product_Return" (
    "id" SERIAL NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "return_qty" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return_Item" (
    "id" SERIAL NOT NULL,
    "returned_qty" INTEGER DEFAULT 0,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_return_id" INTEGER NOT NULL,

    CONSTRAINT "Return_Item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product_Return" ADD CONSTRAINT "Product_Return_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return_Item" ADD CONSTRAINT "Return_Item_product_return_id_fkey" FOREIGN KEY ("product_return_id") REFERENCES "Product_Return"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
