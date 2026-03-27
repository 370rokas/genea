import { Router } from "@koa/router";
import { validate } from "@/middlewares/validator";
import { hasPermission } from "@/middlewares/auth";
import { sourceTagSchemas } from "@/schemas/sourceTag.schema";
import { SourceTagController } from "@/controllers/sourceTag.controller";

const sourceTagRouter = new Router({ prefix: "/source/tag" });

sourceTagRouter.use(hasPermission(["MANAGE_SOURCES"]));

sourceTagRouter.post(
  "/",
  validate(sourceTagSchemas.create),
  SourceTagController.create,
);

sourceTagRouter.put(
  "/",
  validate(sourceTagSchemas.update),
  SourceTagController.update,
);

sourceTagRouter.delete(
  "/",
  validate(sourceTagSchemas.delete),
  SourceTagController.delete,
);

export default sourceTagRouter;
