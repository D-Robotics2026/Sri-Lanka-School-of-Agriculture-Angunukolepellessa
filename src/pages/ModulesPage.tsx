import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Module, NVQLevel } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { BulkActionBar } from '../components/common/BulkActionBar';
import { BulkImportModal } from '../components/common/BulkImportModal';
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  Clock,
  Award,
  Layers,
  Edit2,
  Trash2,
  UserCheck,
  ClipboardList,
  Upload
} from 'lucide-react';

export const ModulesPage: React.FC = () => {
  const { modules, addModule, updateModule, deleteModule, lecturers } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | NVQLevel>('all');
  const [semesterFilter, setSemesterFilter] = useState<'all' | number>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    code: '',
    title: '',
    nvqLevel: 'Level 5' as NVQLevel,
    semester: 1,
    credits: 3.0,
    theoryHours: 30,
    practicalHours: 45,
    primaryLecturerId: '',
    assignmentsCount: 2,
    practicalTestsCount: 2,
    fieldVisitsCount: 1
  });

  const handleOpenAdd = () => {
    setEditingModule(null);
    setForm({
      code: 'AG-50' + (modules.length + 1),
      title: '',
      nvqLevel: 'Level 5',
      semester: 1,
      credits: 3.0,
      theoryHours: 30,
      practicalHours: 60,
      primaryLecturerId: lecturers[0]?.id || '',
      assignmentsCount: 2,
      practicalTestsCount: 2,
      fieldVisitsCount: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: Module) => {
    setEditingModule(mod);
    setForm({
      code: mod.code,
      title: mod.title,
      nvqLevel: mod.nvqLevel,
      semester: mod.semester,
      credits: mod.credits,
      theoryHours: mod.theoryHours,
      practicalHours: mod.practicalHours,
      primaryLecturerId: mod.primaryLecturerId,
      assignmentsCount: mod.assessmentCriteria.assignmentsCount,
      practicalTestsCount: mod.assessmentCriteria.practicalTestsCount,
      fieldVisitsCount: mod.assessmentCriteria.fieldVisitsCount
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      title: form.title,
      nvqLevel: form.nvqLevel,
      semester: form.semester,
      credits: form.credits,
      theoryHours: form.theoryHours,
      practicalHours: form.practicalHours,
      primaryLecturerId: form.primaryLecturerId,
      assessmentCriteria: {
        assignmentsCount: form.assignmentsCount,
        practicalTestsCount: form.practicalTestsCount,
        fieldVisitsCount: form.fieldVisitsCount
      }
    };

    if (editingModule) {
      updateModule({
        ...editingModule,
        ...payload
      });
    } else {
      addModule(payload);
    }
    setIsModalOpen(false);
  };

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || m.nvqLevel === levelFilter;
    const matchesSem = semesterFilter === 'all' || m.semester === semesterFilter;
    return matchesSearch && matchesLevel && matchesSem;
  });


  const handleBulkDeleteModules = () => {
    if (selectedModuleIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedModuleIds.length} selected modules?`)) {
      selectedModuleIds.forEach((id) => deleteModule(id));
      setSelectedModuleIds([]);
    }
  };

  const toggleSelectModule = (id: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const moduleImportColumns = [
    { key: 'code', label: 'Module Code', required: true },
    { key: 'title', label: 'Module Title', required: true },
    { key: 'nvqLevel', label: 'NVQ Level', required: true },
    { key: 'semester', label: 'Semester', required: true },
    { key: 'credits', label: 'Credits' },
    { key: 'theoryHours', label: 'Theory Hours' },
    { key: 'practicalHours', label: 'Practical Hours' }
  ];

  const moduleSampleData = [
    {
      code: 'AG-501',
      title: 'Principles of Agronomy & Crop Production',
      nvqLevel: 'Level 5',
      semester: '1',
      credits: '3.0',
      theoryHours: '30',
      practicalHours: '60'
    },
    {
      code: 'AG-602',
      title: 'Advanced Protected Agriculture & Hydroponics',
      nvqLevel: 'Level 6',
      semester: '2',
      credits: '4.0',
      theoryHours: '40',
      practicalHours: '75'
    }
  ];

  const handleBulkImportModules = async (rows: any[]) => {
    for (const r of rows) {
      const nvq: NVQLevel = r.nvqLevel === 'Level 6' ? 'Level 6' : 'Level 5';
      addModule({
        code: r.code || `AG-50${Math.floor(10 + Math.random() * 90)}`,
        title: r.title || 'Course Module',
        nvqLevel: nvq,
        semester: r.semester ? parseInt(r.semester, 10) || 1 : 1,
        credits: r.credits ? parseFloat(r.credits) || 3.0 : 3.0,
        theoryHours: r.theoryHours ? parseInt(r.theoryHours, 10) || 30 : 30,
        practicalHours: r.practicalHours ? parseInt(r.practicalHours, 10) || 45 : 45,
        primaryLecturerId: lecturers[0]?.id || '',
        assessmentCriteria: {
          assignmentsCount: 2,
          practicalTestsCount: 2,
          fieldVisitsCount: 1
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Curriculum & Module Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agriculture syllabus management for NVQ Level 5 (Sem 1-2) & Level 6 (Sem 1-4)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Upload size={15} />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} />
            <span>Add Academic Module</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by module code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All NVQ Levels</option>
            <option value="Level 5">NVQ Level 5</option>
            <option value="Level 6">NVQ Level 6</option>
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Semesters</option>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
            <option value={3}>Semester 3</option>
            <option value={4}>Semester 4</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedModuleIds.length}
        totalCount={filteredModules.length}
        onClearSelection={() => setSelectedModuleIds([])}
        onSelectAll={() => setSelectedModuleIds(filteredModules.map((m) => m.id))}
        onDeleteSelected={handleBulkDeleteModules}
        entityName="modules"
        isAllSelected={selectedModuleIds.length === filteredModules.length && filteredModules.length > 0}
      />

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const lecturer = lecturers.find((l) => l.id === mod.primaryLecturerId);
          const totalPlannedHours = mod.theoryHours + mod.practicalHours;

          return (
            <div
              key={mod.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {mod.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={mod.nvqLevel === 'Level 5' ? 'green' : 'blue'}>{mod.nvqLevel}</Badge>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      Sem {mod.semester}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">{mod.title}</h3>

                {/* Academic Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Theory</span>
                    <span className="text-xs font-bold text-slate-700">{mod.theoryHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Practical</span>
                    <span className="text-xs font-bold text-slate-700">{mod.practicalHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Credits</span>
                    <span className="text-xs font-bold text-emerald-700">{mod.credits} Cr</span>
                  </div>
                </div>

                {/* Assessment Criteria Matrix */}
                <div className="mt-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/70 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1">
                    <ClipboardList size={12} />
                    <span>Mandatory Assessment Schema</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Assignments: <strong>{mod.assessmentCriteria.assignmentsCount}</strong></span>
                    <span>Practicals: <strong>{mod.assessmentCriteria.practicalTestsCount}</strong></span>
                    <span>Field Visits: <strong>{mod.assessmentCriteria.fieldVisitsCount}</strong></span>
                  </div>
                </div>

                {/* Primary Lecturer */}
                <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <UserCheck size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-400">Lecturer:</span>
                  <span className="font-semibold text-slate-800 truncate">{lecturer?.fullName || 'Not assigned'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(mod)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  title="Edit Module"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete module ${mod.code} - ${mod.title}?`)) {
                      deleteModule(mod.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Module"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModule ? 'Edit Curriculum Module' : 'Add Curriculum Module'}
        subtitle="Department of Agriculture Accredited Syllabus"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Module Code</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. EAT 501"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NVQ Level</label>
              <select
                value={form.nvqLevel}
                onChange={(e) => setForm({ ...form, nvqLevel: e.target.value as NVQLevel })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Level 5">NVQ Level 5</option>
                <option value="Level 6">NVQ Level 6</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Module Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Agronomy of Field Crops & Paddy Cultivation"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>Sem 1</option>
                <option value={2}>Sem 2</option>
                {form.nvqLevel === 'Level 6' && (
                  <>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Theory (hrs)</label>
              <input
                type="number"
                min={0}
                required
                value={form.theoryHours}
                onChange={(e) => setForm({ ...form, theoryHours: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Practical (hrs)</label>
              <input
                type="number"
                min={0}
                required
                value={form.practicalHours}
                onChange={(e) => setForm({ ...form, practicalHours: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                step="0.5"
                min={1}
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Lecturer</label>
            <select
              value={form.primaryLecturerId}
              onChange={(e) => setForm({ ...form, primaryLecturerId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select lecturer</option>
              {lecturers.map((lec) => (
                <option key={lec.id} value={lec.id}>
                  {lec.fullName} ({lec.department})
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Criteria */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h5 className="font-bold text-slate-800 text-xs">Required Assessment Counts</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Assignments</label>
                <input
                  type="number"
                  min={0}
                  value={form.assignmentsCount}
                  onChange={(e) => setForm({ ...form, assignmentsCount: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Practical Tests</label>
                <input
                  type="number"
                  min={0}
                  value={form.practicalTestsCount}
                  onChange={(e) => setForm({ ...form, practicalTestsCount: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Field Visits</label>
                <input
                  type="number"
                  min={0}
                  value={form.fieldVisitsCount}
                  onChange={(e) => setForm({ ...form, fieldVisitsCount: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
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
              Save Module
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Course Modules"
        subtitle="Import curriculum modules, course credits, theory and practical hours from CSV or JSON format"
        columns={moduleImportColumns}
        sampleData={moduleSampleData}
        onImport={handleBulkImportModules}
        entityName="Modules"
      />
    </div>
  );
};
