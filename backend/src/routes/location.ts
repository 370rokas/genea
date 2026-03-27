import Router from "@koa/router";
import { LocationController } from "@/controllers/location.controller";
import { isAuthenticated, hasPermission } from "@/middlewares/auth";
import { validate } from "@/middlewares/validator";
import { locationSchemas } from "@/schemas/location.schema";

const locationRouter = new Router({ prefix: "/location" });

// Apply authentication to all location routes
locationRouter.use(hasPermission(["MANAGE_LOCATIONS"]));

locationRouter.post(
  "/",
  validate(locationSchemas.create),
  LocationController.create,
);

locationRouter.put(
  "/",
  validate(locationSchemas.update),
  LocationController.update,
);

locationRouter.delete(
  "/",
  validate(locationSchemas.delete),
  LocationController.delete,
);

export default locationRouter;
