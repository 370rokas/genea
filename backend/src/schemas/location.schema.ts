import Joi from "joi";

export const locationSchemas = {
  // Schema for POST /location
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
      "string.empty": "Location name cannot be empty",
      "any.required": "Location name is required",
    }),
    parentId: Joi.number().integer().positive().allow(null).optional(),
  }),

  // Schema for PUT /location
  update: Joi.object({
    id: Joi.number()
      .integer()
      .required()
      .messages({ "any.required": "Location ID is required for updates" }),
    name: Joi.string().trim().min(1).optional(),
    parentId: Joi.number().integer().positive().allow(null).optional(),
  }).min(2), // Ensures at least 'id' and one other field are present

  // Schema for DELETE /location (assuming ID comes in body per your controller)
  delete: Joi.object({
    id: Joi.number().integer().required(),
  }),
};
