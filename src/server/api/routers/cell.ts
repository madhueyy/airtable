import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cellRouter = createTRPCRouter({
  getCells: publicProcedure
    .input(
      z.object({
        tableId: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tableId, cursor } = input;
      const limit = input.limit ?? 50;

      const cells = await ctx.db.cell.findMany({
        take: limit + 1,
        where: { tableId },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          rowNum: "asc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (cells.length > limit) {
        const nextItem = cells.pop() as (typeof cells)[number];
        nextCursor = nextItem.id;
      }

      return {
        cells,
        nextCursor,
      };
    }),
});
