import bcrypt from "bcryptjs";

import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
} from "../users/user.service.js";

import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyToken,
} from "../../utils/token.js";

import {
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from "./refreshToken.service.js";

const createSessionTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await storeRefreshToken({
    token: refreshToken,
    userId: user._id,
    expiresAt: getTokenExpiration(refreshToken),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  const { accessToken, refreshToken } = await createSessionTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({
  email,
  password,
}) => {
  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await createSessionTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  let payload;

  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new ApiError(
      401,
      "Invalid or expired refresh token"
    );
  }

  if (payload.type !== "refresh") {
    throw new ApiError(
      401,
      "Invalid refresh token"
    );
  }

  const storedToken =
    await findRefreshToken(refreshToken);

  if (!storedToken) {
    throw new ApiError(
      401,
      "Refresh token not found"
    );
  }

  if (storedToken.revokedAt) {
    throw new ApiError(
      401,
      "Refresh token has been revoked"
    );
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new ApiError(
      401,
      "Refresh token has expired"
    );
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    throw new ApiError(
      401,
      "User no longer exists"
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Account is disabled"
    );
  }

  await revokeRefreshToken(refreshToken);

  const tokens = await createSessionTokens(user);

  return tokens;
};

export const logoutUser = async (refreshToken) => {
  await revokeRefreshToken(refreshToken);
};
