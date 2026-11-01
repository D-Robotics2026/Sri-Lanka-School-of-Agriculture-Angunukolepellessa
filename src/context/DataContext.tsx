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
  OJTMonthlyReport,
  Book,
  BorrowRecord,
  BookReservation,
  FineSettings,
  MealWeek,
  StudentMealSubmission,
  SystemNotification,
  SystemSettings,
  WeeklyMealChoices,
  SystemUser
} from '../types';
import {
  subscribeToCollection,
  saveFirestoreDoc,
  deleteFirestoreDoc
} from '../firebase/syncService';
import { createFirebaseAuthAccount } from '../firebase/authService';

export const DEFAULT_FINE_SETTINGS: FineSettings = {
  dailyRateLkr: 10,
  maxBorrowDays: 14,
  maxBooksPerStudent: 3
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  institutionName: 'School of Agriculture - Angunakolapelessa',
  institutionSubheading: 'Department of Agriculture, Sri Lanka',
  academicDefaults: {
    activeAcademicYearId: '',
    minimumAttendanceThresholdPercent: 80
  },
  library: DEFAULT_FINE_SETTINGS,
  allowSelfRegistration: false
};

interface DataContextType {
  // Cloud Sync Status
  firestoreStatus: 'connected' | 'permission-denied' | 'connecting';

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
  addStudent: (student: Omit<Student, 'id'>, customPassword?: string) => void;
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
    weekId: string,
    studentId: string,
    studentIndex: string,
    choices: WeeklyMealChoices,
    specialDietaryRemarks?: string
  ) => { success: boolean; error?: string };
  isMealWeekLocked: (week: MealWeek) => boolean;

  // Notifications
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt' | 'readByUserIds'>) => void;
  markNotificationAsRead: (notificationId: string, userId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Settings & Sync Actions
  settings: SystemSettings;
  updateSettings: (settings: SystemSettings) => void;
  clearAllSampleData: () => void;
  resetToDefaultSeed: () => void;
  syncAllDataToFirestore: () => Promise<void>;
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
      console.error(`Error reading ${key} from localStorage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'permission-denied' | 'connecting'>('connecting');

  // Core entities initialized cleanly with zero sample mock data
  const [academicYears, setAcademicYears] = useLocalStorage<AcademicYear[]>('soa_academic_years', []);
  const [groups, setGroups] = useLocalStorage<StudentGroup[]>('soa_groups', []);
  const [students, setStudents] = useLocalStorage<Student[]>('soa_students', []);
  const [lecturers, setLecturers] = useLocalStorage<Lecturer[]>('soa_lecturers', []);
  const [modules, setModules] = useLocalStorage<Module[]>('soa_modules', []);
  const [attendanceSessions, setAttendanceSessions] = useLocalStorage<AttendanceSession[]>('soa_attendance_sessions', []);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('soa_assignments', []);
  const [practicalTests, setPracticalTests] = useLocalStorage<PracticalTest[]>('soa_practical_tests', []);
  const [ojtPlacements, setOjtPlacements] = useLocalStorage<OJTPlacement[]>('soa_ojt_placements', []);
  const [books, setBooks] = useLocalStorage<Book[]>('soa_books', []);
  const [borrowRecords, setBorrowRecords] = useLocalStorage<BorrowRecord[]>('soa_borrow_records', []);
  const [bookReservations, setBookReservations] = useLocalStorage<BookReservation[]>('soa_book_reservations', []);
  const [fineSettings, setFineSettings] = useLocalStorage<FineSettings>('soa_fine_settings', DEFAULT_FINE_SETTINGS);
  const [mealWeeks, setMealWeeks] = useLocalStorage<MealWeek[]>('soa_meal_weeks', []);
  const [mealSubmissions, setMealSubmissions] = useLocalStorage<StudentMealSubmission[]>('soa_meal_submissions', []);
  const [notifications, setNotifications] = useLocalStorage<SystemNotification[]>('soa_notifications', []);
  const [settings, setSettings] = useLocalStorage<SystemSettings>('soa_settings', DEFAULT_SYSTEM_SETTINGS);

  // Real-time synchronization listeners with Cloud Firestore
  useEffect(() => {
    const handleFirestoreError = (err: Error) => {
      if (err.message && err.message.includes('permission-denied')) {
        setFirestoreStatus('permission-denied');
      }
    };

    const handleFirestoreSuccess = () => {
      setFirestoreStatus('connected');
    };

    const unsubs = [
      subscribeToCollection<AcademicYear>('academicYears', (items) => {
        handleFirestoreSuccess();
        if (items.length > 0) setAcademicYears(items);
      }, handleFirestoreError),

      subscribeToCollection<StudentGroup>('studentGroups', (items) => {
        if (items.length > 0) setGroups(items);
      }, handleFirestoreError),

      subscribeToCollection<Student>('students', (items) => {
        if (items.length > 0) setStudents(items);
      }, handleFirestoreError),

      subscribeToCollection<Lecturer>('lecturers', (items) => {
        if (items.length > 0) setLecturers(items);
      }, handleFirestoreError),

      subscribeToCollection<Module>('modules', (items) => {
        if (items.length > 0) setModules(items);
      }, handleFirestoreError),

      subscribeToCollection<AttendanceSession>('attendanceSessions', (items) => {
        if (items.length > 0) setAttendanceSessions(items);
      }, handleFirestoreError),

      subscribeToCollection<Assignment>('assignments', (items) => {
        if (items.length > 0) setAssignments(items);
      }, handleFirestoreError),

      subscribeToCollection<PracticalTest>('practicalTests', (items) => {
        if (items.length > 0) setPracticalTests(items);
      }, handleFirestoreError),

      subscribeToCollection<OJTPlacement>('ojtPlacements', (items) => {
        if (items.length > 0) setOjtPlacements(items);
      }, handleFirestoreError),

      subscribeToCollection<Book>('books', (items) => {
        if (items.length > 0) setBooks(items);
      }, handleFirestoreError),

      subscribeToCollection<BorrowRecord>('borrowRecords', (items) => {
        if (items.length > 0) setBorrowRecords(items);
      }, handleFirestoreError),

      subscribeToCollection<BookReservation>('bookReservations', (items) => {
        if (items.length > 0) setBookReservations(items);
      }, handleFirestoreError),

      subscribeToCollection<MealWeek>('mealWeeks', (items) => {
        if (items.length > 0) setMealWeeks(items);
      }, handleFirestoreError),

      subscribeToCollection<StudentMealSubmission>('mealSubmissions', (items) => {
        if (items.length > 0) setMealSubmissions(items);
      }, handleFirestoreError),

      subscribeToCollection<SystemNotification>('notifications', (items) => {
        if (items.length > 0) setNotifications(items);
      }, handleFirestoreError)
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

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
    saveFirestoreDoc('academicYears', newAy.id, newAy);
  };

  const updateAcademicYear = (ay: AcademicYear) => {
    setAcademicYears((prev) => prev.map((item) => (item.id === ay.id ? ay : item)));
    saveFirestoreDoc('academicYears', ay.id, ay);
  };

  const deleteAcademicYear = (id: string) => {
    setAcademicYears((prev) => prev.filter((item) => item.id !== id));
    deleteFirestoreDoc('academicYears', id);
  };

  // Groups
  const addGroup = (grp: Omit<StudentGroup, 'id'>) => {
    const newGrp: StudentGroup = { ...grp, id: `grp-${Date.now()}` };
    setGroups((prev) => [newGrp, ...prev]);
    saveFirestoreDoc('studentGroups', newGrp.id, newGrp);
  };

  const updateGroup = (grp: StudentGroup) => {
    setGroups((prev) => prev.map((item) => (item.id === grp.id ? grp : item)));
    saveFirestoreDoc('studentGroups', grp.id, grp);
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((item) => item.id !== id));
    deleteFirestoreDoc('studentGroups', id);
  };

  // Students
  const addStudent = (student: Omit<Student, 'id'>, customPassword?: string) => {
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setStudents((prev) => [newStudent, ...prev]);
    saveFirestoreDoc('students', newStudent.id, newStudent);

    // Synchronize to Firebase Authentication & Firestore users
    const studentEmail =
      student.email && student.email.includes('@')
        ? student.email.trim().toLowerCase()
        : `${(student.indexNumber || student.callingName || 'stu')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')}@student.soa.doa.gov.lk`;
    const studentPassword = customPassword || student.nic || 'Student@123';
    const studentUsername = (student.indexNumber || student.callingName || `stu_${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '');

    const studentUser: SystemUser = {
      id: `user-${newStudent.id}`,
      username: studentUsername,
      passwordHash: studentPassword,
      role: 'student',
      fullName: student.fullName,
      email: studentEmail,
      phone: student.phone || '',
      linkedStudentId: newStudent.id,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    };

    saveFirestoreDoc('users', studentUser.id, studentUser);
    createFirebaseAuthAccount(studentEmail, studentPassword);
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    saveFirestoreDoc('students', student.id, student);
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteFirestoreDoc('students', id);
    deleteFirestoreDoc('users', `user-${id}`);
  };

  // Lecturers
  const addLecturer = (lecturer: Omit<Lecturer, 'id'>) => {
    const newLecturer: Lecturer = { ...lecturer, id: `lec-${Date.now()}` };
    setLecturers((prev) => [newLecturer, ...prev]);
    saveFirestoreDoc('lecturers', newLecturer.id, newLecturer);
  };

  const updateLecturer = (lecturer: Lecturer) => {
    setLecturers((prev) => prev.map((l) => (l.id === lecturer.id ? lecturer : l)));
    saveFirestoreDoc('lecturers', lecturer.id, lecturer);
  };

  const deleteLecturer = (id: string) => {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    deleteFirestoreDoc('lecturers', id);
  };

  // Modules
  const addModule = (module: Omit<Module, 'id'>) => {
    const newModule: Module = { ...module, id: `mod-${Date.now()}` };
    setModules((prev) => [newModule, ...prev]);
    saveFirestoreDoc('modules', newModule.id, newModule);
  };

  const updateModule = (module: Module) => {
    setModules((prev) => prev.map((m) => (m.id === module.id ? module : m)));
    saveFirestoreDoc('modules', module.id, module);
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    deleteFirestoreDoc('modules', id);
  };

  // Attendance
  const addAttendanceSession = (session: Omit<AttendanceSession, 'id' | 'computedHours' | 'createdAt'>): AttendanceSession => {
    const computedHours = calculateComputedHours(session.startTime, session.endTime);
    const newSession: AttendanceSession = {
      ...session,
      id: `att-${Date.now()}`,
      computedHours,
      createdAt: new Date().toISOString()
    };
    setAttendanceSessions((prev) => [newSession, ...prev]);
    saveFirestoreDoc('attendanceSessions', newSession.id, newSession);
    return newSession;
  };

  const updateAttendanceSession = (session: AttendanceSession) => {
    const computedHours = calculateComputedHours(session.startTime, session.endTime);
    const updated = { ...session, computedHours };
    setAttendanceSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    saveFirestoreDoc('attendanceSessions', updated.id, updated);
  };

  const deleteAttendanceSession = (id: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== id));
    deleteFirestoreDoc('attendanceSessions', id);
  };

  // Assessments
  const addAssignment = (asn: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => {
    const newAsn: Assignment = {
      ...asn,
      id: `asn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    setAssignments((prev) => [newAsn, ...prev]);
    saveFirestoreDoc('assignments', newAsn.id, newAsn);
  };

  const updateAssignment = (asn: Assignment) => {
    setAssignments((prev) => prev.map((item) => (item.id === asn.id ? asn : item)));
    saveFirestoreDoc('assignments', asn.id, asn);
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((item) => item.id !== id));
    deleteFirestoreDoc('assignments', id);
  };

  const gradeAssignmentSubmission = (
    assignmentId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    remarks?: string,
    status: 'submitted' | 'late' = 'submitted'
  ) => {
    setAssignments((prev) => {
      const updated = prev.map((asn) => {
        if (asn.id !== assignmentId) return asn;
        const exists = asn.submissions.some((sub) => sub.studentId === studentId);
        let newSubs;
        if (exists) {
          newSubs = asn.submissions.map((sub) =>
            sub.studentId === studentId
              ? {
                  ...sub,
                  marks,
                  remarks: remarks || sub.remarks,
                  status,
                  submissionDate: sub.submissionDate || new Date().toISOString()
                }
              : sub
          );
        } else {
          newSubs = [
            ...asn.submissions,
            {
              studentId,
              studentIndex,
              submissionDate: new Date().toISOString(),
              marks,
              remarks,
              status
            }
          ];
        }
        const updatedAsn = { ...asn, submissions: newSubs };
        saveFirestoreDoc('assignments', updatedAsn.id, updatedAsn);
        return updatedAsn;
      });
      return updated;
    });
  };

  // Practical Tests
  const addPracticalTest = (test: Omit<PracticalTest, 'id' | 'results'>) => {
    const newTest: PracticalTest = {
      ...test,
      id: `pt-${Date.now()}`,
      results: []
    };
    setPracticalTests((prev) => [newTest, ...prev]);
    saveFirestoreDoc('practicalTests', newTest.id, newTest);
  };

  const updatePracticalTest = (test: PracticalTest) => {
    setPracticalTests((prev) => prev.map((t) => (t.id === test.id ? test : t)));
    saveFirestoreDoc('practicalTests', test.id, test);
  };

  const deletePracticalTest = (id: string) => {
    setPracticalTests((prev) => prev.filter((t) => t.id !== id));
    deleteFirestoreDoc('practicalTests', id);
  };

  const recordPracticalResult = (
    testId: string,
    studentId: string,
    studentIndex: string,
    marks: number,
    competencyAchieved: boolean,
    remarks?: string
  ) => {
    setPracticalTests((prev) => {
      const updated = prev.map((test) => {
        if (test.id !== testId) return test;
        const exists = test.results.some((r) => r.studentId === studentId);
        let newResults;
        if (exists) {
          newResults = test.results.map((r) =>
            r.studentId === studentId
              ? {
                  ...r,
                  marks,
                  maxMarks: test.maxMarks,
                  competencyAchieved,
                  remarks: remarks || r.remarks
                }
              : r
          );
        } else {
          newResults = [
            ...test.results,
            {
              studentId,
              studentIndex,
              marks,
              maxMarks: test.maxMarks,
              competencyAchieved,
              remarks
            }
          ];
        }
        const updatedTest = { ...test, results: newResults };
        saveFirestoreDoc('practicalTests', updatedTest.id, updatedTest);
        return updatedTest;
      });
      return updated;
    });
  };

  // OJT
  const addOJTPlacement = (placement: Omit<OJTPlacement, 'id' | 'monthlyReports'>) => {
    const defaultReports: OJTMonthlyReport[] = ([1, 2, 3, 4, 5, 6] as const).map((m) => ({
      monthNumber: m,
      reportMonth: `Month ${m}`,
      status: 'pending' as const
    }));

    const newPlacement: OJTPlacement = {
      ...placement,
      id: `ojt-${Date.now()}`,
      monthlyReports: defaultReports
    };
    setOjtPlacements((prev) => [newPlacement, ...prev]);
    saveFirestoreDoc('ojtPlacements', newPlacement.id, newPlacement);
  };

  const updateOJTPlacement = (placement: OJTPlacement) => {
    setOjtPlacements((prev) => prev.map((p) => (p.id === placement.id ? placement : p)));
    saveFirestoreDoc('ojtPlacements', placement.id, placement);
  };

  const updateOJTMonthlyReport = (
    placementId: string,
    monthNumber: 1 | 2 | 3 | 4 | 5 | 6,
    updates: Partial<OJTPlacement['monthlyReports'][0]>
  ) => {
    setOjtPlacements((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== placementId) return p;
        const newReports = p.monthlyReports.map((r) =>
          r.monthNumber === monthNumber ? { ...r, ...updates } : r
        );
        const updatedPlc = { ...p, monthlyReports: newReports };
        saveFirestoreDoc('ojtPlacements', updatedPlc.id, updatedPlc);
        return updatedPlc;
      });
      return updated;
    });
  };

  const saveOJTFinalEvaluation = (
    placementId: string,
    evaluation: NonNullable<OJTPlacement['finalEvaluation']>
  ) => {
    setOjtPlacements((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== placementId) return p;
        const updatedPlc = { ...p, finalEvaluation: evaluation };
        saveFirestoreDoc('ojtPlacements', updatedPlc.id, updatedPlc);
        return updatedPlc;
      });
      return updated;
    });
  };

  // Library
  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = { ...book, id: `bk-${Date.now()}` };
    setBooks((prev) => [newBook, ...prev]);
    saveFirestoreDoc('books', newBook.id, newBook);
  };

  const updateBook = (book: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    saveFirestoreDoc('books', book.id, book);
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    deleteFirestoreDoc('books', id);
  };

  const issueBook = (
    bookId: string,
    studentId: string,
    studentIndex: string,
    dueDateDays: number = fineSettings.maxBorrowDays
  ) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return { success: false, error: 'Book not found' };
    if (targetBook.availableCopies <= 0) return { success: false, error: 'No copies currently available' };

    const activeBorrows = borrowRecords.filter(
      (r) => r.studentId === studentId && r.status !== 'returned'
    );
    if (activeBorrows.length >= fineSettings.maxBooksPerStudent) {
      return { success: false, error: `Student already reached maximum limit of ${fineSettings.maxBooksPerStudent} books` };
    }

    const issueDate = new Date().toISOString().split('T')[0];
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

    const updatedBook = {
      ...targetBook,
      availableCopies: targetBook.availableCopies - 1
    };

    setBooks((prev) => prev.map((b) => (b.id === bookId ? updatedBook : b)));
    setBorrowRecords((prev) => [newRecord, ...prev]);

    saveFirestoreDoc('books', updatedBook.id, updatedBook);
    saveFirestoreDoc('borrowRecords', newRecord.id, newRecord);

    return { success: true };
  };

  const returnBook = (recordId: string) => {
    const record = borrowRecords.find((r) => r.id === recordId);
    if (!record || record.status === 'returned') return { success: false, fineAmount: 0 };

    const returnDate = new Date().toISOString().split('T')[0];
    const fine = calculateCurrentFine(record.dueDate, returnDate);

    const updatedRecord: BorrowRecord = {
      ...record,
      returnDate,
      status: 'returned',
      fineAmount: fine,
      fineStatus: fine > 0 ? (record.fineStatus === 'paid' ? 'paid' : 'pending') : 'none'
    };

    const book = books.find((b) => b.id === record.bookId);
    if (book) {
      const updatedBook = { ...book, availableCopies: Math.min(book.totalCopies, book.availableCopies + 1) };
      setBooks((prev) => prev.map((b) => (b.id === book.id ? updatedBook : b)));
      saveFirestoreDoc('books', updatedBook.id, updatedBook);
    }

    setBorrowRecords((prev) => prev.map((r) => (r.id === recordId ? updatedRecord : r)));
    saveFirestoreDoc('borrowRecords', updatedRecord.id, updatedRecord);

    return { success: true, fineAmount: fine };
  };

  const payFine = (recordId: string) => {
    setBorrowRecords((prev) => {
      const updated = prev.map((r) => (r.id === recordId ? { ...r, fineStatus: 'paid' as const } : r));
      const target = updated.find((r) => r.id === recordId);
      if (target) saveFirestoreDoc('borrowRecords', target.id, target);
      return updated;
    });
  };

  const waiveFine = (recordId: string) => {
    setBorrowRecords((prev) => {
      const updated = prev.map((r) => (r.id === recordId ? { ...r, fineStatus: 'waived' as const, fineAmount: 0 } : r));
      const target = updated.find((r) => r.id === recordId);
      if (target) saveFirestoreDoc('borrowRecords', target.id, target);
      return updated;
    });
  };

  const reserveBook = (bookId: string, studentId: string, studentIndex: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, error: 'Book not found' };

    const existingReservations = bookReservations.filter((r) => r.bookId === bookId && r.status === 'active');
    const newReservation: BookReservation = {
      id: `res-${Date.now()}`,
      bookId,
      studentId,
      studentIndex,
      reservedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      queuePosition: existingReservations.length + 1
    };

    setBookReservations((prev) => [...prev, newReservation]);
    saveFirestoreDoc('bookReservations', newReservation.id, newReservation);

    return { success: true };
  };

  const cancelReservation = (reservationId: string) => {
    setBookReservations((prev) => {
      const updated = prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' as const } : r));
      const target = updated.find((r) => r.id === reservationId);
      if (target) saveFirestoreDoc('bookReservations', target.id, target);
      return updated;
    });
  };

  const fulfillReservation = (reservationId: string) => {
    setBookReservations((prev) => {
      const updated = prev.map((r) => (r.id === reservationId ? { ...r, status: 'fulfilled' as const } : r));
      const target = updated.find((r) => r.id === reservationId);
      if (target) saveFirestoreDoc('bookReservations', target.id, target);
      return updated;
    });
  };

  const updateFineSettings = (newSettings: FineSettings) => {
    setFineSettings(newSettings);
    saveFirestoreDoc('settings', 'fineSettings', newSettings);
  };

  // Hostel & Meals
  const isMealWeekLocked = (week: MealWeek): boolean => {
    if (week.status === 'closed') return true;
    const now = new Date();
    const deadline = new Date(week.submissionDeadline);
    return now > deadline;
  };

  const addMealWeek = (week: Omit<MealWeek, 'id'>) => {
    const newWeek: MealWeek = { ...week, id: `mw-${Date.now()}` };
    setMealWeeks((prev) => [newWeek, ...prev]);
    saveFirestoreDoc('mealWeeks', newWeek.id, newWeek);
  };

  const updateMealWeek = (week: MealWeek) => {
    setMealWeeks((prev) => prev.map((w) => (w.id === week.id ? week : w)));
    saveFirestoreDoc('mealWeeks', week.id, week);
  };

  const deleteMealWeek = (id: string) => {
    setMealWeeks((prev) => prev.filter((w) => w.id !== id));
    deleteFirestoreDoc('mealWeeks', id);
  };

  const saveMealSubmission = (
    weekId: string,
    studentId: string,
    studentIndex: string,
    choices: WeeklyMealChoices,
    specialDietaryRemarks?: string
  ) => {
    const week = mealWeeks.find((w) => w.id === weekId);
    if (!week) return { success: false, error: 'Meal week not found' };
    if (isMealWeekLocked(week)) {
      return { success: false, error: 'Submissions for this meal schedule are locked.' };
    }

    const existing = mealSubmissions.find((s) => s.mealWeekId === weekId && s.studentId === studentId);
    let submissionToSave: StudentMealSubmission;

    if (existing) {
      submissionToSave = {
        ...existing,
        choices,
        specialDietaryRemarks:
          specialDietaryRemarks !== undefined ? specialDietaryRemarks : existing.specialDietaryRemarks,
        submittedAt: new Date().toISOString()
      };
      setMealSubmissions((prev) => prev.map((s) => (s.id === existing.id ? submissionToSave : s)));
    } else {
      submissionToSave = {
        id: `ms-${Date.now()}`,
        mealWeekId: weekId,
        studentId,
        studentIndex,
        submittedAt: new Date().toISOString(),
        choices,
        specialDietaryRemarks
      };
      setMealSubmissions((prev) => [submissionToSave, ...prev]);
    }

    saveFirestoreDoc('mealSubmissions', submissionToSave.id, submissionToSave);
    return { success: true };
  };

  // Notifications
  const addNotification = (notification: Omit<SystemNotification, 'id' | 'createdAt' | 'readByUserIds'>) => {
    const newNotif: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readByUserIds: []
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveFirestoreDoc('notifications', newNotif.id, newNotif);
  };

  const markNotificationAsRead = (notificationId: string, userId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (n.id === notificationId && !n.readByUserIds.includes(userId)) {
          const updatedNotif = { ...n, readByUserIds: [...n.readByUserIds, userId] };
          saveFirestoreDoc('notifications', updatedNotif.id, updatedNotif);
          return updatedNotif;
        }
        return n;
      });
      return updated;
    });
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (!n.readByUserIds.includes(userId)) {
          const updatedNotif = { ...n, readByUserIds: [...n.readByUserIds, userId] };
          saveFirestoreDoc('notifications', updatedNotif.id, updatedNotif);
          return updatedNotif;
        }
        return n;
      });
      return updated;
    });
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveFirestoreDoc('settings', 'systemSettings', newSettings);
  };

  // Clear all sample mock data cleanly
  const clearAllSampleData = () => {
    setAcademicYears([]);
    setGroups([]);
    setStudents([]);
    setLecturers([]);
    setModules([]);
    setAttendanceSessions([]);
    setAssignments([]);
    setPracticalTests([]);
    setOjtPlacements([]);
    setBooks([]);
    setBorrowRecords([]);
    setBookReservations([]);
    setMealWeeks([]);
    setMealSubmissions([]);
    setNotifications([]);
    localStorage.clear();
  };

  // One-click mass sync local state to Cloud Firestore
  const syncAllDataToFirestore = async () => {
    for (const ay of academicYears) await saveFirestoreDoc('academicYears', ay.id, ay);
    for (const g of groups) await saveFirestoreDoc('studentGroups', g.id, g);
    for (const s of students) await saveFirestoreDoc('students', s.id, s);
    for (const l of lecturers) await saveFirestoreDoc('lecturers', l.id, l);
    for (const m of modules) await saveFirestoreDoc('modules', m.id, m);
    for (const a of attendanceSessions) await saveFirestoreDoc('attendanceSessions', a.id, a);
    for (const as of assignments) await saveFirestoreDoc('assignments', as.id, as);
    for (const pt of practicalTests) await saveFirestoreDoc('practicalTests', pt.id, pt);
    for (const o of ojtPlacements) await saveFirestoreDoc('ojtPlacements', o.id, o);
    for (const b of books) await saveFirestoreDoc('books', b.id, b);
    for (const br of borrowRecords) await saveFirestoreDoc('borrowRecords', br.id, br);
    for (const res of bookReservations) await saveFirestoreDoc('bookReservations', res.id, res);
    for (const mw of mealWeeks) await saveFirestoreDoc('mealWeeks', mw.id, mw);
    for (const ms of mealSubmissions) await saveFirestoreDoc('mealSubmissions', ms.id, ms);
    for (const n of notifications) await saveFirestoreDoc('notifications', n.id, n);
    await saveFirestoreDoc('settings', 'systemSettings', settings);
  };

  const exportBackupJson = (): string => {
    return JSON.stringify(
      {
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
        settings
      },
      null,
      2
    );
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
        firestoreStatus,
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
        clearAllSampleData,
        resetToDefaultSeed: clearAllSampleData,
        syncAllDataToFirestore,
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
