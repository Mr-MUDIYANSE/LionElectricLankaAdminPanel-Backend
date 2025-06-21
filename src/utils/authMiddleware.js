import { verifyToken } from "./jwt.js";

export const checkAuth = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized",
            error: "Token not found",
            data: null
        });
    }

    const [scheme, token] = auth.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(400).json({
            message: "Bad request",
            error: "Invalid authorization format",
            data: null
        });
    }

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({
            message: "Unauthorized",
            error: "Token invalid or expired",
            data: null
        });
    }

    next();
};