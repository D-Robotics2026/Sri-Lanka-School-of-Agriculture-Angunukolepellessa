import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { BarcodeDisplay } from '../components/common/BarcodeDisplay';
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
  FileSpreadsheet
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
  const { currentUser } = useAuth();
  const {
    students,
    lecturers,
    modules,
    attendanceSessions,
    assignments,
    books,
    borrowRecords,
    mealWeeks,
    mealSubmissions,
    ojtPlacements,
    settings
  } = useData();

  if (!currentUser) return null;

  // Compute key institutional metrics
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
  const hostelStudentsCount = students.filter((s) => s.isHostelResident).length;

  // Chart data: Attendance by module
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

  // Chart data: NVQ level breakdown
  const nvqBreakdownData = [
    { name: 'NVQ Level 5', value: nvq5Count, color: '#10b981' },
    { name: 'NVQ Level 6', value: nvq6Count, color: '#3b82f6' }
  ];

  // Specific view for Student
  if (currentUser.role === 'student') {
    const student = students.find((s) => s.id === currentUser.linkedStudentId) || students[0];
    const myBorrows = borrowRecords.filter((r) => r.studentId === student.id && r.status !== 'returned');
    const mySubmissions = mealSubmissions.find(
      (s) => s.studentId === student.id && s.mealWeekId === activeMealWeek?.id
    );

    // Calculate student attendance percentage
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

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-2">
                <span>Student Portal</span>
                <span>•</span>
                <span>{student.nvqLevel}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{student.fullName}</h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                Index No: <span className="font-mono font-bold text-white">{student.indexNumber}</span> • NIC: {student.nic} • Semester {student.semester}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20 self-start md:self-auto">
              <BarcodeDisplay value={student.barcode} label="Official Student ID Barcode" height={36} />
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Attendance Rate"
            value={`${studentAttendancePct}%`}
            subtitle={studentAttendancePct >= settings.academicDefaults.minimumAttendanceThresholdPercent ? 'Eligible for Exams (≥80%)' : 'Attendance Warning (<80%)'}
            icon={CheckSquare}
            color={studentAttendancePct >= settings.academicDefaults.minimumAttendanceThresholdPercent ? 'emerald' : 'rose'}
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
            subtitle="Curriculum in progress"
            icon={GraduationCap}
            color="indigo"
            onClick={() => onNavigate('modules')}
          />
        </div>

        {/* Student Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hostel Meal Status Card */}
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
                  Deadline: {new Date(activeMealWeek.submissionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

          {/* Academic & OJT Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Training & OJT Pathway</h3>
                  <p className="text-xs text-slate-500">Institutional Semesters + 6 Months OJT</p>
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

  // Administrative / General Staff Dashboard
  return (
    <div className="space-y-6">
      {/* Top Banner with Angunakolapelessa Branding */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-emerald-200 mb-2">
              <span>Department of Agriculture Sri Lanka</span>
              <span>•</span>
              <span className="capitalize">{currentUser.role.replace('_', ' ')} Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School of Agriculture — Angunakolapelessa
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Academic & Administrative Management System for NVQ Level 5 & NVQ Level 6 Diploma Programs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
            >
              <CheckSquare size={16} />
              <span>Mark Session Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs transition backdrop-blur-xs border border-white/20 flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              <span>Monthly Progress Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value={totalStudents}
          subtitle={`NVQ 5: ${nvq5Count} | NVQ 6: ${nvq6Count}`}
          icon={GraduationCap}
          color="emerald"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Academic Faculty"
          value={lecturers.length}
          subtitle="Department Lecturers & Instructors"
          icon={Users}
          color="blue"
          onClick={() => onNavigate('lecturers')}
        />
        <StatCard
          title="Library Borrowings"
          value={activeBorrows}
          subtitle={`${overdueBorrows} Overdue • LKR ${totalFinesPending} Pending Fines`}
          icon={BookOpen}
          color={overdueBorrows > 0 ? 'rose' : 'indigo'}
          onClick={() => onNavigate('library')}
        />
        <StatCard
          title="Hostel Meal Submissions"
          value={`${activeWeekSubmissions} / ${hostelStudentsCount}`}
          subtitle={`${activeMealWeek?.title || 'Current Week'} (7×3 Matrix)`}
          icon={UtensilsCrossed}
          color="amber"
          onClick={() => onNavigate('hostel')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Attendance Rates */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Module Attendance Completion Rates (%)</h3>
              <p className="text-xs text-slate-500">Auto-computed from scheduled Theory & Practical sessions</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage Sessions</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}% Attendance`, 'Rate']}
                  labelFormatter={(name) => `Module: ${name}`}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="attendanceRate" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NVQ Level Enrollment Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Curriculum Enrollment</h3>
              <Badge variant="green">Active Batches</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">NVQ Level 5 (2 Sem + OJT) vs Level 6 (4 Sem + OJT)</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nvqBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {nvqBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>In OJT Training (6-Mo):</span>
            <span className="font-bold text-slate-800">{ojtCount} Candidates</span>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('attendance')}
          className="p-4 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <CheckSquare size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Automated Attendance Hours</h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">Strict derivation from start & end time</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('hostel')}
          className="p-4 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">7×3 Hostel Meal Management</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">Weekly deadline locks & kitchen sheets</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('ojt')}
          className="p-4 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950">6-Month OJT Tracking</h4>
              <p className="text-[11px] text-blue-700 mt-0.5">Placements, 6 monthly reports & final grading</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
