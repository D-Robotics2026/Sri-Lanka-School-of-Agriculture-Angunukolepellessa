import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceSession, AttendanceType, AttendanceRecordStatus, StudentAttendanceEntry } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/dateUtils';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock4,
  Trash2,
  Edit2,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    attendanceSessions,
    addAttendanceSession,
    updateAttendanceSession,
    deleteAttendanceSession,
    calculateComputedHours,
    modules,
    groups,
    students,
    lecturers
  } = useData();

  // Search & Filter State
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewSessionModalOpen, setIsViewSessionModalOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<AttendanceSession | null>(null);

  // Form State
  const [moduleId, setModuleId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('11:30');
  const [sessionType, setSessionType] = useState<AttendanceType>('Theory');
  const [topicCovered, setTopicCovered] = useState('');
  const [studentEntries, setStudentEntries] = useState<StudentAttendanceEntry[]>([]);

  // Strictly computed hours from startTime and endTime (NO manual override!)
  const liveComputedHours = useMemo(() => {
    return calculateComputedHours(startTime, endTime);
  }, [startTime, endTime, calculateComputedHours]);

  // When group changes in modal, populate student list
  const handleGroupChange = (newGroupId: string) => {
    setGroupId(newGroupId);
    const groupStudents = students.filter((s) => s.groupId === newGroupId && s.enrollmentStatus === 'active');
    setStudentEntries(
      groupStudents.map((s) => ({
        studentId: s.id,
        studentIndex: s.indexNumber,
        status: 'present'
      }))
    );
  };

  const handleOpenAddModal = () => {
    const initialMod = modules[0]?.id || '';
    const initialGrp = groups[0]?.id || '';
    const initialLec = lecturers[0]?.id || '';

    setModuleId(initialMod);
    setLecturerId(initialLec);
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('08:30');
    setEndTime('11:30');
    setSessionType('Theory');
    setTopicCovered('');

    handleGroupChange(initialGrp);
    setIsModalOpen(true);
  };

  const handleToggleStudentStatus = (studentId: string, status: AttendanceRecordStatus) => {
    setStudentEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e))
    );
  };

  const handleMarkAll = (status: AttendanceRecordStatus) => {
    setStudentEntries((prev) => prev.map((e) => ({ ...e, status })));
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !groupId || !lecturerId) {
      alert('Please select Module, Batch/Group, and Lecturer.');
      return;
    }

    if (liveComputedHours <= 0) {
      alert('End Time must be after Start Time.');
      return;
    }

    addAttendanceSession({
      moduleId,
      groupId,
      lecturerId,
      date,
      startTime,
      endTime,
      type: sessionType,
      topicCovered: topicCovered || 'Syllabus Topic Coverage',
      records: studentEntries
    });

    setIsModalOpen(false);
  };

  const filteredSessions = attendanceSessions.filter((sess) => {
    const matchesMod = selectedModuleFilter === 'all' || sess.moduleId === selectedModuleFilter;
    const matchesGrp = selectedGroupFilter === 'all' || sess.groupId === selectedGroupFilter;
    const matchesSearch =
      sess.topicCovered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.date.includes(searchQuery);
    return matchesMod && matchesGrp && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Automated Session Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auto-computation of attendance hours strictly derived from Start & End Time (No manual hour override)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Record New Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Student Batches</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Timeslot</th>
                <th className="py-3 px-4">Module & Type</th>
                <th className="py-3 px-4">Batch / Group</th>
                <th className="py-3 px-4">Topic Covered</th>
                <th className="py-3 px-4 text-center">Computed Duration</th>
                <th className="py-3 px-4 text-center">Attendance Headcount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance sessions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess) => {
                  const mod = modules.find((m) => m.id === sess.moduleId);
                  const grp = groups.find((g) => g.id === sess.groupId);
                  const presentCount = sess.records.filter((r) => r.status === 'present').length;
                  const totalCount = sess.records.length;
                  const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 font-mono">{formatDate(sess.date)}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {sess.startTime} - {sess.endTime}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{mod?.code || 'Module'}</div>
                        <Badge variant={sess.type === 'Practical' ? 'amber' : 'green'} size="sm">
                          {sess.type}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">{grp?.code || 'Group'}</span>
                        <div className="text-[10px] text-slate-400">{grp?.name}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium max-w-xs truncate" title={sess.topicCovered}>
                          {sess.topicCovered}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Clock size={12} />
                          <span>{sess.computedHours.toFixed(1)} hrs</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-slate-800">
                          {presentCount} / {totalCount} ({pct}%)
                        </div>
                        <div className="w-16 bg-slate-200 rounded-full h-1 mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-1 rounded-full ${pct >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setViewingSession(sess);
                              setIsViewSessionModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition"
                          >
                            View Log
                          </button>
                          {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this historical attendance session?')) {
                                  deleteAttendanceSession(sess.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mark Attendance Session"
        subtitle="Automated Duration Computation Engine (Strictly Start & End Time)"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Module</label>
              <select
                required
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Group / Batch</label>
              <select
                required
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lecturer in Charge</label>
              <select
                required
                value={lecturerId}
                onChange={(e) => setLecturerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                {lecturers.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Auto Computed Hours
              </label>
              <div
                className="px-2.5 py-1.5 text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold font-mono text-center"
                title="Strictly auto-computed from start & end time. Manual override disabled."
              >
                {liveComputedHours.toFixed(1)} Hours
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
              <div className="flex gap-2">
                {(['Theory', 'Practical'] as AttendanceType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSessionType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      sessionType === type
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Syllabus Outcome</label>
              <input
                type="text"
                required
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                placeholder="e.g. Field calibration of boom sprayer nozzle pressure"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Student Attendance Marking Roster */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Student Attendance Roster ({studentEntries.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Present: {studentEntries.filter((e) => e.status === 'present').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition"
                >
                  All Absent
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {studentEntries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No active students enrolled in this group.
                </div>
              ) : (
                studentEntries.map((entry) => {
                  const stu = students.find((s) => s.id === entry.studentId);
                  return (
                    <div key={entry.studentId} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{stu?.fullName || entry.studentIndex}</div>
                        <div className="text-[11px] font-mono text-slate-400">{entry.studentIndex}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        {(['present', 'absent', 'late', 'excused'] as AttendanceRecordStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleToggleStudentStatus(entry.studentId, status)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                              entry.status === status
                                ? status === 'present'
                                  ? 'bg-emerald-600 text-white'
                                  : status === 'absent'
                                  ? 'bg-rose-600 text-white'
                                  : status === 'late'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Save Attendance Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Session Details Log Modal */}
      {viewingSession && (
        <Modal
          isOpen={isViewSessionModalOpen}
          onClose={() => setIsViewSessionModalOpen(false)}
          title="Attendance Session Verification Log"
          subtitle="School of Agriculture - Angunakolapelessa"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Hours:</span>
                <span className="font-bold text-slate-800">
                  {formatDate(viewingSession.date)} ({viewingSession.startTime} - {viewingSession.endTime}) = {viewingSession.computedHours} hrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Topic:</span>
                <span className="font-bold text-slate-800">{viewingSession.topicCovered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <Badge variant={viewingSession.type === 'Practical' ? 'amber' : 'green'} size="sm">
                  {viewingSession.type}
                </Badge>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs">
              {viewingSession.records.map((r) => {
                const stu = students.find((s) => s.id === r.studentId);
                return (
                  <div key={r.studentId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{stu?.fullName || r.studentIndex}</p>
                      <p className="font-mono text-[11px] text-slate-400">{r.studentIndex}</p>
                    </div>
                    <Badge
                      variant={
                        r.status === 'present'
                          ? 'green'
                          : r.status === 'absent'
                          ? 'red'
                          : r.status === 'late'
                          ? 'amber'
                          : 'blue'
                      }
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewSessionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
