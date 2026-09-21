import { Router } from "express";

import {
    register,
    login,
    refresh,
    logout,
} from "./auth.controller.js";

import validate from "../../middlewares/validate.middleware.js";

import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from "./auth.validation.js";



import authenticate from "../../middlewares/auth.middleware.js";

import requireRole from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.get("/me", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated user",
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
});

router.get(
    "/admin-test",
    authenticate,
    requireRole("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted",
            data: {
                id: req.user._id,
                name: req.user.name,
                role: req.user.role,
            },
        });
    }
);

router.post(
    "/refresh",
    validate(refreshTokenSchema),
    refresh
);

router.post(
    "/logout",
    validate(refreshTokenSchema),
    logout
);

export default router;
