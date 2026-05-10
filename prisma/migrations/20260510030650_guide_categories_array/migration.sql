/*
  Warnings:

  - You are about to drop the column `category` on the `Guide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guide" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
