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
});
