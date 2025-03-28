import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { nanoid } from "nanoid";

export const baseRouter = createTRPCRouter({
  createBase: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Base name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const baseId = nanoid();

      const base = await ctx.db.base.create({
        data: {
          id: baseId,
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      // Make new table
      const tableId = nanoid();
      await ctx.db.table.create({
        data: {
          id: tableId,
          name: "Table 1",
          base: { connect: { id: baseId } },
        },
      });

      return { id: base.id, name: base.name };
    }),

  getBaseName: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.base.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!base) {
        throw new Error("Base not found");
      }

      return base;
    }),

  getBases: protectedProcedure.query(async ({ ctx }) => {
    const bases = await ctx.db.base.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
    });

    return bases;
  }),
});
