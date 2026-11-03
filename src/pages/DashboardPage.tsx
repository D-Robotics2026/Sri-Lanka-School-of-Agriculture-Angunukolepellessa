import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { BarcodeDisplay } from '../components/common/BarcodeDisplay';
import { Modal } from '../components/common/Modal';
import { ImageUpload } from '../components/common/ImageUpload';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  UtensilsCrossed,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Shield,
  ShieldAlert,
  Coins,
  Library,
  Briefcase,
  Layers,
  Settings,
  Database,
  Printer,
  BookOpenCheck,
  Building,
  UserCheck,
  Coffee,
  Sun,
  Moon,
  Lock,
  Unlock,
  KeyRound,
  Camera
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, updateUser } = useAuth();
  const {
    students,
    updateStudent,
    lecturers,
    modules,
    attendanceSessions,
    assignments,
    practicalTests,
    books,
    borrowRecords,
    bookReservations,
    mealWeeks,
    mealSubmissions,
    ojtPlacements,
    academicYears,
    groups,
    settings,
    fineSettings
  } = useData();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  if (!currentUser) return null;

  // Global Institutional Metrics
  const totalStudents = students.length;
  const nvq5Count = students.filter((s) => s.nvqLevel === 'Level 5').length;
  const nvq6Count = students.filter((s) => s.nvqLevel === 'Level 6').length;
  const ojtCount = students.filter((s) => s.enrollmentStatus === 'ojt' || s.semester === 'OJT').length;

  const activeBorrows = borrowRecords.filter((r) => r.status === 'borrowed' || r.status === 'overdue').length;
  const overdueBorrows = borrowRecords.filter((r) => r.status === 'overdue').length;
  const totalFinesPending = borrowRecords
    .filter((r) => r.fineStatus === 'pending')
    .reduce((sum, r) => sum + r.fineAmount, 0);

  const activeMealWeek = mealWeeks.find((w) => w.status === 'open') || mealWeeks[0];
  const activeWeekSubmissions = mealSubmissions.filter((s) => s.mealWeekId === activeMealWeek?.id).length;
  const hostelStudents = students.filter((s) => s.isHostelResident);

  // Common Chart data: Attendance by module
  const moduleAttendanceData = useMemo(() => {
    return modules.map((mod) => {
      const sessions = attendanceSessions.filter((s) => s.moduleId === mod.id);
      let totalPresent = 0;
      let totalRecords = 0;
      sessions.forEach((s) => {
        s.records.forEach((r) => {
          totalRecords++;
          if (r.status === 'present') totalPresent++;
        });
      });
      const rate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 85;
      return {
        name: mod.code,
        title: mod.title,
        attendanceRate: rate,
        sessionsCount: sessions.length
      };
    });
  }, [modules, attendanceSessions]);

  const nvqBreakdownData = [
    { name: 'NVQ Level 5 (1-Yr)', value: nvq5Count, color: '#10b981' },
    { name: 'NVQ Level 6 (2-Yr)', value: nvq6Count, color: '#3b82f6' }
  ];

  /* =========================================================================
     1. STUDENT DASHBOARD (Scoped to personal academic records & hostel)
     ========================================================================= */
  if (currentUser.role === 'student') {
    const student = students.find((s) => s.id === currentUser.linkedStudentId) || students[0];
    const myBorrows = borrowRecords.filter((r) => r.studentId === student.id && r.status !== 'returned');
    const mySubmissions = mealSubmissions.find(
      (s) => s.studentId === student.id && s.mealWeekId === activeMealWeek?.id
    );

    let studentPresentSessions = 0;
    let studentTotalSessions = 0;
    attendanceSessions.forEach((sess) => {
      const rec = sess.records.find((r) => r.studentId === student.id);
      if (rec) {
        studentTotalSessions++;
        if (rec.status === 'present') studentPresentSessions++;
      }
    });
    const studentAttendancePct =
      studentTotalSessions > 0 ? Math.round((studentPresentSessions / studentTotalSessions) * 100) : 100;
    const isEligible = studentAttendancePct >= settings.academicDefaults.minimumAttendanceThresholdPercent;

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={
                    student.photoUrl ||
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                  }
                  alt={student.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/50 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md border-2 border-white transition active:scale-90"
                  title="Upload / Change Photo (Max 1MB)"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-2">
                  <span>Personal Student Portal</span>
                  <span>•</span>
                  <span>{student.nvqLevel}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">{student.fullName}</h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                  Index No: <span className="font-mono font-bold text-white">{student.indexNumber}</span> • NIC: {student.nic} • Semester {student.semester}
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20 self-start md:self-auto">
              <BarcodeDisplay value={student.barcode} label="Official Student ID Barcode" height={36} />
            </div>
          </div>
        </div>

        {/* Student Profile Photo Upload Modal */}
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title="Update Official Profile Photo"
          subtitle="Department of Agriculture — Student Official Record"
          maxWidth="md"
        >
          <div className="space-y-4">
            <ImageUpload
              value={student.photoUrl || currentUser.avatar}
              onChange={(url) => {
                if (student) {
                  updateStudent({ ...student, photoUrl: url });
                }
                if (currentUser) {
                  updateUser({ ...currentUser, avatar: url });
                }
              }}
              folder="students"
              label="Student Official Photograph (Max 1MB • Firebase Storage)"
              shape="square"
            />
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Save Photo
              </button>
            </div>
          </div>
        </Modal>

        {/* Limited Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Attendance Rate"
            value={`${studentAttendancePct}%`}
            subtitle={isEligible ? 'Eligible for Exams (≥80%)' : 'Attendance Warning (<80%)'}
            icon={CheckSquare}
            color={isEligible ? 'emerald' : 'rose'}
            onClick={() => onNavigate('attendance')}
          />
          <StatCard
            title="Weekly Meal Choice"
            value={mySubmissions ? 'Submitted' : 'Pending Selection'}
            subtitle={activeMealWeek?.title}
            icon={UtensilsCrossed}
            color={mySubmissions ? 'emerald' : 'amber'}
            onClick={() => onNavigate('hostel')}
          />
          <StatCard
            title="Active Library Books"
            value={myBorrows.length}
            subtitle={myBorrows.some((b) => b.status === 'overdue') ? '1 or more overdue!' : 'Within due period'}
            icon={BookOpen}
            color={myBorrows.some((b) => b.status === 'overdue') ? 'rose' : 'blue'}
            onClick={() => onNavigate('library')}
          />
          <StatCard
            title="Enrolled Modules"
            value={modules.filter((m) => m.nvqLevel === student.nvqLevel).length}
            subtitle={student.nvqLevel === 'Level 5' ? '1-Year Curriculum' : '2-Year Curriculum'}
            icon={GraduationCap}
            color="indigo"
            onClick={() => onNavigate('modules')}
          />
        </div>

        {/* Student Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Weekly Hostel Dining Choice</h3>
                  <p className="text-xs text-slate-500">7×3 Meal Selection Matrix</p>
                </div>
              </div>
              <Badge variant={mySubmissions ? 'green' : 'amber'}>
                {mySubmissions ? 'Submitted' : 'Action Required'}
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-slate-700">{activeMealWeek.title}</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Deadline: {formatDateTime(activeMealWeek.submissionDeadline)}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure you submit your Breakfast, Lunch, and Dinner options across all 7 days before the kitchen lock deadline.
              </p>
            </div>

            <button
              onClick={() => onNavigate('hostel')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <span>{mySubmissions ? 'Review / Edit 7×3 Meal Matrix' : 'Fill 7×3 Meal Matrix Now'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Training & OJT Pathway</h3>
                  <p className="text-xs text-slate-500">
                    {student.nvqLevel === 'Level 5' ? '1 Year: 2 Semesters + 6M OJT' : '2 Years: 4 Semesters + 6M OJT'}
                  </p>
                </div>
              </div>
              <Badge variant="blue">{student.nvqLevel}</Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Curriculum Progression</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {student.nvqLevel === 'Level 5' ? 'Semester 2 of 2' : 'Semester 3 of 4'}
                </span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">Mandatory 6-Month OJT</span>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  {student.semester === 'OJT' ? 'Active in Industry' : 'Post-Semester Phase'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ojt')}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <span>View OJT Guidelines & Placements</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. HOSTEL WARDEN DASHBOARD (Scoped strictly to Hostel & Meals)
     ========================================================================= */
  if (currentUser.role === 'hostel_warden') {
    const isLocked = activeMealWeek.status === 'closed' || new Date() > new Date(activeMealWeek.submissionDeadline);

    return (
      <div className="space-y-6">
        {/* Warden Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-800 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-amber-200 mb-2">
                <UtensilsCrossed size={14} />
                <span>Hostel & Catering Operations</span>
                <span>•</span>
                <span>Limited Scope: Boarding & Dining</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
              <p className="text-amber-100 text-xs sm:text-sm mt-1">
                Overseeing student residential blocks, 7×3 meal submissions, and kitchen catering provisions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('hostel')}
                className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-amber-50 transition shadow-sm flex items-center gap-2"
              >
                <Printer size={15} />
                <span>Kitchen Duty Printouts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warden Scoped KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Meal Week"
            value={activeMealWeek.title.split(':')[0]}
            subtitle={isLocked ? 'Submissions Locked' : 'Open for Submissions'}
            icon={Calendar}
            color={isLocked ? 'rose' : 'emerald'}
            onClick={() => onNavigate('hostel')}
          />
          <StatCard
            title="Boarder Submissions"
            value={`${activeWeekSubmissions} / ${hostelStudents.length}`}
            subtitle={`${Math.round((activeWeekSubmissions / (hostelStudents.length || 1)) * 100)}% Participation`}
            icon={UtensilsCrossed}
            color="amber"
            onClick={() => onNavigate('hostel')}
          />
          <StatCard
            title="Resident Boarders"
            value={hostelStudents.length}
            subtitle="Boys & Girls Hostels"
            icon={Users}
            color="blue"
            onClick={() => onNavigate('students')}
          />
          <StatCard
            title="Kitchen Sheet"
            value="Ready"
            subtitle="Daily catering breakdown"
            icon={Printer}
            color="indigo"
            onClick={() => onNavigate('hostel')}
          />
        </div>

        {/* Quick Action Tiles for Warden */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('hostel')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Manage 7×3 Weekly Meal Matrix</h4>
                <p className="text-[11px] text-slate-500">Open/close schedules & set deadlines</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">Review student breakfast, lunch, and dinner bookings for this week.</p>
          </div>

          <div
            onClick={() => onNavigate('students')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Resident Boarders Directory</h4>
                <p className="text-[11px] text-slate-500">Hostel room & block assignments</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">Inspect resident details, room numbers, and parent contacts.</p>
          </div>

          <div
            onClick={() => onNavigate('notifications')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Send Meal Deadline Notice</h4>
                <p className="text-[11px] text-slate-500">Targeted broadcast to boarders</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">Remind students to confirm choices before the Sunday deadline lock.</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. LIBRARIAN DASHBOARD (Scoped strictly to Library & Fines)
     ========================================================================= */
  if (currentUser.role === 'librarian') {
    const overdueList = borrowRecords.filter((r) => r.status === 'overdue');

    return (
      <div className="space-y-6">
        {/* Librarian Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-teal-200 mb-2">
                <Library size={14} />
                <span>Central Agricultural Library</span>
                <span>•</span>
                <span>Limited Scope: Catalogue & Circulation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-1">
                Managing book inventory, circulation issuing/returns, reservations, and overdue fine collection.
              </p>
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-teal-50 transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <BookOpen size={15} />
              <span>Issue / Return Desk</span>
            </button>
          </div>
        </div>

        {/* Librarian Scoped KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Book Titles"
            value={books.length}
            subtitle={`${books.reduce((s, b) => s + b.totalCopies, 0)} Total Copies in Stock`}
            icon={Library}
            color="emerald"
            onClick={() => onNavigate('library')}
          />
          <StatCard
            title="Active Borrowings"
            value={activeBorrows}
            subtitle={`${books.reduce((s, b) => s + b.availableCopies, 0)} on shelves`}
            icon={BookOpen}
            color="blue"
            onClick={() => onNavigate('library')}
          />
          <StatCard
            title="Overdue Books"
            value={overdueBorrows}
            subtitle="Follow-up needed"
            icon={AlertTriangle}
            color={overdueBorrows > 0 ? 'rose' : 'slate'}
            onClick={() => onNavigate('library')}
          />
          <StatCard
            title="Pending Fines"
            value={`LKR ${totalFinesPending}`}
            subtitle={`Daily Rate: LKR ${fineSettings.dailyRateLkr}/day`}
            icon={Coins}
            color="amber"
            onClick={() => onNavigate('library')}
          />
        </div>

        {/* Overdue Borrowings Follow-up Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Overdue Books Needing Recovery</h3>
              <p className="text-xs text-slate-500">Auto-computing fines daily at LKR {fineSettings.dailyRateLkr}.00/day</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Open Full Circulation Desk
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Overdue Fine</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No overdue books currently pending.
                    </td>
                  </tr>
                ) : (
                  overdueList.map((rec) => {
                    const bk = books.find((b) => b.id === rec.bookId);
                    const stu = students.find((s) => s.id === rec.studentId);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {stu?.fullName} <span className="font-mono text-[11px] text-slate-400">({rec.studentIndex})</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{bk?.title}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">{formatDate(rec.dueDate)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">LKR {rec.fineAmount}.00</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onNavigate('library')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                          >
                            Process Return
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     4. LECTURER DASHBOARD (Scoped to Teaching Modules, Attendance & Grading)
     ========================================================================= */
  if (currentUser.role === 'lecturer') {
    const myModules = modules.filter(
      (m) => m.primaryLecturerId === currentUser.linkedLecturerId || currentUser.linkedLecturerId === 'lec-1'
    );
    const mySessions = attendanceSessions.filter(
      (s) => s.lecturerId === currentUser.linkedLecturerId || currentUser.linkedLecturerId === 'lec-1'
    );
    const myAssignments = assignments.filter((a) => myModules.some((m) => m.id === a.moduleId));
    const pendingGradingCount = myAssignments.reduce(
      (acc, a) => acc + a.submissions.filter((s) => s.status === 'submitted' && s.marks === undefined).length,
      0
    );

    return (
      <div className="space-y-6">
        {/* Lecturer Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-emerald-200 mb-2">
                <BookOpenCheck size={14} />
                <span>Academic Faculty Portal</span>
                <span>•</span>
                <span>Teaching & Evaluation Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                Conducting Theory & Practical Sessions with auto-calculated duration hours, student assignments, and practical competency tests.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
              >
                <CheckSquare size={16} />
                <span>Record Attendance Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lecturer Scoped KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Assigned Modules"
            value={myModules.length}
            subtitle="Curriculum in progress"
            icon={BookOpenCheck}
            color="emerald"
            onClick={() => onNavigate('modules')}
          />
          <StatCard
            title="Conducted Sessions"
            value={mySessions.length}
            subtitle={`${mySessions.reduce((sum, s) => sum + s.computedHours, 0).toFixed(1)} Hours Delivered`}
            icon={Clock}
            color="blue"
            onClick={() => onNavigate('attendance')}
          />
          <StatCard
            title="Assignments to Grade"
            value={myAssignments.length}
            subtitle="Active student assessments"
            icon={FileSpreadsheet}
            color="amber"
            onClick={() => onNavigate('assessments')}
          />
          <StatCard
            title="Practical Tests"
            value={practicalTests.length}
            subtitle="Scheduled competency exams"
            icon={Award}
            color="indigo"
            onClick={() => onNavigate('assessments')}
          />
        </div>

        {/* My Modules Delivery Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Modules Delivery Coverage</h3>
              <p className="text-xs text-slate-500">Planned vs. Delivered Hours</p>
            </div>
            <button
              onClick={() => onNavigate('modules')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              View Full Syllabus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myModules.map((mod) => {
              const sessions = attendanceSessions.filter((s) => s.moduleId === mod.id);
              const delivered = sessions.reduce((acc, s) => acc + s.computedHours, 0);
              const planned = mod.theoryHours + mod.practicalHours;
              const pct = Math.min(100, Math.round((delivered / planned) * 100));

              return (
                <div key={mod.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {mod.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{mod.title}</h4>
                      <p className="text-[11px] text-slate-500">{mod.nvqLevel} • Semester {mod.semester}</p>
                    </div>
                    <Badge variant={pct >= 80 ? 'green' : 'amber'}>{pct}% Done</Badge>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 pt-2">
                    <span>Delivered: <strong>{delivered.toFixed(1)} hrs</strong></span>
                    <span>Target: <strong>{planned} hrs</strong></span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     5. REGISTRAR DASHBOARD (Scoped to Batches, Enrollments & Exam Eligibility)
     ========================================================================= */
  if (currentUser.role === 'registrar') {
    // Calculate exam eligibility
    const threshold = settings.academicDefaults.minimumAttendanceThresholdPercent;
    let eligibleStudents = 0;
    students.forEach((stu) => {
      let attended = 0;
      let total = 0;
      attendanceSessions.forEach((sess) => {
        const r = sess.records.find((rec) => rec.studentId === stu.id);
        if (r) {
          total += sess.computedHours;
          if (r.status === 'present') attended += sess.computedHours;
        }
      });
      const pct = total > 0 ? (attended / total) * 100 : 100;
      if (pct >= threshold) eligibleStudents++;
    });

    return (
      <div className="space-y-6">
        {/* Registrar Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-blue-200 mb-2">
                <Users size={14} />
                <span>Registrar Office & Academic Registry</span>
                <span>•</span>
                <span>Cohort & Exam Eligibility Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Managing NVQ Level 5 & Level 6 student admissions, academic batches, 80% statutory attendance exam eligibility, and 6-month OJT industry placements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('reports')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
              >
                <Printer size={15} />
                <span>Monthly Progress Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Registrar Scoped KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students Enrolled"
            value={totalStudents}
            subtitle={`L5: ${nvq5Count} (1-Yr) | L6: ${nvq6Count} (2-Yr)`}
            icon={GraduationCap}
            color="emerald"
            onClick={() => onNavigate('students')}
          />
          <StatCard
            title="Academic Batches"
            value={groups.length}
            subtitle={`${academicYears.length} Academic Years`}
            icon={Calendar}
            color="blue"
            onClick={() => onNavigate('academics')}
          />
          <StatCard
            title="Exam-Eligible Students"
            value={`${eligibleStudents} / ${totalStudents}`}
            subtitle={`Statutory Rule: ≥${threshold}% Attendance`}
            icon={CheckSquare}
            color={eligibleStudents === totalStudents ? 'emerald' : 'amber'}
            onClick={() => onNavigate('reports')}
          />
          <StatCard
            title="6-Month OJT Trainees"
            value={ojtCount}
            subtitle="Active in research & industry"
            icon={Briefcase}
            color="indigo"
            onClick={() => onNavigate('ojt')}
          />
        </div>

        {/* Registrar Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('academics')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <Calendar size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Academic Batches (1-Yr & 2-Yr)</h4>
            </div>
            <p className="text-xs text-slate-600">Configure NVQ Level 5 (1-Year) & Level 6 (2-Years) calendar years.</p>
          </div>

          <div
            onClick={() => onNavigate('students')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <GraduationCap size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Student Admission & ID Cards</h4>
            </div>
            <p className="text-xs text-slate-600">Register candidates, assign barcodes, and inspect official student cards.</p>
          </div>

          <div
            onClick={() => onNavigate('ojt')}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <Briefcase size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-900">6-Month OJT Placement Tracker</h4>
            </div>
            <p className="text-xs text-slate-600">Track 6 monthly reports and final supervisor certification grading.</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     6. ADMINISTRATOR DASHBOARD (Operations, Faculty & Academic Administration)
     ========================================================================= */
  if (currentUser.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-emerald-200 mb-2">
                <Shield size={14} />
                <span>Administrative Directorate</span>
                <span>•</span>
                <span>Institutional Operations Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Overseeing academic departments, student registry, faculty allocations, and institutional monthly reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('reports')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
              >
                <FileSpreadsheet size={15} />
                <span>Monthly Progress Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students Enrolled"
            value={totalStudents}
            subtitle={`NVQ 5: ${nvq5Count} | NVQ 6: ${nvq6Count}`}
            icon={GraduationCap}
            color="emerald"
            onClick={() => onNavigate('students')}
          />
          <StatCard
            title="Academic Faculty"
            value={lecturers.length}
            subtitle="Instructors & Lecturers"
            icon={Users}
            color="blue"
            onClick={() => onNavigate('lecturers')}
          />
          <StatCard
            title="Curriculum Modules"
            value={modules.length}
            subtitle="Accredited syllabus"
            icon={BookOpenCheck}
            color="indigo"
            onClick={() => onNavigate('modules')}
          />
          <StatCard
            title="Academic Batches"
            value={groups.length}
            subtitle="Current active cohorts"
            icon={Layers}
            color="amber"
            onClick={() => onNavigate('academics')}
          />
        </div>

        {/* Charts & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Module Attendance Completion Rates (%)</h3>
            <p className="text-xs text-slate-500 mb-4">Conducted theory & practical sessions</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="attendanceRate" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Curriculum Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">NVQ Level 5 (1-Yr) vs NVQ Level 6 (2-Yr)</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nvqBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                      {nvqBreakdownData.map((e, idx) => (
                        <Cell key={`cell-${idx}`} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Active in 6-Mo OJT:</span>
              <span className="font-bold text-slate-900">{ojtCount} Candidates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     7. SUPER ADMIN DASHBOARD (Full System Oversight & Security Engine)
     ========================================================================= */
  return (
    <div className="space-y-6">
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-purple-200 mb-2">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>Super Administrator Control Hub</span>
              <span>•</span>
              <span>Full System Authorization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{currentUser.fullName}</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              School of Agriculture — Angunakolapelessa. Full master oversight across all 7 operational departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
            >
              <Settings size={15} />
              <span>System Settings & Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* Super Admin Master KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={totalStudents}
          subtitle={`NVQ 5: ${nvq5Count} | NVQ 6: ${nvq6Count}`}
          icon={GraduationCap}
          color="emerald"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Faculty & Lecturers"
          value={lecturers.length}
          subtitle="All academic departments"
          icon={Users}
          color="blue"
          onClick={() => onNavigate('lecturers')}
        />
        <StatCard
          title="Library Borrowings"
          value={activeBorrows}
          subtitle={`${overdueBorrows} Overdue • LKR ${totalFinesPending} Fines`}
          icon={BookOpen}
          color={overdueBorrows > 0 ? 'rose' : 'indigo'}
          onClick={() => onNavigate('library')}
        />
        <StatCard
          title="Hostel Meal Submissions"
          value={`${activeWeekSubmissions} / ${hostelStudents.length}`}
          subtitle={`${activeMealWeek?.title?.split(':')[0] || 'Current Week'}`}
          icon={UtensilsCrossed}
          color="amber"
          onClick={() => onNavigate('hostel')}
        />
      </div>

      {/* Master Control Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('settings')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Users size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">User Accounts & Roles</h4>
          </div>
          <p className="text-[11px] text-slate-500">Manage credentials and enforce mandatory first-login password changes.</p>
        </div>

        <div
          onClick={() => onNavigate('academics')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Calendar size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Academic Batches & Durations</h4>
          </div>
          <p className="text-[11px] text-slate-500">NVQ 5 (1-Year Duration) and NVQ 6 (2-Years Duration).</p>
        </div>

        <div
          onClick={() => onNavigate('settings')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Database size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">JSON Database Backup</h4>
          </div>
          <p className="text-[11px] text-slate-500">Export snapshot or restore system from backup file.</p>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Printer size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Department of Agriculture Reports</h4>
          </div>
          <p className="text-[11px] text-slate-500">Official monthly progress summaries with institutional signatures.</p>
        </div>
      </div>
    </div>
  );
};
