import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { PrintHeader } from '../components/common/PrintHeader';
import {
  BarChart3,
  Printer,
  Calendar,
  Layers,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Download,
  CheckSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const {
    modules,
    attendanceSessions,
    students,
    groups,
    academicYears,
    settings
  } = useData();

  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Level 5' | 'Level 6'>('all');

  // Compute Module Delivery Coverage (Delivered Hours vs Planned Hours)
  const moduleCoverage = useMemo(() => {
    return modules.map((mod) => {
      const sessions = attendanceSessions.filter((s) => s.moduleId === mod.id);

      const deliveredTheoryHours = sessions
        .filter((s) => s.type === 'Theory')
        .reduce((sum, s) => sum + s.computedHours, 0);

      const deliveredPracticalHours = sessions
        .filter((s) => s.type === 'Practical')
        .reduce((sum, s) => sum + s.computedHours, 0);

      const totalDelivered = deliveredTheoryHours + deliveredPracticalHours;
      const totalPlanned = mod.theoryHours + mod.practicalHours;
      const completionRate = totalPlanned > 0 ? Math.min(100, Math.round((totalDelivered / totalPlanned) * 100)) : 0;

      return {
        id: mod.id,
        code: mod.code,
        title: mod.title,
        nvqLevel: mod.nvqLevel,
        semester: mod.semester,
        plannedTheory: mod.theoryHours,
        deliveredTheory: Math.round(deliveredTheoryHours * 10) / 10,
        plannedPractical: mod.practicalHours,
        deliveredPractical: Math.round(deliveredPracticalHours * 10) / 10,
        totalPlanned,
        totalDelivered: Math.round(totalDelivered * 10) / 10,
        completionRate
      };
    });
  }, [modules, attendanceSessions]);

  // Compute Student Attendance Eligibility (>=80% requirement)
  const studentEligibility = useMemo(() => {
    const minThreshold = settings.academicDefaults.minimumAttendanceThresholdPercent || 80;

    return students.map((stu) => {
      let attendedHours = 0;
      let totalConductedHours = 0;

      attendanceSessions.forEach((sess) => {
        const studentRecord = sess.records.find((r) => r.studentId === stu.id);
        if (studentRecord) {
          totalConductedHours += sess.computedHours;
          if (studentRecord.status === 'present') {
            attendedHours += sess.computedHours;
          } else if (studentRecord.status === 'late') {
            attendedHours += sess.computedHours * 0.75; // Late counts partial
          }
        }
      });

      const percentage =
        totalConductedHours > 0 ? Math.round((attendedHours / totalConductedHours) * 100) : 100;

      const isEligible = percentage >= minThreshold;

      return {
        id: stu.id,
        fullName: stu.fullName,
        indexNumber: stu.indexNumber,
        nvqLevel: stu.nvqLevel,
        semester: stu.semester,
        totalConductedHours: Math.round(totalConductedHours * 10) / 10,
        attendedHours: Math.round(attendedHours * 10) / 10,
        percentage,
        isEligible
      };
    });
  }, [students, attendanceSessions, settings]);

  const filteredCoverage = moduleCoverage.filter((m) => selectedLevel === 'all' || m.nvqLevel === selectedLevel);
  const eligibleCount = studentEligibility.filter((s) => s.isEligible).length;
  const inEligibleCount = studentEligibility.filter((s) => !s.isEligible).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Institutional Progress & Coverage Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agriculture official curriculum delivery metrics & examination eligibility
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer size={16} />
            <span>Print Official Progress Report</span>
          </button>
        </div>
      </div>

      {/* Filter / Period Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              <option value="October 2026">October 2026 (Monthly Review)</option>
              <option value="November 2026">November 2026 (In Progress)</option>
              <option value="September 2026">September 2026 (Past Cycle)</option>
            </select>
          </div>

          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Filter NVQ Level</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
            >
              <option value="all">All NVQ Levels</option>
              <option value="Level 5">NVQ Level 5</option>
              <option value="Level 6">NVQ Level 6</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-200">
            {eligibleCount} Students Exam-Eligible (≥80%)
          </span>
          {inEligibleCount > 0 && (
            <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded-lg font-bold border border-rose-200">
              {inEligibleCount} Under-Attendance Notice
            </span>
          )}
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        {/* Printable Official Header */}
        <PrintHeader
          title={`Academic Progress & Module Delivery Coverage — ${selectedMonth}`}
          subtitle="Accredited under National Vocational Qualification (NVQ Level 5 & NVQ Level 6)"
          referenceNumber="SOA/AKP/REP/2026/M10"
        />

        {/* Section 1: Module Delivery Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              1. Theory & Practical Module Delivery Coverage
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Target vs. Actual Hours Completed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">Module Code & Title</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">NVQ Level</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Sem</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Theory (Pln/Del)</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Pract (Pln/Del)</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Total Hours (Del/Pln)</th>
                  <th className="py-2.5 px-3 text-center">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCoverage.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{m.code}</div>
                      <div className="text-[11px] text-slate-500">{m.title}</div>
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200">
                      <span className="font-semibold text-slate-700">{m.nvqLevel}</span>
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold">
                      {m.semester}
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono">
                      {m.plannedTheory} / {m.deliveredTheory}h
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono">
                      {m.plannedPractical} / {m.deliveredPractical}h
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-900">
                      {m.totalDelivered} / {m.totalPlanned} hrs
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold font-mono text-emerald-800">{m.completionRate}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${m.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Student Examination Eligibility (80% rule) */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              2. Student Examination Attendance Eligibility (80% Rule)
            </h3>
            <span className="text-xs text-slate-500">
              Department of Agriculture Statutory Minimum: {settings.academicDefaults.minimumAttendanceThresholdPercent}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">Student Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Index Number</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Level</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Attended / Total Conducted</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">Attendance %</th>
                  <th className="py-2.5 px-3 text-center">Exam Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentEligibility.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                      {s.fullName}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 border-r border-slate-200">
                      {s.indexNumber}
                    </td>

                    <td className="py-2.5 px-2 text-center border-r border-slate-200">
                      {s.nvqLevel}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">
                      {s.attendedHours}h / {s.totalConductedHours}h
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono font-bold border-r border-slate-200">
                      <span className={s.isEligible ? 'text-emerald-700' : 'text-rose-700'}>
                        {s.percentage}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {s.isEligible ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                          ELIGIBLE TO SIT
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[11px]">
                          UNDER-ATTENDANCE (&lt;80%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Institutional Signature Blocks */}
        <div className="pt-10 grid grid-cols-3 gap-8 text-center text-xs">
          <div className="border-t-2 border-slate-800 pt-2">
            <p className="font-extrabold text-slate-900">Registrar / Academic Coordinator</p>
            <p className="text-[11px] text-slate-500">School of Agriculture, Angunakolapelessa</p>
          </div>
          <div className="border-t-2 border-slate-800 pt-2">
            <p className="font-extrabold text-slate-900">Head of Academic Affairs</p>
            <p className="text-[11px] text-slate-500">School of Agriculture, Angunakolapelessa</p>
          </div>
          <div className="border-t-2 border-slate-800 pt-2">
            <p className="font-extrabold text-slate-900">Principal / Additional Director</p>
            <p className="text-[11px] text-slate-500">Department of Agriculture, Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
};
