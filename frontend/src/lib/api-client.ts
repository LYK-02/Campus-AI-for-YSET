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

let currentAccessToken: string | null = localStorage.getItem("yset_access_token");

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem("yset_access_token", token);
  } else {
    localStorage.removeItem("yset_access_token");
  }
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, skipAuth, ...customConfig } = options;

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

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && currentAccessToken) {
    reqHeaders["Authorization"] = `Bearer ${currentAccessToken}`;
  }

  const config: RequestInit = {
    ...customConfig,
    credentials: "include",
    headers: reqHeaders,
  };

  const response = await fetch(url, config);

  // If 401 and not an auth attempt itself, try silent refresh
  if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setAccessToken(refreshData.accessToken);
          onRefreshed(refreshData.accessToken);
          isRefreshing = false;

          // Retry original request with new token
          reqHeaders["Authorization"] = `Bearer ${refreshData.accessToken}`;
          const retryRes = await fetch(url, { ...config, headers: reqHeaders });
          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({}));
            throw new ApiError(retryRes.status, errData.error || { message: retryRes.statusText, code: "HTTP_ERROR" });
          }
          const retryJson = await retryRes.json().catch(() => ({}));
          return (retryJson.data !== undefined ? retryJson.data : retryJson) as T;
        } else {
          setAccessToken(null);
          isRefreshing = false;
        }
      } catch {
        setAccessToken(null);
        isRefreshing = false;
      }
    } else {
      // Queue request until token refresh completes
      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push(async (token: string) => {
          try {
            reqHeaders["Authorization"] = `Bearer ${token}`;
            const retryRes = await fetch(url, { ...config, headers: reqHeaders });
            const retryJson = await retryRes.json().catch(() => ({}));
            resolve((retryJson.data !== undefined ? retryJson.data : retryJson) as T);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

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
