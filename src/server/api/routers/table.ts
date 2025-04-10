import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { nanoid } from "nanoid";
import { ColumnType } from "@prisma/client";
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(
      z.object({
        baseId: z.string().min(1, "Base ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tables = await ctx.db.table.findMany({
        where: { baseId: input.baseId },
      });

      const tableName = `Table ${tables.length + 1}`;
      const tableId = nanoid();
      const columnId1 = nanoid();
      const viewId = nanoid();
      const rowNum = 3;

      const table = await ctx.db.table.create({
        data: {
          id: tableId,
          name: tableName,
          base: { connect: { id: input.baseId } },
          columns: {
            create: [
              {
                id: columnId1,
                name: "Name",
                columnNum: 1,
                columnType: "TEXT",
                cells: {
                  create: Array.from({ length: rowNum }, (_, i) => ({
                    rowNum: i + 1,
                    value: faker.person.fullName(),
                    tableId: tableId,
                    columnNum: 1,
                  })),
                },
              },
            ],
          },
          views: {
            create: [
              {
                id: viewId,
                name: "Grid view",
              },
            ],
          },
        },
        include: {
          columns: {
            include: {
              cells: true,
            },
          },
          views: true,
        },
      });

      console.log(table);
      return table;
    }),

  getTables: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tables = await ctx.db.table.findMany({
        where: {
          baseId: input.id,
        },
      });

      console.log("hi");

      if (!tables || tables.length === 0) {
        throw new Error("No tables found");
      }

      return tables;
    }),

  getTable: publicProcedure
    .input(
      z.object({
        tableId: z.string(),
        viewId: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tableId, viewId, limit, cursor } = input;

      let viewConfig = null;
      if (viewId) {
        viewConfig = await ctx.db.view.findUnique({
          where: { id: viewId },
          select: { sorts: true },
        });
      }

      const table = await ctx.db.table.findUnique({
        where: { id: tableId },
        include: {
          columns: {
            orderBy: {
              columnNum: "asc",
            },
            include: {
              cells: true,
            },
          },
        },
      });

      if (!table || !limit) {
        throw new Error("no table or no limit");
      }

      let rowQuery = {};
      if (cursor !== undefined) {
        rowQuery = {
          rowNum: {
            gt: cursor,
          },
        };
      }

      for (const column of table.columns) {
        column.cells = await ctx.db.cell.findMany({
          where: {
            columnId: column.id,
            ...rowQuery,
          },
          orderBy: {
            rowNum: "asc",
          },
          take: limit,
        });
      }

      // If column sort exists then apply,
      // else apply default order (by rowNum)
      if (viewConfig?.sorts && viewConfig.sorts.length > 0 && table) {
        for (const column of table.columns) {
          // Find if this specific column has sorts
          const columnSort = viewConfig.sorts.find(
            (sort) => sort.columnId === column.id,
          );

          if (columnSort) {
            if (column.columnType === "NUMBER") {
              column.cells.sort((a, b) => {
                const aNum = Number(a.value) || 0;
                const bNum = Number(b.value) || 0;
                return columnSort.direction.toLowerCase() === "asc"
                  ? aNum - bNum
                  : bNum - aNum;
              });
            } else {
              column.cells.sort((a, b) => {
                return columnSort.direction.toLowerCase() === "asc"
                  ? a.value.localeCompare(b.value)
                  : b.value.localeCompare(a.value);
              });
            }
          } else {
            column.cells.sort((a, b) => a.rowNum - b.rowNum);
          }
        }
      } else if (table) {
        for (const column of table.columns) {
          column.cells.sort((a, b) => a.rowNum - b.rowNum);
        }
      }

      let nextCursor: typeof cursor | undefined = undefined;
      let maxRowNum = -1;

      for (const column of table.columns) {
        for (const cell of column.cells) {
          if (cell.rowNum > maxRowNum) {
            maxRowNum = cell.rowNum;
          }
        }
      }

      if (table?.columns.some((col) => col.cells.length === limit)) {
        nextCursor = maxRowNum;
      }

      return { table, nextCursor };
    }),

  getHighlightedCells: publicProcedure
    .input(z.object({ tableId: z.string(), searchQuery: z.string() }))
    .query(async ({ ctx, input }) => {
      const { tableId, searchQuery } = input;

      const highlightedCells = await ctx.db.cell.findMany({
        where: {
          tableId,
          value: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      return highlightedCells.map((cell) => cell.id);
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        id: z.string(),
        name: z.string(),
        columnNum: z.number(),
        columnType: z.nativeEnum(ColumnType),
        cells: z.array(
          z.object({
            rowNum: z.number(),
            value: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.column.create({
        data: {
          id: input.id,
          tableId: input.tableId,
          name: input.name,
          columnNum: input.columnNum,
          columnType: input.columnType,
          cells: {
            create: input.cells.map((cell) => ({
              rowNum: cell.rowNum,
              value: cell.value,
              columnNum: input.columnNum,
              table: {
                connect: { id: input.tableId },
              },
            })),
          },
        },
        include: { cells: true },
      });

      return column;
    }),

  addRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        cells: z.array(
          z.object({
            id: z.string(),
            rowNum: z.number(),
            value: z.string(),
            columnId: z.string(),
            columnNum: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: {
          columns: true,
        },
      });

      const newCells = input.cells.map((cell) => ({
        id: cell.id,
        rowNum: cell.rowNum,
        value: cell.value,
        tableId: input.tableId,
        columnId: cell.columnId,
        columnNum: cell.columnNum,
      }));

      await ctx.db.cell.createMany({
        data: newCells,
      });

      const updatedTable = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: {
          columns: {
            include: {
              cells: true,
            },
          },
        },
      });

      return updatedTable;
    }),

  updateCellValue: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        cellId: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedCell = await ctx.db.cell.update({
        where: {
          id: input.cellId,
        },
        data: {
          value: input.value,
        },
      });

      return updatedCell;
    }),

  editColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        columnId: z.string(),
        newType: z.nativeEnum(ColumnType),
        newName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedColumn = await ctx.db.column.update({
        where: {
          id: input.columnId,
        },
        data: {
          name: input.newName,
          columnType: input.newType,
        },
      });

      return updatedColumn;
    }),

  editTableName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Table name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTable = await ctx.db.table.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      return updatedTable;
    }),

  deleteTable: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.table.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  deleteColumn: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.column.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
