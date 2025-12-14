import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user || user.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }

  next();
};
