import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";
import { findUserById } from "../modules/users/user.service.js";

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = verifyToken(token);

    if (payload.type !== "access") {
      throw new ApiError(401, "Invalid access token");
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is disabled");
    }

    req.user = user;

    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(401, "Invalid or expired token")
    );
  }
};

export default authenticate;
