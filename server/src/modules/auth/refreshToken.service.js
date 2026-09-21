import RefreshToken from "./refreshToken.model.js";
import { hashToken } from "../../utils/refreshToken.js";

export const storeRefreshToken = async ({
    token,
    userId,
    expiresAt,
}) => {
    return RefreshToken.create({
        tokenHash: hashToken(token),
        user: userId,
        expiresAt,
    });
};

export const findRefreshToken = async (token) => {
    return RefreshToken.findOne({
        tokenHash: hashToken(token),
    });
};

export const revokeRefreshToken = async (token) => {
    return RefreshToken.findOneAndUpdate(
        {
            tokenHash: hashToken(token),
            revokedAt: null,
        },
        {
            revokedAt: new Date(),
        },
        {
            new: true,
        }
    );
};