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
  WeeklyMealChoices,
  SystemNotification,
  SystemSettings,
  SystemUser
} from '../types';

export const SEED_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'user-superadmin',
    username: 'superadmin',
    passwordHash: 'admin123',
    role: 'super_admin',
    fullName: 'Director / Super Administrator',
    email: 'admin.soa@doa.gov.lk',
    phone: '+94 47 222 8234',
    mustChangePassword: false,
    createdAt: '2024-01-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-admin',
    username: 'admin',
    passwordHash: 'admin123',
    role: 'admin',
    fullName: 'Bandara Wanasinghe',
    email: 'admin.wanasinghe@soa.doa.gov.lk',
    phone: '+94 47 222 8235',
    mustChangePassword: false,
    createdAt: '2024-01-15T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-registrar',
    username: 'registrar',
    passwordHash: 'registrar123',
    role: 'registrar',
    fullName: 'Malani Wickramatunga',
    email: 'registrar@soa.doa.gov.lk',
    phone: '+94 47 222 8236',
    mustChangePassword: false,
    createdAt: '2024-01-20T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-lecturer-1',
    username: 'lecturer.perera',
    passwordHash: 'lecturer123',
    role: 'lecturer',
    fullName: 'Dr. Kapila M. Perera',
    email: 'k.perera@soa.doa.gov.lk',
    phone: '+94 71 456 7890',
    linkedLecturerId: 'lec-1',
    mustChangePassword: false,
    createdAt: '2024-02-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-librarian',
    username: 'librarian',
    passwordHash: 'librarian123',
    role: 'librarian',
    fullName: 'Chathurika Jayasinghe',
    email: 'library@soa.doa.gov.lk',
    phone: '+94 47 222 8240',
    mustChangePassword: false,
    createdAt: '2024-02-05T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-warden',
    username: 'warden',
    passwordHash: 'warden123',
    role: 'hostel_warden',
    fullName: 'Nimal Jayawardena',
    email: 'hostel@soa.doa.gov.lk',
    phone: '+94 77 123 4567',
    mustChangePassword: false,
    createdAt: '2024-02-10T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-student-1',
    username: 'stu.2023.001',
    passwordHash: 'student123',
    role: 'student',
    fullName: 'Kasun Dananjaya Rathnayake',
    email: 'kasun.r@student.soa.ac.lk',
    phone: '+94 70 234 5678',
    linkedStudentId: 'stu-1',
    mustChangePassword: false,
    createdAt: '2024-02-15T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'user-student-new',
    username: 'new.student',
    passwordHash: 'temp1234',
    role: 'student',
    fullName: 'Tharindu Chamara Senanayake',
    email: 'tharindu.s@student.soa.ac.lk',
    phone: '+94 76 998 1234',
    linkedStudentId: 'stu-2',
    mustChangePassword: true, // For testing mandatory password change requirement!
    createdAt: '2024-03-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80'
  }
];

export const SEED_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2024-l5',
    code: '2024/2025',
    name: 'Academic Year 2024/2025 (NVQ Level 5)',
    nvqLevel: 'Level 5',
    startDate: '2024-10-01',
    endDate: '2025-09-30',
    status: 'active',
    description: 'National Certificate in Agriculture - 2 Semesters Institutional + 6 Months OJT'
  },
  {
    id: 'ay-2023-l6',
    code: '2023/2025',
    name: 'Academic Year 2023/2025 (NVQ Level 6)',
    nvqLevel: 'Level 6',
    startDate: '2023-11-01',
    endDate: '2025-10-31',
    status: 'active',
    description: 'National Diploma in Agricultural Production Technology - 4 Semesters Institutional + 6 Months OJT'
  },
  {
    id: 'ay-2025-l5',
    code: '2025/2026',
    name: 'Academic Year 2025/2026 (NVQ Level 5 Intake)',
    nvqLevel: 'Level 5',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    status: 'upcoming',
    description: 'Next admission cycle for NVQ Level 5 candidates'
  }
];

export const SEED_GROUPS: StudentGroup[] = [
  {
    id: 'grp-l5-24a',
    academicYearId: 'ay-2024-l5',
    name: 'NVQ 5 - Batch 2024 (Group A)',
    code: 'L5-2024-A',
    nvqLevel: 'Level 5',
    currentSemester: 2,
    maxCapacity: 45
  },
  {
    id: 'grp-l6-23a',
    academicYearId: 'ay-2023-l6',
    name: 'NVQ 6 - Batch 2023 (Crop Technology)',
    code: 'L6-2023-A',
    nvqLevel: 'Level 6',
    currentSemester: 3,
    maxCapacity: 35
  },
  {
    id: 'grp-l6-23b',
    academicYearId: 'ay-2023-l6',
    name: 'NVQ 6 - Batch 2023 (Farm Mechanization)',
    code: 'L6-2023-B',
    nvqLevel: 'Level 6',
    currentSemester: 3,
    maxCapacity: 35
  }
];

export const SEED_LECTURERS: Lecturer[] = [
  {
    id: 'lec-1',
    lecturerId: 'LEC-AG-001',
    fullName: 'Dr. Kapila M. Perera',
    designation: 'Senior Lecturer & Head of Crop Science',
    department: 'Crop Science & Agronomy',
    email: 'k.perera@soa.doa.gov.lk',
    phone: '+94 71 456 7890',
    qualifications: 'B.Sc. (Agric) Peradeniya, M.Sc. (Crop Science), Ph.D. (Agronomy)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    assignedModuleIds: ['mod-ag501', 'mod-ag601']
  },
  {
    id: 'lec-2',
    lecturerId: 'LEC-AG-002',
    fullName: 'Ms. Dilani L. Wickramasinghe',
    designation: 'Lecturer in Agricultural Engineering',
    department: 'Farm Machinery & Water Management',
    email: 'd.wickrama@soa.doa.gov.lk',
    phone: '+94 77 345 6789',
    qualifications: 'B.Sc. (Agric. Eng.) Ruhuna, M.Phil (Post-Harvest Technology)',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=80',
    assignedModuleIds: ['mod-ag503', 'mod-ag602', 'mod-ag604']
  },
  {
    id: 'lec-3',
    lecturerId: 'LEC-AG-003',
    fullName: 'Mr. Samantha T. Jayawardena',
    designation: 'Senior Agricultural Instructor',
    department: 'Plant Protection & Entomology',
    email: 's.jayawardena@soa.doa.gov.lk',
    phone: '+94 72 876 5432',
    qualifications: 'B.Sc. (Agric) Wayamba, M.Sc. (Crop Protection)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    assignedModuleIds: ['mod-ag504']
  },
  {
    id: 'lec-4',
    lecturerId: 'LEC-AG-004',
    fullName: 'Mrs. Priyanthi Gunasekara',
    designation: 'Lecturer in Soil Science',
    department: 'Soil Science & Plant Nutrition',
    email: 'p.gunasekara@soa.doa.gov.lk',
    phone: '+94 75 432 1098',
    qualifications: 'B.Sc. (Agric) Peradeniya, M.Sc. (Soil Science)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    assignedModuleIds: ['mod-ag502']
  }
];

export const SEED_MODULES: Module[] = [
  // NVQ Level 5 Modules
  {
    id: 'mod-ag501',
    code: 'EAT 501',
    title: 'Agronomy of Field Crops & Paddy Cultivation',
    nvqLevel: 'Level 5',
    semester: 1,
    credits: 3.5,
    theoryHours: 30,
    practicalHours: 60,
    primaryLecturerId: 'lec-1',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 2,
      fieldVisitsCount: 1
    }
  },
  {
    id: 'mod-ag502',
    code: 'EAT 502',
    title: 'Soil Fertility & Organic Fertilizer Management',
    nvqLevel: 'Level 5',
    semester: 1,
    credits: 3.0,
    theoryHours: 30,
    practicalHours: 45,
    primaryLecturerId: 'lec-4',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 1,
      fieldVisitsCount: 1
    }
  },
  {
    id: 'mod-ag503',
    code: 'EAT 503',
    title: 'Farm Machinery Operation & Maintenance',
    nvqLevel: 'Level 5',
    semester: 2,
    credits: 3.5,
    theoryHours: 25,
    practicalHours: 55,
    primaryLecturerId: 'lec-2',
    assessmentCriteria: {
      assignmentsCount: 1,
      practicalTestsCount: 2,
      fieldVisitsCount: 1
    }
  },
  {
    id: 'mod-ag504',
    code: 'EAT 504',
    title: 'Plant Protection, Pest & Weed Management',
    nvqLevel: 'Level 5',
    semester: 2,
    credits: 3.0,
    theoryHours: 30,
    practicalHours: 45,
    primaryLecturerId: 'lec-3',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 2,
      fieldVisitsCount: 1
    }
  },
  // NVQ Level 6 Modules
  {
    id: 'mod-ag601',
    code: 'DAT 601',
    title: 'Protected Agriculture & Controlled Environment Cultivation',
    nvqLevel: 'Level 6',
    semester: 3,
    credits: 4.0,
    theoryHours: 35,
    practicalHours: 65,
    primaryLecturerId: 'lec-1',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 2,
      fieldVisitsCount: 2
    }
  },
  {
    id: 'mod-ag602',
    code: 'DAT 602',
    title: 'Post-Harvest Handling & Agro-Processing Technology',
    nvqLevel: 'Level 6',
    semester: 3,
    credits: 3.5,
    theoryHours: 30,
    practicalHours: 50,
    primaryLecturerId: 'lec-2',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 1,
      fieldVisitsCount: 1
    }
  },
  {
    id: 'mod-ag604',
    code: 'DAT 604',
    title: 'Micro-Irrigation & Water Resource Management',
    nvqLevel: 'Level 6',
    semester: 4,
    credits: 3.5,
    theoryHours: 30,
    practicalHours: 50,
    primaryLecturerId: 'lec-2',
    assessmentCriteria: {
      assignmentsCount: 2,
      practicalTestsCount: 2,
      fieldVisitsCount: 1
    }
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    indexNumber: 'AG/2023/L5/001',
    barcode: '884012023001',
    nic: '200215401234',
    fullName: 'Kasun Dananjaya Rathnayake',
    callingName: 'Kasun',
    gender: 'male',
    dob: '2002-06-14',
    address: 'No. 45, Temple Road, Ranna, Tangalle',
    phone: '+94 70 234 5678',
    email: 'kasun.r@student.soa.ac.lk',
    parent: {
      name: 'R. M. Premadasa',
      relationship: 'Father',
      phone: '+94 71 892 3456',
      address: 'No. 45, Temple Road, Ranna, Tangalle',
      occupation: 'Paddy Farmer'
    },
    nvqLevel: 'Level 5',
    semester: 2,
    groupId: 'grp-l5-24a',
    academicYearId: 'ay-2024-l5',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: true,
    hostelRoomNumber: 'Boys Hostel - Block B, Room 12',
    enrollmentDate: '2024-10-05'
  },
  {
    id: 'stu-2',
    indexNumber: 'AG/2023/L5/002',
    barcode: '884012023002',
    nic: '200267801890',
    fullName: 'Tharindu Chamara Senanayake',
    callingName: 'Tharindu',
    gender: 'male',
    dob: '2002-09-22',
    address: 'Kekanadura, Matara',
    phone: '+94 76 998 1234',
    email: 'tharindu.s@student.soa.ac.lk',
    parent: {
      name: 'S. K. Senanayake',
      relationship: 'Father',
      phone: '+94 77 345 8890',
      address: 'Kekanadura, Matara',
      occupation: 'Tea Smallholder'
    },
    nvqLevel: 'Level 5',
    semester: 2,
    groupId: 'grp-l5-24a',
    academicYearId: 'ay-2024-l5',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: true,
    hostelRoomNumber: 'Boys Hostel - Block B, Room 14',
    enrollmentDate: '2024-10-05'
  },
  {
    id: 'stu-3',
    indexNumber: 'AG/2023/L5/003',
    barcode: '884012023003',
    nic: '200351208976',
    fullName: 'Sachini Madushani Karunaratne',
    callingName: 'Sachini',
    gender: 'female',
    dob: '2003-01-18',
    address: 'Main Street, Walasmulla',
    phone: '+94 78 554 3210',
    email: 'sachini.k@student.soa.ac.lk',
    parent: {
      name: 'K. A. Karunaratne',
      relationship: 'Father',
      phone: '+94 71 223 9900',
      address: 'Main Street, Walasmulla',
      occupation: 'School Teacher'
    },
    nvqLevel: 'Level 5',
    semester: 2,
    groupId: 'grp-l5-24a',
    academicYearId: 'ay-2024-l5',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: true,
    hostelRoomNumber: 'Girls Hostel - Lotus Wing, Room 05',
    enrollmentDate: '2024-10-05'
  },
  {
    id: 'stu-4',
    indexNumber: 'AG/2023/L5/004',
    barcode: '884012023004',
    nic: '200278901235',
    fullName: 'Dilshan Pradeep Weerasinghe',
    callingName: 'Dilshan',
    gender: 'male',
    dob: '2002-11-04',
    address: 'Katuwana Road, Middeniya',
    phone: '+94 71 888 4422',
    email: 'dilshan.w@student.soa.ac.lk',
    parent: {
      name: 'W. G. Weerasinghe',
      relationship: 'Father',
      phone: '+94 77 112 3344',
      address: 'Katuwana Road, Middeniya',
      occupation: 'Vegetable Cultivator'
    },
    nvqLevel: 'Level 5',
    semester: 2,
    groupId: 'grp-l5-24a',
    academicYearId: 'ay-2024-l5',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: false,
    enrollmentDate: '2024-10-05'
  },
  {
    id: 'stu-5',
    indexNumber: 'AG/2022/L6/015',
    barcode: '884012022015',
    nic: '200164201999',
    fullName: 'Nadeesha Hansani Abeyrathne',
    callingName: 'Nadeesha',
    gender: 'female',
    dob: '2001-08-12',
    address: 'Kirinda Road, Tissamaharama',
    phone: '+94 76 123 7890',
    email: 'nadeesha.a@student.soa.ac.lk',
    parent: {
      name: 'A. M. Abeyrathne',
      relationship: 'Mother',
      phone: '+94 71 456 1234',
      address: 'Kirinda Road, Tissamaharama',
      occupation: 'Government Officer'
    },
    nvqLevel: 'Level 6',
    semester: 3,
    groupId: 'grp-l6-23a',
    academicYearId: 'ay-2023-l6',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: true,
    hostelRoomNumber: 'Girls Hostel - Jasmine Wing, Room 08',
    enrollmentDate: '2023-11-01'
  },
  {
    id: 'stu-6',
    indexNumber: 'AG/2022/L6/028',
    barcode: '884012022028',
    nic: '200122104567',
    fullName: 'Ravindu Malshan Jayakody',
    callingName: 'Ravindu',
    gender: 'male',
    dob: '2001-04-30',
    address: 'Weeraketiya Road, Embilipitiya',
    phone: '+94 77 654 3219',
    email: 'ravindu.j@student.soa.ac.lk',
    parent: {
      name: 'J. M. Jayakody',
      relationship: 'Father',
      phone: '+94 77 889 0011',
      address: 'Weeraketiya Road, Embilipitiya',
      occupation: 'Farm Machinery Operator'
    },
    nvqLevel: 'Level 6',
    semester: 3,
    groupId: 'grp-l6-23b',
    academicYearId: 'ay-2023-l6',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'active',
    isHostelResident: true,
    hostelRoomNumber: 'Boys Hostel - Block A, Room 04',
    enrollmentDate: '2023-11-01'
  },
  {
    id: 'stu-7',
    indexNumber: 'AG/2022/L6/040',
    barcode: '884012022040',
    nic: '200119803322',
    fullName: 'Janith Sandaruwan Wickramasinghe',
    callingName: 'Janith',
    gender: 'male',
    dob: '2001-07-15',
    address: 'Nonagama Junction, Ambalantota',
    phone: '+94 70 998 7766',
    email: 'janith.w@student.soa.ac.lk',
    parent: {
      name: 'W. L. Wickramasinghe',
      relationship: 'Father',
      phone: '+94 71 334 5566',
      address: 'Nonagama Junction, Ambalantota',
      occupation: 'Agronomist'
    },
    nvqLevel: 'Level 6',
    semester: 'OJT',
    groupId: 'grp-l6-23a',
    academicYearId: 'ay-2023-l6',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
    enrollmentStatus: 'ojt',
    isHostelResident: false,
    enrollmentDate: '2023-11-01'
  }
];

export const SEED_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'att-sess-001',
    moduleId: 'mod-ag501',
    lecturerId: 'lec-1',
    groupId: 'grp-l5-24a',
    date: '2026-10-24',
    startTime: '08:30',
    endTime: '11:30',
    computedHours: 3.0, // (11.5 - 8.5) = 3.0 hours
    type: 'Theory',
    topicCovered: 'Paddy nursery preparation, seed treatment techniques and germination rates',
    createdAt: '2026-10-24T12:00:00Z',
    records: [
      { studentId: 'stu-1', studentIndex: 'AG/2023/L5/001', status: 'present' },
      { studentId: 'stu-2', studentIndex: 'AG/2023/L5/002', status: 'present' },
      { studentId: 'stu-3', studentIndex: 'AG/2023/L5/003', status: 'present' },
      { studentId: 'stu-4', studentIndex: 'AG/2023/L5/004', status: 'absent', remarks: 'Medical leave' }
    ]
  },
  {
    id: 'att-sess-002',
    moduleId: 'mod-ag501',
    lecturerId: 'lec-1',
    groupId: 'grp-l5-24a',
    date: '2026-10-26',
    startTime: '13:00',
    endTime: '16:00',
    computedHours: 3.0,
    type: 'Practical',
    topicCovered: 'Field demonstration of wet-bed nursery layout at DOA Demonstration Plot A',
    createdAt: '2026-10-26T16:30:00Z',
    records: [
      { studentId: 'stu-1', studentIndex: 'AG/2023/L5/001', status: 'present' },
      { studentId: 'stu-2', studentIndex: 'AG/2023/L5/002', status: 'present' },
      { studentId: 'stu-3', studentIndex: 'AG/2023/L5/003', status: 'present' },
      { studentId: 'stu-4', studentIndex: 'AG/2023/L5/004', status: 'present' }
    ]
  },
  {
    id: 'att-sess-003',
    moduleId: 'mod-ag503',
    lecturerId: 'lec-2',
    groupId: 'grp-l5-24a',
    date: '2026-10-28',
    startTime: '08:30',
    endTime: '12:30',
    computedHours: 4.0, // (12.5 - 8.5) = 4.0 hours
    type: 'Practical',
    topicCovered: 'Two-wheel walking tractor engine component identification, oil filter change, and belt tensioning',
    createdAt: '2026-10-28T13:00:00Z',
    records: [
      { studentId: 'stu-1', studentIndex: 'AG/2023/L5/001', status: 'present' },
      { studentId: 'stu-2', studentIndex: 'AG/2023/L5/002', status: 'late', remarks: 'Arrived 09:05' },
      { studentId: 'stu-3', studentIndex: 'AG/2023/L5/003', status: 'present' },
      { studentId: 'stu-4', studentIndex: 'AG/2023/L5/004', status: 'present' }
    ]
  },
  {
    id: 'att-sess-004',
    moduleId: 'mod-ag601',
    lecturerId: 'lec-1',
    groupId: 'grp-l6-23a',
    date: '2026-10-29',
    startTime: '09:00',
    endTime: '12:00',
    computedHours: 3.0,
    type: 'Theory',
    topicCovered: 'Poly-tunnel ventilation, shade netting percentages, and cooling pad systems',
    createdAt: '2026-10-29T12:30:00Z',
    records: [
      { studentId: 'stu-5', studentIndex: 'AG/2022/L6/015', status: 'present' },
      { studentId: 'stu-6', studentIndex: 'AG/2022/L6/028', status: 'present' }
    ]
  }
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asn-001',
    moduleId: 'mod-ag501',
    title: 'Assignment 1: Traditional vs. Modern High-Yielding Paddy Varieties in Southern Sri Lanka',
    description: 'Provide an in-depth comparative study on yield potential, pest resistance, and drought tolerance of Bg 300, At 362, and Suwandel varieties.',
    semester: 1,
    maxMarks: 100,
    weightagePercent: 15,
    dueDate: '2026-11-15',
    createdAt: '2026-10-15',
    submissions: [
      {
        studentId: 'stu-1',
        studentIndex: 'AG/2023/L5/001',
        status: 'submitted',
        submissionDate: '2026-11-10',
        marks: 88,
        remarks: 'Excellent comparative data tables and local farmer interviews.'
      },
      {
        studentId: 'stu-2',
        studentIndex: 'AG/2023/L5/002',
        status: 'submitted',
        submissionDate: '2026-11-14',
        marks: 76,
        remarks: 'Good content. Could include more details on fertilizer response.'
      },
      {
        studentId: 'stu-3',
        studentIndex: 'AG/2023/L5/003',
        status: 'submitted',
        submissionDate: '2026-11-12',
        marks: 92,
        remarks: 'Outstanding analytical depth on yield curves.'
      },
      {
        studentId: 'stu-4',
        studentIndex: 'AG/2023/L5/004',
        status: 'not_submitted',
        remarks: 'Pending submission'
      }
    ]
  },
  {
    id: 'asn-002',
    moduleId: 'mod-ag503',
    title: 'Assignment 1: Daily Maintenance Schedule for Four-Wheel Agricultural Tractors',
    description: 'Draft a standard operating procedure (SOP) sheet for tractor pre-start checks, 50-hour greasing points, and hydraulic fluid checks.',
    semester: 2,
    maxMarks: 50,
    weightagePercent: 10,
    dueDate: '2026-11-20',
    createdAt: '2026-10-25',
    submissions: [
      {
        studentId: 'stu-1',
        studentIndex: 'AG/2023/L5/001',
        status: 'submitted',
        submissionDate: '2026-11-01',
        marks: 46,
        remarks: 'Well illustrated maintenance diagram.'
      }
    ]
  }
];

export const SEED_PRACTICAL_TESTS: PracticalTest[] = [
  {
    id: 'pt-001',
    moduleId: 'mod-ag501',
    title: 'Practical Test 1: Paddy Weed & Seedling Identification',
    scheduledDate: '2026-11-05',
    venue: 'Demonstration Field Plot 2 & Botany Lab',
    maxMarks: 100,
    weightagePercent: 20,
    status: 'scheduled',
    results: [
      {
        studentId: 'stu-1',
        studentIndex: 'AG/2023/L5/001',
        marks: 85,
        maxMarks: 100,
        competencyAchieved: true,
        remarks: 'Accurately recognized 18 of 20 specimens including Echinochloa crus-galli.'
      },
      {
        studentId: 'stu-3',
        studentIndex: 'AG/2023/L5/003',
        marks: 94,
        maxMarks: 100,
        competencyAchieved: true,
        remarks: 'Full score on sedges and broadleaf species.'
      }
    ]
  },
  {
    id: 'pt-002',
    moduleId: 'mod-ag503',
    title: 'Practical Test 1: Power Tiller Maneuvering & Puddling Attachment Setup',
    scheduledDate: '2026-11-18',
    venue: 'Tractor Yard & Puddle Basin',
    maxMarks: 100,
    weightagePercent: 25,
    status: 'scheduled',
    results: []
  }
];

export const SEED_OJT_PLACEMENTS: OJTPlacement[] = [
  {
    id: 'ojt-001',
    studentId: 'stu-7',
    establishmentName: 'Regional Agricultural Research & Development Centre (RARDC) - Angunakolapelessa',
    establishmentAddress: 'Department of Agriculture, Angunakolapelessa, Southern Province',
    establishmentSector: 'Government Research',
    supervisorName: 'Dr. W. M. Bandara',
    supervisorDesignation: 'Senior Research Officer (Grain Legumes)',
    supervisorPhone: '+94 47 222 8204',
    supervisorEmail: 'bandara.r@doa.gov.lk',
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    monthlyReports: [
      {
        monthNumber: 1,
        reportMonth: 'Month 1 (May 2026)',
        submissionDate: '2026-06-02',
        status: 'approved',
        supervisorFeedback: 'Trainee adapted swiftly to legume breeding trial plots and pollination routines.',
        skillsPracticed: ['Groundnut hybridization', 'Pollen viability testing', 'Trial plot layout mapping'],
        reviewedBy: 'Dr. W. M. Bandara'
      },
      {
        monthNumber: 2,
        reportMonth: 'Month 2 (June 2026)',
        submissionDate: '2026-07-03',
        status: 'approved',
        supervisorFeedback: 'Diligent recording of phenological observations and soil moisture readings.',
        skillsPracticed: ['Tensiometer data logging', 'Rhizobium inoculation', 'Foliar disease scoring'],
        reviewedBy: 'Dr. W. M. Bandara'
      },
      {
        monthNumber: 3,
        reportMonth: 'Month 3 (July 2026)',
        submissionDate: '2026-08-01',
        status: 'approved',
        supervisorFeedback: 'Active participation in harvesting yield evaluation for Mungbean variety MI-6.',
        skillsPracticed: ['Pod harvest indices', 'Moisture determination oven drying', 'Data collation'],
        reviewedBy: 'Dr. W. M. Bandara'
      },
      {
        monthNumber: 4,
        reportMonth: 'Month 4 (August 2026)',
        submissionDate: '2026-09-02',
        status: 'approved',
        supervisorFeedback: 'Assisted in national seed certification sampling.',
        skillsPracticed: ['Seed purity testing', 'Germination cabinet protocols'],
        reviewedBy: 'Dr. W. M. Bandara'
      },
      {
        monthNumber: 5,
        reportMonth: 'Month 5 (September 2026)',
        submissionDate: '2026-10-04',
        status: 'approved',
        supervisorFeedback: 'Excellent logbook maintenance and analytical diligence.',
        skillsPracticed: ['Post-harvest grading', 'Entomological store pest inspection'],
        reviewedBy: 'Dr. W. M. Bandara'
      },
      {
        monthNumber: 6,
        reportMonth: 'Month 6 (October 2026)',
        submissionDate: '2026-10-30',
        status: 'submitted',
        supervisorFeedback: 'Comprehensive final compilation of all trial data ready for defense.',
        skillsPracticed: ['Final OJT report synthesis', 'Poster preparation'],
        reviewedBy: 'Dr. W. M. Bandara'
      }
    ],
    finalEvaluation: {
      technicalSkillsScore: 37,
      attendanceDisciplineScore: 19,
      logbookReportScore: 18,
      presentationScore: 18,
      totalScore: 92,
      finalGrade: 'Distinction',
      supervisorComments: 'Candidate Janith Sandaruwan showed exemplary work ethic, field leadership, and research acumen throughout the 6 months.',
      evaluatedDate: '2026-10-31'
    }
  }
];

export const SEED_BOOKS: Book[] = [
  {
    id: 'book-001',
    isbn: '978-955-0012-01-2',
    title: 'Paddy Cultivation in Sri Lanka: Principles & Modern Agronomy',
    author: 'Department of Agriculture, Peradeniya',
    category: 'Agronomy',
    publicationYear: 2021,
    totalCopies: 8,
    availableCopies: 6,
    shelfLocation: 'Shelf AGR-01-A'
  },
  {
    id: 'book-002',
    isbn: '978-019-8547-45-1',
    title: 'Principles of Agricultural Machinery & Farm Power Systems',
    author: 'D. N. Sharma & S. Mukherjee',
    category: 'Agricultural Engineering',
    publicationYear: 2020,
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'Shelf ENG-02-C'
  },
  {
    id: 'book-003',
    isbn: '978-955-4567-89-0',
    title: 'Tropical Soil Science and Nutrient Management for Dry Zone',
    author: 'Prof. R. B. Mapa',
    category: 'Soil Science',
    publicationYear: 2022,
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: 'Shelf SOIL-03-B'
  },
  {
    id: 'book-004',
    isbn: '978-047-0849-21-4',
    title: 'Protected Agriculture: Commercial Greenhouse Production & Hydroponics',
    author: 'Howard M. Resh',
    category: 'Horticulture',
    publicationYear: 2023,
    totalCopies: 4,
    availableCopies: 2,
    shelfLocation: 'Shelf HORT-04-A'
  },
  {
    id: 'book-005',
    isbn: '978-955-1234-56-7',
    title: 'Major Insect Pests of Crops in Sri Lanka and Integrated Control',
    author: 'Dr. G. A. Jayasinghe',
    category: 'Plant Protection',
    publicationYear: 2019,
    totalCopies: 7,
    availableCopies: 5,
    shelfLocation: 'Shelf PROT-05-D'
  },
  {
    id: 'book-006',
    isbn: '978-149-8732-09-1',
    title: 'Postharvest Technology of Horticultural Crops',
    author: 'Adel A. Kader',
    category: 'Food & Post-Harvest',
    publicationYear: 2022,
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: 'Shelf POST-02-B'
  }
];

export const SEED_BORROW_RECORDS: BorrowRecord[] = [
  {
    id: 'brw-001',
    bookId: 'book-001',
    studentId: 'stu-1',
    studentIndex: 'AG/2023/L5/001',
    issueDate: '2026-10-15',
    dueDate: '2026-10-29', // 14 days later - already overdue as of Nov 1, 2026!
    status: 'overdue',
    fineAmount: 30, // 3 days overdue * 10 LKR = 30 LKR
    fineStatus: 'pending'
  },
  {
    id: 'brw-002',
    bookId: 'book-002',
    studentId: 'stu-2',
    studentIndex: 'AG/2023/L5/002',
    issueDate: '2026-10-25',
    dueDate: '2026-11-08',
    status: 'borrowed',
    fineAmount: 0,
    fineStatus: 'none'
  },
  {
    id: 'brw-003',
    bookId: 'book-004',
    studentId: 'stu-5',
    studentIndex: 'AG/2022/L6/015',
    issueDate: '2026-10-20',
    dueDate: '2026-11-03',
    status: 'borrowed',
    fineAmount: 0,
    fineStatus: 'none'
  },
  {
    id: 'brw-004',
    bookId: 'book-003',
    studentId: 'stu-3',
    studentIndex: 'AG/2023/L5/003',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    returnDate: '2026-10-14',
    status: 'returned',
    fineAmount: 0,
    fineStatus: 'none'
  }
];

export const SEED_BOOK_RESERVATIONS: BookReservation[] = [
  {
    id: 'res-001',
    bookId: 'book-004',
    studentId: 'stu-6',
    studentIndex: 'AG/2022/L6/028',
    reservedDate: '2026-10-28',
    queuePosition: 1,
    status: 'active'
  }
];

export const SEED_FINE_SETTINGS: FineSettings = {
  dailyRateLkr: 10,
  maxBorrowDays: 14,
  maxBooksPerStudent: 3
};

export const SEED_MEAL_WEEKS: MealWeek[] = [
  {
    id: 'mw-2026-w45',
    weekNumber: 45,
    title: 'Week 45: Nov 02 - Nov 08, 2026',
    startDate: '2026-11-02',
    endDate: '2026-11-08',
    submissionDeadline: '2026-11-01T20:00:00', // Closes tonight at 8 PM!
    status: 'open',
    notes: 'Special agricultural field training on Wednesday; pack lunch option available.'
  },
  {
    id: 'mw-2026-w44',
    weekNumber: 44,
    title: 'Week 44: Oct 26 - Nov 01, 2026',
    startDate: '2026-10-26',
    endDate: '2026-11-01',
    submissionDeadline: '2026-10-25T18:00:00',
    status: 'closed',
    notes: 'Completed week schedule'
  }
];

export const SEED_MEAL_CHOICES_KASUN: WeeklyMealChoices = {
  monday: { breakfast: true, lunch: true, dinner: true },
  tuesday: { breakfast: true, lunch: true, dinner: true },
  wednesday: { breakfast: true, lunch: true, dinner: true },
  thursday: { breakfast: true, lunch: true, dinner: true },
  friday: { breakfast: true, lunch: true, dinner: false }, // Traveling home
  saturday: { breakfast: false, lunch: false, dinner: false },
  sunday: { breakfast: false, lunch: false, dinner: true } // Returns Sunday night
};

export const SEED_MEAL_CHOICES_SACHINI: WeeklyMealChoices = {
  monday: { breakfast: true, lunch: true, dinner: true },
  tuesday: { breakfast: true, lunch: true, dinner: true },
  wednesday: { breakfast: true, lunch: true, dinner: true },
  thursday: { breakfast: true, lunch: true, dinner: true },
  friday: { breakfast: true, lunch: true, dinner: true },
  saturday: { breakfast: true, lunch: true, dinner: true },
  sunday: { breakfast: true, lunch: true, dinner: true }
};

export const SEED_MEAL_SUBMISSIONS: StudentMealSubmission[] = [
  {
    id: 'sub-001',
    mealWeekId: 'mw-2026-w45',
    studentId: 'stu-1',
    studentIndex: 'AG/2023/L5/001',
    submittedAt: '2026-10-31T14:20:00',
    choices: SEED_MEAL_CHOICES_KASUN,
    specialDietaryRemarks: 'Vegetarian on Wednesday'
  },
  {
    id: 'sub-002',
    mealWeekId: 'mw-2026-w45',
    studentId: 'stu-3',
    studentIndex: 'AG/2023/L5/003',
    submittedAt: '2026-10-31T16:45:00',
    choices: SEED_MEAL_CHOICES_SACHINI,
    specialDietaryRemarks: 'No spicy curry'
  }
];

export const SEED_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-001',
    title: 'Reminder: Weekly Meal Choices Submission Closes Tonight',
    message: 'All hostel residents are required to confirm their meal selections for Week 45 (Nov 2 - Nov 8) before 8:00 PM tonight.',
    type: 'meal_deadline',
    priority: 'high',
    targetType: 'role',
    targetRole: 'student',
    createdAt: '2026-11-01T08:00:00Z',
    senderName: 'Hostel Warden Office',
    readByUserIds: ['user-student-1']
  },
  {
    id: 'notif-002',
    title: 'Overdue Library Book Notice',
    message: 'Book "Paddy Cultivation in Sri Lanka" was due on Oct 29, 2026. A daily fine of LKR 10.00 is being calculated.',
    type: 'library_overdue',
    priority: 'urgent',
    targetType: 'specific_student',
    targetStudentIndex: 'AG/2023/L5/001',
    createdAt: '2026-10-30T09:00:00Z',
    senderName: 'Library Circulation Desk',
    readByUserIds: []
  },
  {
    id: 'notif-003',
    title: 'Field Practical Schedule: Farm Machinery Operation',
    message: 'Level 5 Group A practical session will take place at the Tractor Yard on Wednesday morning at 08:30. Safety boots are mandatory.',
    type: 'announcement',
    priority: 'medium',
    targetType: 'all',
    createdAt: '2026-10-28T14:00:00Z',
    senderName: 'Academic Affairs - SOA Angunakolapelessa',
    readByUserIds: []
  },
  {
    id: 'notif-004',
    title: 'OJT Monthly Report 6 Evaluation Completed',
    message: 'Your final OJT evaluation has been submitted by Dr. W. M. Bandara (RARDC) with Grade Distinction.',
    type: 'ojt_update',
    priority: 'high',
    targetType: 'specific_student',
    targetStudentIndex: 'AG/2022/L6/040',
    createdAt: '2026-10-31T17:00:00Z',
    senderName: 'Registrar Office',
    readByUserIds: []
  }
];

export const SEED_SYSTEM_SETTINGS: SystemSettings = {
  institutionName: 'School of Agriculture - Angunakolapelessa',
  institutionSubheading: 'Department of Agriculture, Sri Lanka',
  academicDefaults: {
    activeAcademicYearId: 'ay-2024-l5',
    minimumAttendanceThresholdPercent: 80
  },
  library: SEED_FINE_SETTINGS,
  allowSelfRegistration: false
};
