import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "./auth.service.js";

export const register = asyncHandler(
  async (req, res) => {
    const result = await registerUser(req.body);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          result,
          "Registration successful"
        )
      );
  }
);

export const login = asyncHandler(
  async (req, res) => {
    const result = await loginUser(req.body);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Login successful"
        )
      );
  }
);

export const refresh = asyncHandler(
  async (req, res) => {
    const result = await refreshAccessToken(
      req.body.refreshToken
    );

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Token refreshed successfully"
      )
    );
  }
);

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.body.refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Logout successful"
    )
  );
}
);
