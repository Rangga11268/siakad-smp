// User Types
export interface UserProfile {
  fullName?: string;
  nisn?: string;
  nip?: string;
  gender?: "L" | "P";
  level?: number;
  class?: string;
  birthPlace?: string;
  birthDate?: Date | string;
  address?: string;
  avatar?: string;
  physical?: {
    height?: number;
    weight?: number;
    headCircumference?: number;
    bloodType?: string;
  };
  family?: {
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    parentJob?: string;
    parentIncome?: string;
    kipStatus?: boolean;
    kipNumber?: string;
  };
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  role: "admin" | "teacher" | "student" | "parent";
  profile?: UserProfile;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Academic Types
export interface AcademicYear {
  _id: string;
  name: string;
  semester: "Ganjil" | "Genap";
  status: "active" | "inactive";
  startDate: string;
  endDate: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  kkm: number;
}

export interface Class {
  _id: string;
  name: string;
  level: number;
  academicYear?: AcademicYear | string;
  homeroomTeacher?: User | string;
  students?: User[] | string[];
}

// Attendance Types
export interface AttendanceRecord {
  _id: string;
  student: User | string;
  class?: Class | string;
  subject?: Subject | string;
  date: string;
  status: "Present" | "Sick" | "Permission" | "Alpha";
  note?: string;
  recordedBy?: User | string;
}

export interface AttendanceSummary {
  Present: number;
  Sick: number;
  Permission: number;
  Alpha: number;
}

// Grade Types
export interface Grade {
  _id: string;
  student: User | string;
  subject: Subject | string;
  academicYear: AcademicYear | string;
  learningGoal?: string;
  score: number;
  type: "Daily" | "UTS" | "UAS" | "Project";
  semester: "Ganjil" | "Genap";
}

// Finance Types
export interface Billing {
  _id: string;
  student: User | string;
  title: string;
  type: "SPP" | "Gedung" | "Seragam" | "Lainnya";
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue" | "cancelled";
  paidAt?: string;
  paymentMethod?: string;
}

export interface Payment {
  _id: string;
  billing: Billing | string;
  amount: number;
  paymentDate: string;
  method: string;
  note?: string;
}

// Library Types
export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  stock: number;
  available: number;
  coverUrl?: string;
  pdfUrl?: string;
}

export interface BookLoan {
  _id: string;
  book: Book | string;
  student: User | string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "pending" | "approved" | "borrowed" | "returned" | "overdue";
}

// UKS Types
export interface HealthRecord {
  _id: string;
  student: User | string;
  date: string;
  complaint: string;
  diagnosis?: string;
  treatment?: string;
  medicine?: string;
  notes?: string;
  recordedBy?: User | string;
}

// PPDB Types
export interface PPDBRegistrant {
  _id: string;
  nisn: string;
  fullname: string;
  gender: "L" | "P";
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
  parentName: string;
  previousSchool?: string;
  status: "pending" | "accepted" | "rejected";
  registrationDate: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeYear?: AcademicYear;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
