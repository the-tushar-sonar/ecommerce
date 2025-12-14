import ApiError from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default isAdmin;

