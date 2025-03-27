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
});
