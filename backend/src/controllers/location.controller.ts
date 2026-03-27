import { Context } from "koa";
import { LocationModel } from "@/models/location.model";
import { logger } from "@/utils/logger";

export const LocationController = {
  async create(ctx: Context) {
    const { name, parentId } = ctx.request.body as any;

    if (!name?.trim()) {
      ctx.throw(400, "Invalid location name");
    }

    try {
      const location = await LocationModel.create(name, parentId);

      logger.info(
        { location, userId: ctx.state.user?.id },
        "Created new location",
      );

      ctx.status = 201;
      ctx.body = location;
    } catch (error: any) {
      logger.error(
        { error, userId: ctx.state.user?.id },
        "Error creating location",
      );
      if (error.code === "23505") ctx.throw(409, "Location already exists");
      throw error; // Let the errorHandler middleware handle 500s
    }
  },

  async update(ctx: Context) {
    const { id, name, parentId } = ctx.request.body as any;
    if (!id) ctx.throw(400, "Invalid location ID");

    const updated = await LocationModel.update(id, name, parentId);
    if (!updated) ctx.throw(404, "Location not found");

    logger.info(
      { locationId: id, userId: ctx.state.user?.id },
      "Updated location",
    );

    ctx.body = updated;
  },

  async delete(ctx: Context) {
    const { id } = ctx.request.body as any;
    const deleted = await LocationModel.delete(id);
    if (!deleted) ctx.throw(404, "Location not found");

    logger.info(
      { locationId: id, userId: ctx.state.user?.id },
      "Deleted location",
    );

    ctx.body = { id: deleted.id, message: "Deleted successfully" };
  },
};
