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
  emailVerifiedAt?: string;
  universityId: string;
  universityName?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Array<{ field: string; message: string }>;
  };
}
