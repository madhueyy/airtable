import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { nanoid } from "nanoid";

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

      const table = await ctx.db.table.create({
        data: {
          id: tableId,
          name: tableName,
          base: { connect: { id: input.baseId } },
        },
      });

      // Make new columns
      const columnId1 = nanoid();
      const colRes = await ctx.db.column.createMany({
        data: [
          { id: columnId1, tableId: tableId, columnNum: 1, columnType: "TEXT" },
        ],
      });

      // Make new rows
      const rowNum = 3;
      const cellsData = [];
      for (let i = 1; i <= rowNum; i++) {
        cellsData.push({
          tableId,
          columnId: columnId1,
          columnNum: 1,
          rowNum: i,
          value: "",
        });
      }

      const cellRes = await ctx.db.cell.createMany({
        data: cellsData,
      });

      console.log(cellRes);

      return { id: table.id, name: table.name };
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

      const columns = await ctx.db.column.findMany({
        where: { tableId },
      });

      const cells = await ctx.db.cell.findMany({
        where: { tableId },
      });

      return { columns, cells };
    }),
});
