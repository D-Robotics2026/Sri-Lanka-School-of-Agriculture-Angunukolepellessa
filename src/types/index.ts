// Comprehensive Type Definitions for School of Agriculture - Angunakolapelessa

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'registrar'
  | 'lecturer'
  | 'librarian'
  | 'hostel_warden'
  | 'student';

export interface SystemUser {
  id: string;
  username: string;
  passwordHash: string; // Stored password hash / demo auth
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  linkedLecturerId?: string;
  linkedStudentId?: string;
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type NVQLevel = 'Level 5' | 'Level 6' | 'Level 5 & 6';
export type AcademicYearStatus = 'upcoming' | 'active' | 'completed';
export type EnrollmentStatus = 'active' | 'suspended' | 'graduated' | 'dropped_out' | 'ojt';

export interface AcademicYear {
  id: string;
  code: string; // e.g., "2024/2025"
  name: string;
  nvqLevel: NVQLevel;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  description?: string;
}

export interface StudentGroup {
  id: string;
  academicYearId: string;
  name: string; // e.g. "Batch 2024 - Group A"
  code: string; // e.g. "L5-2024-A"
  nvqLevel: NVQLevel;
  currentSemester: number; // 1-2 for L5, 1-4 for L6
  maxCapacity: number;
}

export interface ParentGuardian {
  name: string;
  relationship: string;
  phone: string;
  address: string;
  occupation?: string;
}

export interface Student {
  id: string;
  indexNumber: string; // e.g., "AG/2023/L5/001"
  barcode: string; // Barcode value e.g., "884012023001"
  nic: string; // Sri Lanka NIC e.g., "200215401234"
  fullName: string;
  callingName: string;
  gender: 'male' | 'female';
  dob: string;
  address: string;
  phone: string;
  email: string;
  parent: ParentGuardian;
  nvqLevel: NVQLevel;
  semester: number | 'OJT'; // 1-2 (L5), 1-4 (L6), or 'OJT'
  groupId: string;
  academicYearId: string;
  photoUrl: string;
  enrollmentStatus: EnrollmentStatus;
  isHostelResident: boolean;
  hostelRoomNumber?: string;
  enrollmentDate: string;
}

export interface Lecturer {
  id: string;
  lecturerId: string; // e.g., "LEC-AG-001"
  fullName: string;
  designation: string; // e.g., "Senior Lecturer", "Instructor"
  department: string; // e.g., "Crop Science", "Farm Machinery", "Soil & Water"
  email: string;
  phone: string;
  qualifications: string;
  photoUrl: string;
  assignedModuleIds: string[];
}

export interface Module {
  id: string;
  code: string; // e.g., "AG-501"
  title: string;
  nvqLevel: NVQLevel;
  semester: number; // 1-2 (L5), 1-4 (L6)
  credits: number;
  theoryHours: number; // Total planned
  practicalHours: number; // Total planned
  primaryLecturerId: string;
  assistantLecturerIds?: string[];
  assessmentCriteria: {
    assignmentsCount: number;
    practicalTestsCount: number;
    fieldVisitsCount: number;
  };
}

export type AttendanceType = 'Theory' | 'Practical';
export type AttendanceRecordStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentAttendanceEntry {
  studentId: string;
  studentIndex: string;
  status: AttendanceRecordStatus;
  remarks?: string;
}

export interface AttendanceSession {
  id: string;
  moduleId: string;
  lecturerId: string;
  groupId: string;
  date: string;
  startTime: string; // "HH:MM" e.g. "08:30"
  endTime: string; // "HH:MM" e.g. "11:30"
  computedHours: number; // Strictly computed: (endTime - startTime) in decimal hours
  type: AttendanceType;
  topicCovered: string;
  records: StudentAttendanceEntry[];
  createdAt: string;
}

export type AssignmentStatus = 'submitted' | 'late' | 'not_submitted';

export interface AssignmentSubmission {
  studentId: string;
  studentIndex: string;
  status: AssignmentStatus;
  submissionDate?: string;
  marks?: number; // out of maxMarks
  remarks?: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  semester: number;
  maxMarks: number;
  weightagePercent: number;
  dueDate: string;
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export interface PracticalTestResult {
  studentId: string;
  studentIndex: string;
  marks: number;
  maxMarks: number;
  competencyAchieved: boolean;
  remarks?: string;
}

export interface PracticalTest {
  id: string;
  moduleId: string;
  title: string;
  scheduledDate: string;
  venue: string; // e.g., "Field Plot 4", "Engineering Workshop", "Tissue Culture Lab"
  maxMarks: number;
  weightagePercent: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  results: PracticalTestResult[];
}

// OJT (On-the-Job Training - 6 Months)
export interface OJTMonthlyReport {
  monthNumber: 1 | 2 | 3 | 4 | 5 | 6;
  reportMonth: string; // e.g., "Month 1 (March 2026)"
  submissionDate?: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'approved';
  supervisorFeedback?: string;
  skillsPracticed?: string[];
  reviewedBy?: string;
}

export interface OJTPlacement {
  id: string;
  studentId: string;
  establishmentName: string; // e.g., "Rice Research & Development Institute - Batalagoda"
  establishmentAddress: string;
  establishmentSector: 'Government Research' | 'Commercial Farm' | 'Agri-Business' | 'Extension Centre';
  supervisorName: string;
  supervisorDesignation: string;
  supervisorPhone: string;
  supervisorEmail: string;
  startDate: string;
  endDate: string; // 6 months duration
  monthlyReports: OJTMonthlyReport[];
  finalEvaluation?: {
    technicalSkillsScore: number; // out of 40
    attendanceDisciplineScore: number; // out of 20
    logbookReportScore: number; // out of 20
    presentationScore: number; // out of 20
    totalScore: number; // out of 100
    finalGrade: 'Distinction' | 'Merit' | 'Pass' | 'Fail' | 'Incomplete';
    supervisorComments: string;
    evaluatedDate: string;
  };
}

// Library Management
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string; // e.g., "Shelf AGR-04-B"
  coverUrl?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  studentId: string;
  studentIndex: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  fineStatus: 'none' | 'pending' | 'paid' | 'waived';
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface BookReservation {
  id: string;
  bookId: string;
  studentId: string;
  studentIndex: string;
  reservedDate: string;
  queuePosition: number;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
}

export interface FineSettings {
  dailyRateLkr: number; // Default e.g., 10 LKR/day
  maxBorrowDays: number; // Default e.g., 14 days
  maxBooksPerStudent: number; // Default e.g., 3 books
}

// Hostel & Meals
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MealWeek {
  id: string;
  weekNumber: number;
  title: string; // e.g., "Week 45 (Nov 2 - Nov 8, 2026)"
  startDate: string; // Monday
  endDate: string; // Sunday
  submissionDeadline: string; // ISO date-time string e.g. "2026-11-01T20:00:00"
  status: 'open' | 'closed';
  notes?: string;
}

export interface WeeklyMealChoices {
  // 7 days x 3 meals = 21 options
  [day: string]: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export interface StudentMealSubmission {
  id: string;
  mealWeekId: string;
  studentId: string;
  studentIndex: string;
  submittedAt: string;
  choices: WeeklyMealChoices;
  specialDietaryRemarks?: string;
}

// Notifications
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType =
  | 'announcement'
  | 'library_overdue'
  | 'attendance_warning'
  | 'assignment_due'
  | 'meal_deadline'
  | 'ojt_update';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: 'all' | 'role' | 'specific_student';
  targetRole?: UserRole;
  targetStudentIndex?: string;
  createdAt: string;
  senderName: string;
  readByUserIds: string[]; // List of user IDs who marked this as read
}

// System Settings
export interface SystemSettings {
  institutionName: string;
  institutionSubheading: string;
  academicDefaults: {
    activeAcademicYearId: string;
    minimumAttendanceThresholdPercent: number; // e.g. 80%
  };
  library: FineSettings;
  allowSelfRegistration: boolean;
}

// Role-based Access Control Permissions Map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'dashboard', 'academics', 'students', 'lecturers', 'modules',
    'attendance', 'assessments', 'ojt', 'library', 'hostel',
    'reports', 'notifications', 'settings'
  ],
  admin: [
    'dashboard', 'academics', 'students', 'lecturers', 'modules',
    'attendance', 'assessments', 'ojt', 'library', 'hostel',
    'reports', 'notifications', 'settings'
  ],
  registrar: [
    'dashboard', 'academics', 'students', 'modules',
    'attendance', 'ojt', 'reports', 'notifications'
  ],
  lecturer: [
    'dashboard', 'students', 'modules',
    'attendance', 'assessments', 'notifications'
  ],
  librarian: [
    'dashboard', 'library', 'notifications'
  ],
  hostel_warden: [
    'dashboard', 'hostel', 'students', 'notifications'
  ],
  student: [
    'dashboard', 'attendance', 'assessments',
    'ojt', 'library', 'hostel', 'modules', 'notifications'
  ]
};

export const isTabAllowedForRole = (role: UserRole, tab: string): boolean => {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(tab) : false;
};
