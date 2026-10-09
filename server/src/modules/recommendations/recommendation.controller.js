import { z } from "zod";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { getRecommendations } from "./recommendation.service.js";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const getRecommendationsController = async (req, res) => {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.productId)) {
      throw new ApiError(400, "Invalid product ID");
    }
  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ApiError(
      400,
      "Invalid recommendation limit",
      parsedQuery.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const result = await getRecommendations(
    req.user._id,
    req.params.productId,
    parsedQuery.data.limit,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recommendations fetched successfully"));
};
