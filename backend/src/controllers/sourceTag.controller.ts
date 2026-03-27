import { SourceTagModel } from "@/models/sourceTag.model";
import { Context } from "koa";

export const SourceTagController = {
  async create(ctx: Context) {
    const { name } = ctx.request.body as any;

    if (!name?.trim()) {
      ctx.throw(400, "Invalid source tag name");
    }

    try {
      const sourceTag = await SourceTagModel.create(name);
      ctx.status = 201;
      ctx.body = sourceTag;
    } catch (error: any) {
      if (error.code === "23505") ctx.throw(409, "Source tag already exists");
      throw error; // Let the errorHandler middleware handle 500s
    }
  },

  async update(ctx: Context) {
    const { id, name } = ctx.request.body as any;
    if (!id) ctx.throw(400, "Invalid source tag ID");

    const updated = await SourceTagModel.update(id, name);
    if (!updated) ctx.throw(404, "Source tag not found");

    ctx.body = updated;
  },

  async delete(ctx: Context) {
    const { id } = ctx.request.body as any;
    const deleted = await SourceTagModel.delete(id);
    if (!deleted) ctx.throw(404, "Source tag not found");

    ctx.body = { id: deleted.id, message: "Deleted successfully" };
  },
};
