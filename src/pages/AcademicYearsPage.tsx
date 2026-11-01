import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AcademicYear, StudentGroup, NVQLevel, AcademicYearStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/dateUtils';
import {
  CalendarDays,
  Plus,
  Users,
  Layers,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';

export const AcademicYearsPage: React.FC = () => {
  const {
    academicYears,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    students
  } = useData();

  const [activeTab, setActiveTab] = useState<'years' | 'groups'>('years');
  const [levelFilter, setLevelFilter] = useState<'all' | NVQLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Academic Year Modal State
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({
    code: '',
    name: '',
    nvqLevel: 'Level 5' as NVQLevel,
    startDate: '',
    endDate: '',
    status: 'active' as AcademicYearStatus,
    description: ''
  });

  // Group Modal State
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    code: '',
    academicYearId: '',
    nvqLevel: 'Level 5' as NVQLevel,
    currentSemester: 1,
    maxCapacity: 40
  });

  // Helper to generate standard Academic Year Title from NVQ Level and Code
  const generateYearTitle = (level: NVQLevel, code: string) => {
    const cleanCode = code.trim();
    const levelLabel = level === 'Level 5' ? 'NVQ Level 5' : 'NVQ Level 6';
    return cleanCode ? `Academic Year ${cleanCode} (${levelLabel})` : `Academic Year (${levelLabel})`;
  };

  // Helper to compute academic year code, end date and default name based on level
  // NVQ Level 5 = 1 year duration (ex. 2025/2026)
  // NVQ Level 6 = 2 years duration (ex. 2025/2027)
  const computeCodeAndDates = (level: NVQLevel, startDateStr: string) => {
    const startYear = startDateStr ? parseInt(startDateStr.split('-')[0], 10) : 2025;
    const safeStartYear = isNaN(startYear) ? 2025 : startYear;
    if (level === 'Level 5') {
      const endYear = safeStartYear + 1; // 1-year duration
      const code = `${safeStartYear}/${endYear}`;
      return {
        code,
        endDate: `${endYear}-09-30`,
        name: generateYearTitle(level, code)
      };
    } else {
      const endYear = safeStartYear + 2; // 2-year duration
      const code = `${safeStartYear}/${endYear}`;
      return {
        code,
        endDate: `${endYear}-09-30`,
        name: generateYearTitle(level, code)
      };
    }
  };

  // Open Add Year
  const handleOpenAddYear = (initialLevel: NVQLevel = 'Level 5') => {
    setEditingYear(null);
    const defaults = computeCodeAndDates(initialLevel, '2025-10-01');
    setYearForm({
      code: '',
      name: '',
      nvqLevel: initialLevel,
      startDate: '2025-10-01',
      endDate: defaults.endDate,
      status: 'upcoming',
      description: initialLevel === 'Level 5'
        ? '1-Year Curriculum: 2 Semesters Institutional + 6 Months OJT'
        : '2-Year Curriculum: 4 Semesters Institutional + 6 Months OJT'
    });
    setYearModalOpen(true);
  };

  // Handle changing Level in modal (recomputes dates, updates title if user entered code)
  const handleLevelChange = (newLevel: NVQLevel) => {
    const defaults = computeCodeAndDates(newLevel, yearForm.startDate);
    setYearForm((prev) => ({
      ...prev,
      nvqLevel: newLevel,
      code: prev.code,
      name: prev.code ? generateYearTitle(newLevel, prev.code) : '',
      endDate: defaults.endDate,
      description: newLevel === 'Level 5'
        ? '1-Year Curriculum: 2 Semesters Institutional + 6 Months OJT'
        : '2-Year Curriculum: 4 Semesters Institutional + 6 Months OJT'
    }));
  };

  // Handle changing Start Date in modal (recomputes end date)
  const handleStartDateChange = (newStartDate: string) => {
    const defaults = computeCodeAndDates(yearForm.nvqLevel, newStartDate);
    setYearForm((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate: defaults.endDate
    }));
  };

  // Open Edit Year
  const handleOpenEditYear = (ay: AcademicYear) => {
    setEditingYear(ay);
    setYearForm({
      code: ay.code,
      name: ay.name,
      nvqLevel: ay.nvqLevel,
      startDate: ay.startDate,
      endDate: ay.endDate,
      status: ay.status,
      description: ay.description || ''
    });
    setYearModalOpen(true);
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingYear) {
      updateAcademicYear({
        ...editingYear,
        ...yearForm
      });
    } else {
      addAcademicYear(yearForm);
    }
    setYearModalOpen(false);
  };

  // Open Add Group
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      code: '',
      academicYearId: academicYears[0]?.id || '',
      nvqLevel: 'Level 5',
      currentSemester: 1,
      maxCapacity: 40
    });
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grp: StudentGroup) => {
    setEditingGroup(grp);
    setGroupForm({
      name: grp.name,
      code: grp.code,
      academicYearId: grp.academicYearId,
      nvqLevel: grp.nvqLevel,
      currentSemester: grp.currentSemester,
      maxCapacity: grp.maxCapacity
    });
    setGroupModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      updateGroup({
        ...editingGroup,
        ...groupForm
      });
    } else {
      addGroup(groupForm);
    }
    setGroupModalOpen(false);
  };

  const filteredYears = academicYears.filter((ay) => {
    const matchesLevel = levelFilter === 'all' || ay.nvqLevel === levelFilter;
    const matchesSearch =
      ay.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ay.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const filteredGroups = groups.filter((grp) => {
    const matchesLevel = levelFilter === 'all' || grp.nvqLevel === levelFilter;
    const matchesSearch =
      grp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getStatusBadge = (status: AcademicYearStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="green">Active Session</Badge>;
      case 'upcoming':
        return <Badge variant="blue">Upcoming Intake</Badge>;
      case 'completed':
        return <Badge variant="slate">Archived/Completed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Academic Years & Student Batches
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum duration rules: <strong>NVQ Level 5 = 1 Year</strong> and <strong>NVQ Level 6 = 2 Years</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'years' ? (
            <button
              onClick={() => handleOpenAddYear('Level 5')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} />
              <span>New Academic Year</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddGroup}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} />
              <span>Create Batch / Group</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('years')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'years'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays size={14} />
            <span>Academic Years ({academicYears.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Batches & Groups ({groups.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All NVQ Levels</option>
            <option value="Level 5">NVQ Level 5</option>
            <option value="Level 6">NVQ Level 6</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Academic Years List */}
      {activeTab === 'years' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredYears.map((ay) => {
            const batchGroups = groups.filter((g) => g.academicYearId === ay.id);
            const batchStudents = students.filter((s) => s.academicYearId === ay.id);

            return (
              <div
                key={ay.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {ay.code}
                    </span>
                    {getStatusBadge(ay.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 leading-snug mt-2">{ay.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={ay.nvqLevel === 'Level 5' ? 'green' : 'blue'}>{ay.nvqLevel}</Badge>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ay.nvqLevel === 'Level 5' ? '1 Year Duration (2 Sem + 6M OJT)' : '2 Years Duration (4 Sem + 6M OJT)'}
                    </span>
                  </div>

                  {ay.description && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {ay.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
                      <span className="font-semibold text-slate-700 font-mono">{formatDate(ay.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">End Date</span>
                      <span className="font-semibold text-slate-700 font-mono">{formatDate(ay.endDate)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <span>Active Groups: <strong>{batchGroups.length}</strong></span>
                    <span>Enrolled: <strong>{batchStudents.length} Students</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditYear(ay)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit Academic Year"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete academic year ${ay.code}?`)) {
                        deleteAcademicYear(ay.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Groups & Batches List */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((grp) => {
            const parentYear = academicYears.find((ay) => ay.id === grp.academicYearId);
            const groupStudents = students.filter((s) => s.groupId === grp.id);

            return (
              <div
                key={grp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {grp.code}
                    </span>
                    <Badge variant={grp.nvqLevel === 'Level 5' ? 'green' : 'blue'}>{grp.nvqLevel}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 leading-snug">{grp.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Academic Year: <span className="font-medium text-slate-700">{parentYear?.name || 'Unassigned'}</span>
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Curriculum Stage:</span>
                      <span className="font-bold text-slate-800">
                        Semester {grp.currentSemester} of {grp.nvqLevel === 'Level 5' ? '2' : '4'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Enrolled / Capacity:</span>
                      <span className="font-bold text-slate-800">
                        {groupStudents.length} / {grp.maxCapacity} Students
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((groupStudents.length / grp.maxCapacity) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditGroup(grp)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit Group"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete group ${grp.name}?`)) {
                        deleteGroup(grp.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Group"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Academic Year Modal */}
      <Modal
        isOpen={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        title={editingYear ? 'Edit Academic Year' : 'Create Academic Year'}
        subtitle="School of Agriculture - Angunakolapelessa"
      >
        <form onSubmit={handleSaveYear} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NVQ Level</label>
              <select
                value={yearForm.nvqLevel}
                onChange={(e) => handleLevelChange(e.target.value as NVQLevel)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-bold text-slate-800"
              >
                <option value="Level 5">NVQ Level 5</option>
                <option value="Level 6">NVQ Level 6</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code / Batch Ref</label>
              <input
                type="text"
                required
                value={yearForm.code}
                onChange={(e) => {
                  const newCode = e.target.value;
                  setYearForm((prev) => ({
                    ...prev,
                    code: newCode,
                    name: generateYearTitle(prev.nvqLevel, newCode)
                  }));
                }}
                placeholder={yearForm.nvqLevel === 'Level 5' ? 'e.g. 2025/2026' : 'e.g. 2025/2027'}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Duration Framework Indicator */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
            <p className="font-extrabold text-emerald-900">
              {yearForm.nvqLevel === 'Level 5'
                ? 'NVQ Level 5: 1 Academic Year Duration'
                : 'NVQ Level 6: 2 Academic Years Duration'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {yearForm.nvqLevel === 'Level 5'
                ? 'Standard 1-year calendar: 2 Semesters Institutional + 6 Months OJT'
                : 'Standard 2-year calendar: 4 Semesters Institutional + 6 Months OJT'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year Title</label>
            <input
              type="text"
              required
              value={yearForm.name}
              onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
              placeholder={yearForm.nvqLevel === 'Level 5' ? 'e.g. Academic Year 2025/2026 (NVQ Level 5)' : 'e.g. Academic Year 2025/2027 (NVQ Level 6)'}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={yearForm.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={yearForm.endDate}
                onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={yearForm.status}
              onChange={(e) => setYearForm({ ...yearForm, status: e.target.value as AcademicYearStatus })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="active">Active Session</option>
              <option value="upcoming">Upcoming Intake</option>
              <option value="completed">Completed / Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={yearForm.description}
              onChange={(e) => setYearForm({ ...yearForm, description: e.target.value })}
              placeholder="Details regarding this intake or syllabus..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setYearModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Save Academic Year
            </button>
          </div>
        </form>
      </Modal>

      {/* Group Modal */}
      <Modal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={editingGroup ? 'Edit Student Group / Batch' : 'Create Student Group'}
        subtitle="Manage cohort distribution within academic year"
      >
        <form onSubmit={handleSaveGroup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Group Code</label>
              <input
                type="text"
                required
                value={groupForm.code}
                onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value })}
                placeholder="e.g. L5-2024-A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={groupForm.academicYearId}
                onChange={(e) => setGroupForm({ ...groupForm, academicYearId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.code} ({ay.nvqLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="e.g. NVQ 5 - Batch 2024 (Group A)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NVQ Level</label>
              <select
                value={groupForm.nvqLevel}
                onChange={(e) => setGroupForm({ ...groupForm, nvqLevel: e.target.value as NVQLevel })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Level 5">NVQ Level 5</option>
                <option value="Level 6">NVQ Level 6</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester</label>
              <select
                value={groupForm.currentSemester}
                onChange={(e) => setGroupForm({ ...groupForm, currentSemester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                {groupForm.nvqLevel === 'Level 6' && (
                  <>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                min={10}
                max={100}
                value={groupForm.maxCapacity}
                onChange={(e) => setGroupForm({ ...groupForm, maxCapacity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Save Group
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
