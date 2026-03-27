import Joi from "joi";

export const sourceTagSchemas = {
  // Schema for POST /location
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
      "string.empty": "Source tag name cannot be empty",
      "any.required": "Source tag name is required",
    }),
  }),

  // Schema for PUT /location
  update: Joi.object({
    id: Joi.number()
      .integer()
      .required()
      .messages({ "any.required": "Source tag ID is required for updates" }),
    name: Joi.string().trim().min(1).optional(),
  }).min(2), // Ensures at least 'id' and one other field are present

  // Schema for DELETE /location (assuming ID comes in body per your controller)
  delete: Joi.object({
    id: Joi.number().integer().required(),
  }),
};
