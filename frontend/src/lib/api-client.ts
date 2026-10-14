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

// ----------------------------------------------------------------------
// Course & Timetable API Helpers
// ----------------------------------------------------------------------
import type { Course, TimetableSlot, Assignment, Submission, Material, Announcement } from "../types";

export const coursesApi = {
  getCourses: (branchId = "cse-aift", semester = 1) =>
    apiRequest<Course[]>("/courses", {
      params: { branchId, semester },
    }),

  setVisibility: (courseId: string, isPublished: boolean) =>
    apiRequest<{ data: Course; message: string }>(`/courses/${courseId}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished }),
    }),
};

export const timetableApi = {
  getTimetable: (branchId = "cse-aift", semester = 1) =>
    apiRequest<TimetableSlot[]>("/timetable", {
      params: { branchId, semester },
    }),

  generateTimetable: (branchId = "cse-aift", semester = 1) =>
    apiRequest<TimetableSlot[]>("/timetable/generate", {
      method: "POST",
      body: JSON.stringify({ branchId, semester }),
    }),

  clearTimetable: (branchId = "cse-aift", semester = 1) =>
    apiRequest<{ message: string }>("/timetable", {
      method: "DELETE",
      body: JSON.stringify({ branchId, semester }),
    }),
};

export const assignmentsApi = {
  getAssignments: (courseId?: string) =>
    apiRequest<Assignment[]>("/assignments", {
      params: courseId ? { courseId } : undefined,
    }),

  createAssignment: (data: {
    courseId: string;
    title: string;
    description: string;
    dueDate: string;
    maxMarks?: number;
  }) =>
    apiRequest<Assignment>("/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  submitAssignment: (
    assignmentId: string,
    data: { content?: string; storageKey?: string }
  ) =>
    apiRequest<Submission>(`/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  gradeSubmission: (
    submissionId: string,
    data: { marks: number; feedback?: string }
  ) =>
    apiRequest<Submission>(`/assignments/submissions/${submissionId}/grade`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const materialsApi = {
  getMaterials: (courseId?: string) =>
    apiRequest<Material[]>("/materials", {
      params: courseId ? { courseId } : undefined,
    }),

  createMaterial: (data: {
    courseId?: string;
    title: string;
    description?: string;
    originalFilename: string;
    mimeType?: string;
    sizeBytes?: number;
    storageKey?: string;
  }) =>
    apiRequest<Material>("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteMaterial: (id: string) =>
    apiRequest<{ message: string }>(`/materials/${id}`, {
      method: "DELETE",
    }),
};

export const announcementsApi = {
  getAnnouncements: (courseId?: string) =>
    apiRequest<Announcement[]>("/announcements", {
      params: courseId ? { courseId } : undefined,
    }),

  createAnnouncement: (data: {
    courseId?: string;
    title: string;
    content: string;
    isPinned?: boolean;
  }) =>
    apiRequest<Announcement>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAnnouncement: (id: string) =>
    apiRequest<{ message: string }>(`/announcements/${id}`, {
      method: "DELETE",
    }),
};
