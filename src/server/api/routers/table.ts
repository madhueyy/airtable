import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { nanoid } from "nanoid";
import { ColumnType } from "@prisma/client";

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
                columnNum: 1,
                columnType: "TEXT",
                cells: {
                  create: Array.from({ length: rowNum }, (_, i) => ({
                    rowNum: i + 1,
                    value: "",
                    tableId: tableId,
                    columnNum: 1,
                  })),
                },
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
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { tableId } = input;

      const table = await ctx.db.table.findUnique({
        where: { id: tableId },
        include: {
          columns: {
            include: {
              cells: true,
            },
          },
        },
      });

      return table;
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        id: z.string(),
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

  updateColumnType: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        columnId: z.string(),
        newType: z.nativeEnum(ColumnType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedColumn = await ctx.db.column.update({
        where: {
          id: input.columnId,
        },
        data: {
          columnType: input.newType,
        },
      });

      return updatedColumn;
    }),
});
