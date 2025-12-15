import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  
  next();
};
