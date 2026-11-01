import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AcademicYear,
  StudentGroup,
  Student,
  Lecturer,
  Module,
  AttendanceSession,
  Assignment,
  PracticalTest,
  OJTPlacement,
  Book,
  BorrowRecord,
  BookReservation,
  FineSettings,
  MealWeek,
  StudentMealSubmission,
  SystemNotification,
  SystemSettings,
  WeeklyMealChoices
} from '../types';
import {
  SEED_ACADEMIC_YEARS,
  SEED_GROUPS,
  SEED_STUDENTS,
  SEED_LECTURERS,
  SEED_MODULES,
  SEED_ATTENDANCE_SESSIONS,
  SEED_ASSIGNMENTS,
  SEED_PRACTICAL_TESTS,
  SEED_OJT_PLACEMENTS,
  SEED_BOOKS,
  SEED_BORROW_RECORDS,
  SEED_BOOK_RESERVATIONS,
  SEED_FINE_SETTINGS,
  SEED_MEAL_WEEKS,
  SEED_MEAL_SUBMISSIONS,
  SEED_NOTIFICATIONS,
  SEED_SYSTEM_SETTINGS
} from '../data/seedData';

interface DataContextType {
  // Academic Years
  academicYears: AcademicYear[];
  addAcademicYear: (ay: Omit<AcademicYear, 'id'>) => void;
  updateAcademicYear: (ay: AcademicYear) => void;
  deleteAcademicYear: (id: string) => void;

  // Groups
  groups: StudentGroup[];
  addGroup: (grp: Omit<StudentGroup, 'id'>) => void;
  updateGroup: (grp: StudentGroup) => void;
  deleteGroup: (id: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;

  // Lecturers
  lecturers: Lecturer[];
  addLecturer: (lecturer: Omit<Lecturer, 'id'>) => void;
  updateLecturer: (lecturer: Lecturer) => void;
  deleteLecturer: (id: string) => void;

  // Modules
  modules: Module[];
  addModule: (module: Omit<Module, 'id'>) => void;
  updateModule: (module: Module) => void;
  deleteModule: (id: string) => void;

  // Attendance
  attendanceSessions: AttendanceSession[];
  addAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'computedHours' | 'createdAt'>) => AttendanceSession;
  updateAttendanceSession: (session: AttendanceSession) => void;
  deleteAttendanceSession: (id: string) => void;
  calculateComputedHours: (startTime: string, endTime: string) => number;

  // Assessments
  assignments: Assignment[];
  addAssignment: (asn: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => void;
  updateAssignment: (asn: Assignment) => void;
  deleteAssignment: (id: string) => void;
  gradeAssignmentSubmission: (
    assignmentId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    remarks?: string,
    status?: 'submitted' | 'late'
  ) => void;

  // Practical Tests
  practicalTests: PracticalTest[];
  addPracticalTest: (test: Omit<PracticalTest, 'id' | 'results'>) => void;
  updatePracticalTest: (test: PracticalTest) => void;
  deletePracticalTest: (id: string) => void;
  recordPracticalResult: (
    testId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    competencyAchieved: boolean,
    remarks?: string
  ) => void;

  // OJT
  ojtPlacements: OJTPlacement[];
  addOJTPlacement: (placement: Omit<OJTPlacement, 'id' | 'monthlyReports'>) => void;
  updateOJTPlacement: (placement: OJTPlacement) => void;
  updateOJTMonthlyReport: (
    placementId: string,
    monthNumber: 1 | 2 | 3 | 4 | 5 | 6,
    updates: Partial<OJTPlacement['monthlyReports'][0]>
  ) => void;
  saveOJTFinalEvaluation: (
    placementId: string,
    evaluation: NonNullable<OJTPlacement['finalEvaluation']>
  ) => void;

  // Library
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;

  borrowRecords: BorrowRecord[];
  issueBook: (bookId: string, studentId: string, studentIndex: string, dueDateDays?: number) => { success: boolean; error?: string };
  returnBook: (recordId: string) => { success: boolean; fineAmount: number };
  payFine: (recordId: string) => void;
  waiveFine: (recordId: string) => void;

  bookReservations: BookReservation[];
  reserveBook: (bookId: string, studentId: string, studentIndex: string) => { success: boolean; error?: string };
  cancelReservation: (reservationId: string) => void;
  fulfillReservation: (reservationId: string) => void;

  fineSettings: FineSettings;
  updateFineSettings: (settings: FineSettings) => void;
  calculateCurrentFine: (dueDate: string, returnDate?: string) => number;

  // Hostel & Meals
  mealWeeks: MealWeek[];
  addMealWeek: (week: Omit<MealWeek, 'id'>) => void;
  updateMealWeek: (week: MealWeek) => void;
  deleteMealWeek: (id: string) => void;

  mealSubmissions: StudentMealSubmission[];
  saveMealSubmission: (
    mealWeekId: string,
    studentId: string,
    studentIndex: string,
    choices: WeeklyMealChoices,
    specialDietaryRemarks?: string
  ) => { success: boolean; error?: string };
  isMealWeekLocked: (mealWeek: MealWeek) => boolean;

  // Notifications
  notifications: SystemNotification[];
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'readByUserIds'>) => void;
  markNotificationAsRead: (notificationId: string, userId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Settings & System
  settings: SystemSettings;
  updateSettings: (newSettings: SystemSettings) => void;
  resetToDefaultSeed: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => { success: boolean; error?: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicYears, setAcademicYears] = useLocalStorage<AcademicYear[]>('soa_academic_years', SEED_ACADEMIC_YEARS);
  const [groups, setGroups] = useLocalStorage<StudentGroup[]>('soa_groups', SEED_GROUPS);
  const [students, setStudents] = useLocalStorage<Student[]>('soa_students', SEED_STUDENTS);
  const [lecturers, setLecturers] = useLocalStorage<Lecturer[]>('soa_lecturers', SEED_LECTURERS);
  const [modules, setModules] = useLocalStorage<Module[]>('soa_modules', SEED_MODULES);
  const [attendanceSessions, setAttendanceSessions] = useLocalStorage<AttendanceSession[]>('soa_attendance_sessions', SEED_ATTENDANCE_SESSIONS);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('soa_assignments', SEED_ASSIGNMENTS);
  const [practicalTests, setPracticalTests] = useLocalStorage<PracticalTest[]>('soa_practical_tests', SEED_PRACTICAL_TESTS);
  const [ojtPlacements, setOjtPlacements] = useLocalStorage<OJTPlacement[]>('soa_ojt_placements', SEED_OJT_PLACEMENTS);
  const [books, setBooks] = useLocalStorage<Book[]>('soa_books', SEED_BOOKS);
  const [borrowRecords, setBorrowRecords] = useLocalStorage<BorrowRecord[]>('soa_borrow_records', SEED_BORROW_RECORDS);
  const [bookReservations, setBookReservations] = useLocalStorage<BookReservation[]>('soa_book_reservations', SEED_BOOK_RESERVATIONS);
  const [fineSettings, setFineSettings] = useLocalStorage<FineSettings>('soa_fine_settings', SEED_FINE_SETTINGS);
  const [mealWeeks, setMealWeeks] = useLocalStorage<MealWeek[]>('soa_meal_weeks', SEED_MEAL_WEEKS);
  const [mealSubmissions, setMealSubmissions] = useLocalStorage<StudentMealSubmission[]>('soa_meal_submissions', SEED_MEAL_SUBMISSIONS);
  const [notifications, setNotifications] = useLocalStorage<SystemNotification[]>('soa_notifications', SEED_NOTIFICATIONS);
  const [settings, setSettings] = useLocalStorage<SystemSettings>('soa_settings', SEED_SYSTEM_SETTINGS);

  // Auto-update fine amounts on active borrow records dynamically
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setBorrowRecords((prev) =>
      prev.map((rec) => {
        if (rec.status !== 'returned') {
          const fine = calculateCurrentFine(rec.dueDate);
          const isOverdue = new Date(today) > new Date(rec.dueDate);
          return {
            ...rec,
            status: isOverdue ? 'overdue' : 'borrowed',
            fineAmount: fine,
            fineStatus: fine > 0 ? (rec.fineStatus === 'waived' ? 'waived' : 'pending') : 'none'
          };
        }
        return rec;
      })
    );
  }, [fineSettings.dailyRateLkr]);

  // Strict computation of attendance hours from startTime and endTime
  const calculateComputedHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);
    const diffMinutes = Math.max(0, endMinutes - startMinutes);
    return Math.round((diffMinutes / 60) * 10) / 10;
  };

  // Fine calculation based on overdue days * daily rate
  const calculateCurrentFine = (dueDate: string, returnDate?: string): number => {
    const endComparisonDate = returnDate ? new Date(returnDate) : new Date();
    const due = new Date(dueDate);
    // Normalize to midnight for accurate day counts
    endComparisonDate.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffMs = endComparisonDate.getTime() - due.getTime();
    const overdueDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return overdueDays * fineSettings.dailyRateLkr;
  };

  // Academic Years
  const addAcademicYear = (ay: Omit<AcademicYear, 'id'>) => {
    const newAy: AcademicYear = { ...ay, id: `ay-${Date.now()}` };
    setAcademicYears((prev) => [newAy, ...prev]);
  };

  const updateAcademicYear = (ay: AcademicYear) => {
    setAcademicYears((prev) => prev.map((item) => (item.id === ay.id ? ay : item)));
  };

  const deleteAcademicYear = (id: string) => {
    setAcademicYears((prev) => prev.filter((item) => item.id !== id));
  };

  // Groups
  const addGroup = (grp: Omit<StudentGroup, 'id'>) => {
    const newGrp: StudentGroup = { ...grp, id: `grp-${Date.now()}` };
    setGroups((prev) => [newGrp, ...prev]);
  };

  const updateGroup = (grp: StudentGroup) => {
    setGroups((prev) => prev.map((item) => (item.id === grp.id ? grp : item)));
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((item) => item.id !== id));
  };

  // Students
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...student, id: `stu-${Date.now()}` };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((item) => (item.id === student.id ? student : item)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((item) => item.id !== id));
  };

  // Lecturers
  const addLecturer = (lecturer: Omit<Lecturer, 'id'>) => {
    const newLecturer: Lecturer = { ...lecturer, id: `lec-${Date.now()}` };
    setLecturers((prev) => [newLecturer, ...prev]);
  };

  const updateLecturer = (lecturer: Lecturer) => {
    setLecturers((prev) => prev.map((item) => (item.id === lecturer.id ? lecturer : item)));
  };

  const deleteLecturer = (id: string) => {
    setLecturers((prev) => prev.filter((item) => item.id !== id));
  };

  // Modules
  const addModule = (module: Omit<Module, 'id'>) => {
    const newMod: Module = { ...module, id: `mod-${Date.now()}` };
    setModules((prev) => [newMod, ...prev]);
  };

  const updateModule = (module: Module) => {
    setModules((prev) => prev.map((item) => (item.id === module.id ? module : item)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((item) => item.id !== id));
  };

  // Attendance Sessions
  const addAttendanceSession = (session: Omit<AttendanceSession, 'id' | 'computedHours' | 'createdAt'>): AttendanceSession => {
    const computedHours = calculateComputedHours(session.startTime, session.endTime);
    const newSession: AttendanceSession = {
      ...session,
      id: `att-sess-${Date.now()}`,
      computedHours,
      createdAt: new Date().toISOString()
    };
    setAttendanceSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const updateAttendanceSession = (session: AttendanceSession) => {
    const computedHours = calculateComputedHours(session.startTime, session.endTime);
    const updated = { ...session, computedHours };
    setAttendanceSessions((prev) => prev.map((item) => (item.id === session.id ? updated : item)));
  };

  const deleteAttendanceSession = (id: string) => {
    setAttendanceSessions((prev) => prev.filter((item) => item.id !== id));
  };

  // Assignments
  const addAssignment = (asn: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => {
    const newAsn: Assignment = {
      ...asn,
      id: `asn-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      submissions: []
    };
    setAssignments((prev) => [newAsn, ...prev]);
  };

  const updateAssignment = (asn: Assignment) => {
    setAssignments((prev) => prev.map((item) => (item.id === asn.id ? asn : item)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  const gradeAssignmentSubmission = (
    assignmentId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    remarks?: string,
    status: 'submitted' | 'late' = 'submitted'
  ) => {
    setAssignments((prev) =>
      prev.map((asn) => {
        if (asn.id !== assignmentId) return asn;
        const existingIdx = asn.submissions.findIndex((s) => s.studentId === studentId);
        const submissionEntry = {
          studentId,
          studentIndex,
          marks,
          remarks,
          status,
          submissionDate: new Date().toISOString().split('T')[0]
        };

        const updatedSubmissions =
          existingIdx >= 0
            ? asn.submissions.map((s, idx) => (idx === existingIdx ? submissionEntry : s))
            : [...asn.submissions, submissionEntry];

        return { ...asn, submissions: updatedSubmissions };
      })
    );
  };

  // Practical Tests
  const addPracticalTest = (test: Omit<PracticalTest, 'id' | 'results'>) => {
    const newTest: PracticalTest = {
      ...test,
      id: `pt-${Date.now()}`,
      results: []
    };
    setPracticalTests((prev) => [newTest, ...prev]);
  };

  const updatePracticalTest = (test: PracticalTest) => {
    setPracticalTests((prev) => prev.map((item) => (item.id === test.id ? test : item)));
  };

  const deletePracticalTest = (id: string) => {
    setPracticalTests((prev) => prev.filter((item) => item.id !== id));
  };

  const recordPracticalResult = (
    testId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    competencyAchieved: boolean,
    remarks?: string
  ) => {
    setPracticalTests((prev) =>
      prev.map((t) => {
        if (t.id !== testId) return t;
        const entry = {
          studentId,
          studentIndex,
          marks,
          maxMarks: t.maxMarks,
          competencyAchieved,
          remarks
        };
        const existingIdx = t.results.findIndex((r) => r.studentId === studentId);
        const updatedResults =
          existingIdx >= 0
            ? t.results.map((r, idx) => (idx === existingIdx ? entry : r))
            : [...t.results, entry];
        return { ...t, results: updatedResults };
      })
    );
  };

  // OJT
  const addOJTPlacement = (placement: Omit<OJTPlacement, 'id' | 'monthlyReports'>) => {
    const defaultReports: OJTPlacement['monthlyReports'] = [1, 2, 3, 4, 5, 6].map((m) => ({
      monthNumber: m as 1 | 2 | 3 | 4 | 5 | 6,
      reportMonth: `Month ${m}`,
      status: 'pending'
    }));

    const newPlacement: OJTPlacement = {
      ...placement,
      id: `ojt-${Date.now()}`,
      monthlyReports: defaultReports
    };
    setOjtPlacements((prev) => [newPlacement, ...prev]);
  };

  const updateOJTPlacement = (placement: OJTPlacement) => {
    setOjtPlacements((prev) => prev.map((p) => (p.id === placement.id ? placement : p)));
  };

  const updateOJTMonthlyReport = (
    placementId: string,
    monthNumber: 1 | 2 | 3 | 4 | 5 | 6,
    updates: Partial<OJTPlacement['monthlyReports'][0]>
  ) => {
    setOjtPlacements((prev) =>
      prev.map((p) => {
        if (p.id !== placementId) return p;
        const updatedReports = p.monthlyReports.map((r) =>
          r.monthNumber === monthNumber ? { ...r, ...updates } : r
        );
        return { ...p, monthlyReports: updatedReports };
      })
    );
  };

  const saveOJTFinalEvaluation = (
    placementId: string,
    evaluation: NonNullable<OJTPlacement['finalEvaluation']>
  ) => {
    setOjtPlacements((prev) =>
      prev.map((p) => (p.id === placementId ? { ...p, finalEvaluation: evaluation } : p))
    );
  };

  // Library Management
  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = { ...book, id: `book-${Date.now()}` };
    setBooks((prev) => [newBook, ...prev]);
  };

  const updateBook = (book: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const issueBook = (
    bookId: string,
    studentId: string,
    studentIndex: string,
    dueDateDays: number = fineSettings.maxBorrowDays
  ): { success: boolean; error?: string } => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return { success: false, error: 'Book not found.' };
    if (targetBook.availableCopies <= 0) {
      return { success: false, error: 'No copies currently available for issue.' };
    }

    // Check student active borrow limit
    const activeStudentBorrows = borrowRecords.filter(
      (r) => r.studentId === studentId && r.status !== 'returned'
    ).length;

    if (activeStudentBorrows >= fineSettings.maxBooksPerStudent) {
      return {
        success: false,
        error: `Student has already borrowed maximum allowable books (${fineSettings.maxBooksPerStudent}).`
      };
    }

    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + dueDateDays);
    const dueDate = due.toISOString().split('T')[0];

    const newRecord: BorrowRecord = {
      id: `brw-${Date.now()}`,
      bookId,
      studentId,
      studentIndex,
      issueDate,
      dueDate,
      status: 'borrowed',
      fineAmount: 0,
      fineStatus: 'none'
    };

    // Decrement available copies
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
      )
    );

    setBorrowRecords((prev) => [newRecord, ...prev]);
    return { success: true };
  };

  const returnBook = (recordId: string): { success: boolean; fineAmount: number } => {
    const record = borrowRecords.find((r) => r.id === recordId);
    if (!record || record.status === 'returned') return { success: false, fineAmount: 0 };

    const returnDate = new Date().toISOString().split('T')[0];
    const fineAmount = calculateCurrentFine(record.dueDate, returnDate);

    // Increment available copies
    setBooks((prev) =>
      prev.map((b) =>
        b.id === record.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b
      )
    );

    // Update record
    setBorrowRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              returnDate,
              status: 'returned',
              fineAmount,
              fineStatus: fineAmount > 0 ? 'pending' : 'none'
            }
          : r
      )
    );

    return { success: true, fineAmount };
  };

  const payFine = (recordId: string) => {
    setBorrowRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, fineStatus: 'paid' } : r))
    );
  };

  const waiveFine = (recordId: string) => {
    setBorrowRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, fineStatus: 'waived' } : r))
    );
  };

  const reserveBook = (bookId: string, studentId: string, studentIndex: string) => {
    const existing = bookReservations.find(
      (r) => r.bookId === bookId && r.studentId === studentId && r.status === 'active'
    );
    if (existing) {
      return { success: false, error: 'Student already has an active reservation for this book.' };
    }

    const currentBookReservations = bookReservations.filter(
      (r) => r.bookId === bookId && r.status === 'active'
    ).length;

    const newRes: BookReservation = {
      id: `res-${Date.now()}`,
      bookId,
      studentId,
      studentIndex,
      reservedDate: new Date().toISOString().split('T')[0],
      queuePosition: currentBookReservations + 1,
      status: 'active'
    };

    setBookReservations((prev) => [...prev, newRes]);
    return { success: true };
  };

  const cancelReservation = (reservationId: string) => {
    setBookReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
    );
  };

  const fulfillReservation = (reservationId: string) => {
    setBookReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'fulfilled' } : r))
    );
  };

  const updateFineSettings = (newSettings: FineSettings) => {
    setFineSettings(newSettings);
  };

  // Hostel & Meals
  const addMealWeek = (week: Omit<MealWeek, 'id'>) => {
    const newWeek: MealWeek = { ...week, id: `mw-${Date.now()}` };
    setMealWeeks((prev) => [newWeek, ...prev]);
  };

  const updateMealWeek = (week: MealWeek) => {
    setMealWeeks((prev) => prev.map((w) => (w.id === week.id ? week : w)));
  };

  const deleteMealWeek = (id: string) => {
    setMealWeeks((prev) => prev.filter((w) => w.id !== id));
  };

  const isMealWeekLocked = (mealWeek: MealWeek): boolean => {
    if (mealWeek.status === 'closed') return true;
    const now = new Date();
    const deadline = new Date(mealWeek.submissionDeadline);
    return now.getTime() > deadline.getTime();
  };

  const saveMealSubmission = (
    mealWeekId: string,
    studentId: string,
    studentIndex: string,
    choices: WeeklyMealChoices,
    specialDietaryRemarks?: string
  ): { success: boolean; error?: string } => {
    const week = mealWeeks.find((w) => w.id === mealWeekId);
    if (!week) return { success: false, error: 'Meal week not found.' };

    if (isMealWeekLocked(week)) {
      return { success: false, error: 'Submission deadline has passed for this week. Choices are locked.' };
    }

    const existingIdx = mealSubmissions.findIndex(
      (s) => s.mealWeekId === mealWeekId && s.studentId === studentId
    );

    const submission: StudentMealSubmission = {
      id: existingIdx >= 0 ? mealSubmissions[existingIdx].id : `sub-${Date.now()}`,
      mealWeekId,
      studentId,
      studentIndex,
      submittedAt: new Date().toISOString(),
      choices,
      specialDietaryRemarks
    };

    if (existingIdx >= 0) {
      setMealSubmissions((prev) =>
        prev.map((s, idx) => (idx === existingIdx ? submission : s))
      );
    } else {
      setMealSubmissions((prev) => [submission, ...prev]);
    }

    return { success: true };
  };

  // Notifications
  const addNotification = (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'readByUserIds'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readByUserIds: []
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string, userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId && !n.readByUserIds.includes(userId)) {
          return { ...n, readByUserIds: [...n.readByUserIds, userId] };
        }
        return n;
      })
    );
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.readByUserIds.includes(userId) ? n : { ...n, readByUserIds: [...n.readByUserIds, userId] }
      )
    );
  };

  // Settings
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const resetToDefaultSeed = () => {
    setAcademicYears(SEED_ACADEMIC_YEARS);
    setGroups(SEED_GROUPS);
    setStudents(SEED_STUDENTS);
    setLecturers(SEED_LECTURERS);
    setModules(SEED_MODULES);
    setAttendanceSessions(SEED_ATTENDANCE_SESSIONS);
    setAssignments(SEED_ASSIGNMENTS);
    setPracticalTests(SEED_PRACTICAL_TESTS);
    setOjtPlacements(SEED_OJT_PLACEMENTS);
    setBooks(SEED_BOOKS);
    setBorrowRecords(SEED_BORROW_RECORDS);
    setBookReservations(SEED_BOOK_RESERVATIONS);
    setFineSettings(SEED_FINE_SETTINGS);
    setMealWeeks(SEED_MEAL_WEEKS);
    setMealSubmissions(SEED_MEAL_SUBMISSIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setSettings(SEED_SYSTEM_SETTINGS);
  };

  const exportBackupJson = (): string => {
    const fullBackup = {
      academicYears,
      groups,
      students,
      lecturers,
      modules,
      attendanceSessions,
      assignments,
      practicalTests,
      ojtPlacements,
      books,
      borrowRecords,
      bookReservations,
      fineSettings,
      mealWeeks,
      mealSubmissions,
      notifications,
      settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importBackupJson = (jsonData: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonData);
      if (data.academicYears) setAcademicYears(data.academicYears);
      if (data.groups) setGroups(data.groups);
      if (data.students) setStudents(data.students);
      if (data.lecturers) setLecturers(data.lecturers);
      if (data.modules) setModules(data.modules);
      if (data.attendanceSessions) setAttendanceSessions(data.attendanceSessions);
      if (data.assignments) setAssignments(data.assignments);
      if (data.practicalTests) setPracticalTests(data.practicalTests);
      if (data.ojtPlacements) setOjtPlacements(data.ojtPlacements);
      if (data.books) setBooks(data.books);
      if (data.borrowRecords) setBorrowRecords(data.borrowRecords);
      if (data.bookReservations) setBookReservations(data.bookReservations);
      if (data.fineSettings) setFineSettings(data.fineSettings);
      if (data.mealWeeks) setMealWeeks(data.mealWeeks);
      if (data.mealSubmissions) setMealSubmissions(data.mealSubmissions);
      if (data.notifications) setNotifications(data.notifications);
      if (data.settings) setSettings(data.settings);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Invalid JSON backup format' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        academicYears,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,

        groups,
        addGroup,
        updateGroup,
        deleteGroup,

        students,
        addStudent,
        updateStudent,
        deleteStudent,

        lecturers,
        addLecturer,
        updateLecturer,
        deleteLecturer,

        modules,
        addModule,
        updateModule,
        deleteModule,

        attendanceSessions,
        addAttendanceSession,
        updateAttendanceSession,
        deleteAttendanceSession,
        calculateComputedHours,

        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        gradeAssignmentSubmission,

        practicalTests,
        addPracticalTest,
        updatePracticalTest,
        deletePracticalTest,
        recordPracticalResult,

        ojtPlacements,
        addOJTPlacement,
        updateOJTPlacement,
        updateOJTMonthlyReport,
        saveOJTFinalEvaluation,

        books,
        addBook,
        updateBook,
        deleteBook,

        borrowRecords,
        issueBook,
        returnBook,
        payFine,
        waiveFine,

        bookReservations,
        reserveBook,
        cancelReservation,
        fulfillReservation,

        fineSettings,
        updateFineSettings,
        calculateCurrentFine,

        mealWeeks,
        addMealWeek,
        updateMealWeek,
        deleteMealWeek,

        mealSubmissions,
        saveMealSubmission,
        isMealWeekLocked,

        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        settings,
        updateSettings,
        resetToDefaultSeed,
        exportBackupJson,
        importBackupJson
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
