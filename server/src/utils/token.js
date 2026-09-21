import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            type: "access",
        },
        env.jwt.secret,
        {
            expiresIn: env.jwt.accessExpiresIn,
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            type: "refresh",
            jti: crypto.randomUUID(),
        },
        env.jwt.secret,
        {
            expiresIn: env.jwt.refreshExpiresIn,
        }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, env.jwt.secret);
};

export const getTokenExpiration = (token) => {
    const decoded = jwt.decode(token);

    if (!decoded?.exp) {
        throw new Error("Invalid token expiration");
    }

    return new Date(decoded.exp * 1000);
};