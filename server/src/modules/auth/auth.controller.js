import { registerUser, loginUser } from "./auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser({ name, email, password });

    res.status(201).json(
      new ApiResponse(201, "User registered successfully", result)
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(
      new ApiResponse(200, "Login successful", result)
    );
  } catch (err) {
    next(err);
  }
};
