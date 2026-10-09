import ApiError from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

export const getRecommendations = async (userId, productId, limit = 5) => {
  let response;

  try {
    response = await fetch(`${env.mlServiceUrl}/api/v1/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.toString(),
        product_id: productId,
        limit,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(503, "Recommendation service is currently unavailable");
  }

  if (response.status === 404) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  if (!response.ok) {
    throw new ApiError(503, "Unable to retrieve recommendations at this time");
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(502, "Invalid response from recommendation service");
  }
};
