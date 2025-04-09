-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY', 'GT', 'LT');

-- CreateEnum
CREATE TYPE "SortDirection" AS ENUM ('ASC', 'DESC');

-- CreateTable
CREATE TABLE "View" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "operator" "FilterType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sort" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "direction" "SortDirection" NOT NULL,

    CONSTRAINT "Sort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HiddenColumns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_HiddenColumns_AB_unique" ON "_HiddenColumns"("A", "B");

-- CreateIndex
CREATE INDEX "_HiddenColumns_B_index" ON "_HiddenColumns"("B");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sort" ADD CONSTRAINT "Sort_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sort" ADD CONSTRAINT "Sort_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HiddenColumns" ADD CONSTRAINT "_HiddenColumns_A_fkey" FOREIGN KEY ("A") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HiddenColumns" ADD CONSTRAINT "_HiddenColumns_B_fkey" FOREIGN KEY ("B") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;
