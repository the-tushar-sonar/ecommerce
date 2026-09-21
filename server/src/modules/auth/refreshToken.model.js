import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const RefreshToken = mongoose.model(
    "RefreshToken",
    refreshTokenSchema
);

export default RefreshToken;