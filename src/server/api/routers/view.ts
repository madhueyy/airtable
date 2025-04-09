import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { nanoid } from "nanoid";
import { ColumnType, FilterType, SortDirection } from "@prisma/client";

export const viewRouter = createTRPCRouter({
  createView: protectedProcedure
    .input(
      z.object({
        tableId: z.string().min(1, "Table ID is required"),
        viewName: z.string().min(1, "View name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const views = await ctx.db.view.findMany({
        where: { tableId: input.tableId },
      });

      const viewName = input.viewName;
      const viewId = nanoid();

      const view = await ctx.db.view.create({
        data: {
          id: viewId,
          name: viewName,
          table: { connect: { id: input.tableId } },
        },
      });

      console.log(view);
      return view;
    }),

  getViewsByTable: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.view.findMany({
        where: { tableId: input.tableId },
        orderBy: { name: "asc" },
      });
    }),

  getViewConfig: publicProcedure
    .input(z.object({ viewId: z.string() }))
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { id: input.viewId },
        include: {
          filters: true,
          sorts: true,
          hiddenColumns: true,
        },
      });
      return {
        filters: view?.filters ?? [],
        sorts: view?.sorts ?? [],
        hiddenColumns: view?.hiddenColumns.map((col) => col.id) ?? [],
      };
    }),

  saveViewConfig: publicProcedure
    .input(
      z.object({
        viewId: z.string(),
        filters: z.array(
          z.object({
            columnId: z.string(),
            filterType: z.string(),
            value: z.string(),
          }),
        ),
        sorts: z.array(
          z.object({
            columnId: z.string(),
            direction: z.enum(["asc", "desc"]),
          }),
        ),
        hiddenColumns: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First, get the current view to compare what needs to be updated
      const currentView = await ctx.db.view.findUnique({
        where: { id: input.viewId },
        include: {
          filters: true,
          sorts: true,
          hiddenColumns: true,
        },
      });

      if (!currentView) {
        throw new Error(`View with ID ${input.viewId} not found`);
      }

      // Use a transaction for all operations
      return ctx.db.$transaction(async (tx) => {
        // 1. Handle filters: Delete existing and create new ones
        await tx.filter.deleteMany({
          where: { viewId: input.viewId },
        });

        if (input.filters.length > 0) {
          await tx.filter.createMany({
            data: input.filters.map((filter) => ({
              id: nanoid(),
              viewId: input.viewId,
              columnId: filter.columnId,
              operator: filter.filterType.toUpperCase() as FilterType,
              value: filter.value,
            })),
          });
        }

        // 2. Handle sorts: Delete existing and create new ones
        await tx.sort.deleteMany({
          where: { viewId: input.viewId },
        });

        if (input.sorts.length > 0) {
          await tx.sort.createMany({
            data: input.sorts.map((sort) => ({
              id: nanoid(),
              viewId: input.viewId,
              columnId: sort.columnId,
              direction: sort.direction.toUpperCase() as SortDirection,
            })),
          });
        }

        // 3. Handle hidden columns
        // First disconnect all columns
        await tx.view.update({
          where: { id: input.viewId },
          data: {
            hiddenColumns: {
              disconnect: currentView.hiddenColumns.map((col) => ({
                id: col.id,
              })),
            },
          },
        });

        // Then connect new hidden columns
        if (input.hiddenColumns.length > 0) {
          await tx.view.update({
            where: { id: input.viewId },
            data: {
              hiddenColumns: {
                connect: input.hiddenColumns.map((colId) => ({ id: colId })),
              },
            },
          });
        }

        // Return the updated view
        return tx.view.findUnique({
          where: { id: input.viewId },
          include: {
            filters: true,
            sorts: true,
            hiddenColumns: true,
          },
        });
      });
    }),
});
