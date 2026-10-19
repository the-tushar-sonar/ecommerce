const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "")

export interface ApiResponse<T> {
  statusCode?: number
  success: boolean
  message?: string
  data: T
}

export class ApiError extends Error {
  statusCode: number
  details: unknown

  constructor(
    message: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.details = details
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  token?: string
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { token, headers: customHeaders, body, ...requestOptions } = options

  const headers = new Headers(customHeaders)

  headers.set("Accept", "application/json")

  if (body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check that the API is running.",
      0,
    )
  }

  if (response.status === 204) {
    return {
      success: response.ok,
      data: undefined as T,
    }
  }

  const contentType = response.headers.get("content-type") ?? ""

  let payload: unknown

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json()
    } catch {
      throw new ApiError(
        "The server returned invalid JSON.",
        response.status,
      )
    }
  } else {
    payload = await response.text()
  }

  if (!response.ok) {
    const errorPayload =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : {}

    const message =
      typeof errorPayload.message === "string"
        ? errorPayload.message
        : `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, payload)
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    !("data" in payload)
  ) {
    throw new ApiError(
      "The server returned an unexpected response format.",
      response.status,
      payload,
    )
  }

  return payload as ApiResponse<T>
}