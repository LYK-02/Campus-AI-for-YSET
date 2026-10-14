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

export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE";
export type MaterialVisibility = "PRIVATE" | "COURSE" | "UNIVERSITY";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string | null;
  storageKey?: string | null;
  status: SubmissionStatus;
  marks?: number | null;
  feedback?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  student?: {
    id: string;
    name: string;
    studentId?: string | null;
    emailNormalized?: string;
  };
}

export interface Assignment {
  id: string;
  courseId: string;
  creatorId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    code: string;
    name: string;
    semester?: string | null;
  };
  creator?: {
    id: string;
    name: string;
  };
  submissions?: Submission[];
}

export interface Material {
  id: string;
  universityId: string;
  ownerId: string;
  courseId?: string | null;
  title: string;
  description?: string | null;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  visibility: MaterialVisibility;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    code: string;
    name: string;
    semester?: string | null;
  } | null;
  owner?: {
    id: string;
    name: string;
  };
}

export interface Announcement {
  id: string;
  universityId: string;
  courseId?: string | null;
  creatorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  expiresAt?: string | null;
  course?: {
    id: string;
    code: string;
    name: string;
  } | null;
  creator?: {
    id: string;
    name: string;
  };
}
