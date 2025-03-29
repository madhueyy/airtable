-- CreateEnum
CREATE TYPE "ColumnType" AS ENUM ('TEXT', 'NUMBER');

-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "columnNum" INTEGER NOT NULL,
    "columnType" "ColumnType" NOT NULL,
    "tableId" TEXT NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cell" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "columnNum" INTEGER NOT NULL,
    "rowNum" INTEGER NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Column_columnNum_key" ON "Column"("columnNum");

-- CreateIndex
CREATE UNIQUE INDEX "Column_tableId_columnNum_key" ON "Column"("tableId", "columnNum");

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_tableId_columnNum_fkey" FOREIGN KEY ("tableId", "columnNum") REFERENCES "Column"("tableId", "columnNum") ON DELETE CASCADE ON UPDATE CASCADE;
