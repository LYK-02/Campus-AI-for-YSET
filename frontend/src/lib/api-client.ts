import type { ApiErrorResponse } from "../types";

export class ApiError extends Error {
  code: string;
  requestId?: string;
  details?: Array<{ field: string; message: string }>;
  status: number;

  constructor(status: number, data: ApiErrorResponse["error"]) {
    super(data.message || "An API error occurred");
    this.name = "ApiError";
    this.status = status;
    this.code = data.code || "UNKNOWN_ERROR";
    this.requestId = data.requestId;
    this.details = data.details;
  }
}

const BASE_URL = "/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const response = await fetch(url, config);

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.error || { message: response.statusText, code: "HTTP_ERROR" });
  }

  return (data.data !== undefined ? data.data : data) as T;
}
