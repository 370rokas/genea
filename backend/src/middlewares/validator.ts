import Joi from "joi";
import type { Context, Next } from 'koa';


export const validate = (schema: Joi.ObjectSchema, source = 'body') => {
    return async (ctx: Context, next: Next) => {
        try {
            let dataToValidate;

            switch (source) {
                case 'body':
                    dataToValidate = ctx.request.body;
                    break;
                case 'params':
                    dataToValidate = ctx.params;
                    break;
                default:
                    dataToValidate = ctx.request.body;
            }

            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                ctx.status = 400;
                ctx.body = {
                    error: 'Validation Failed',
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                };
                return;
            }

            // Store validated data in context
            if (source === 'body') {
                ctx.request.body = value;
                ctx.validatedData = value;
            }

            await next();
        } catch (err) {
            ctx.status = 500;
            ctx.body = { error: 'Validation processing failed' };
        }
    };
};
