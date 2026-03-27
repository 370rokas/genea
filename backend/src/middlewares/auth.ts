import { Permission, TokenPayload } from "@/types/auth";
import { Middleware } from "koa";
import jwt from 'jsonwebtoken';

/**
 * Middleware to check if the user has the required permissions.
 * @param requiredPermissions - An array of permissions required to access the route.
 * @param requireAll - If true, the user must have all the required permissions. If false, the user must have at least one of the required permissions.
 */
export const hasPermission = (
    requiredPermissions: Permission[],
    requireAll = true
): Middleware => {

    return async (ctx, next) => {
        const token = ctx.cookies.get("token");

        if (!token) {
            ctx.status = 401;
            ctx.body = { error: "Authentication required" };
            return;
        };

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'default_secret'
            ) as TokenPayload;

            const isSudo = decoded.permissions.includes('SUDO');
            if (!isSudo) {
                const hasRequiredPermissions =
                    requireAll ? requiredPermissions.every(p => decoded.permissions.includes(p))
                        : requiredPermissions.some(p => decoded.permissions.includes(p));

                if (!hasRequiredPermissions) {
                    ctx.status = 403;
                    ctx.body = { error: "Forbidden: insufficient permissions" };
                    return;
                }
            }

            ctx.state.user = decoded;
            await next();

        } catch (err) {
            ctx.status = 401;
            ctx.body = { error: "Invalid or expired token" };
        }
    };
};

/**
 * Middleware to check if the user is authenticated (i.e., has a valid JWT token).
 * @param ctx - Koa context
 * @param next - Next middleware function
 * @returns - 401 if not authenticated, otherwise calls next() to proceed to the next middleware or route handler
 */
export const isAuthenticated: Middleware = async (ctx, next) => {
    const token = ctx.cookies.get("token");

    if (!token) {
        ctx.status = 401;
        ctx.body = { error: "Authentication required" };
        return;
    };
    
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'default_secret'
        ) as TokenPayload;

        ctx.state.user = decoded;
        await next();

    } catch (err) {
        ctx.status = 401;
        ctx.body = { error: "Invalid or expired token" };
    }
};