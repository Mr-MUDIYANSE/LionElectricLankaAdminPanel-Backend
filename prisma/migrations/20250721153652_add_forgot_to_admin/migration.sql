/*
  Warnings:

  - You are about to drop the column `reset_token_expires` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "reset_token_expires",
ADD COLUMN     "reset_token" VARCHAR(100),
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);
