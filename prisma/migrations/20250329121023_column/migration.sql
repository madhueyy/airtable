/*
  Warnings:

  - A unique constraint covering the columns `[rowNum]` on the table `Cell` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `columnId` to the `Cell` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_tableId_columnNum_fkey";

-- DropIndex
DROP INDEX "Column_tableId_columnNum_key";

-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "columnId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cell_rowNum_key" ON "Cell"("rowNum");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
