export type Role = "STUDENT" | "FACULTY" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DISABLED";
export type ChatMode = "GENERAL" | "MY_DOCUMENTS" | "MY_COURSES" | "UNIVERSITY_KNOWLEDGE";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  studentId?: string;
  branchId?: string;
  semester?: number;
  emailVerifiedAt?: string;
  universityId: string;
  universityName?: string;
}

export interface Subject {
  name: string;
  credits: number;
}

export interface SemesterInfo {
  semester: number;
  subjects: Subject[];
}

export interface BranchInfo {
  id: string;
  name: string;
  shortName: string;
  creditSheetUrl: string;
  semesters: SemesterInfo[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  semester: string;
  branchId?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableSlot {
  id: string;
  universityId: string;
  branchId: string;
  semester: number;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string;
  courseId: string;
  facultyName?: string | null;
  course?: {
    id: string;
    code: string;
    name: string;
    credits: number;
    isPublished: boolean;
  };
}
