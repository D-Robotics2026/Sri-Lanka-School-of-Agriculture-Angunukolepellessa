import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Lecturer } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Edit2,
  Trash2,
  GraduationCap,
  Building
} from 'lucide-react';

export const LecturersPage: React.FC = () => {
  const { lecturers, addLecturer, updateLecturer, deleteLecturer, modules } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  const [form, setForm] = useState({
    lecturerId: '',
    fullName: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    qualifications: '',
    photoUrl: '',
    assignedModuleIds: [] as string[]
  });

  const departments = Array.from(new Set(lecturers.map((l) => l.department)));

  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setForm({
      lecturerId: `LEC-AG-00${lecturers.length + 1}`,
      fullName: '',
      designation: 'Senior Agricultural Instructor',
      department: 'Crop Science & Agronomy',
      email: '',
      phone: '+94 77 123 4567',
      qualifications: 'B.Sc. (Agric) Sri Lanka',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      assignedModuleIds: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lec: Lecturer) => {
    setEditingLecturer(lec);
    setForm({
      lecturerId: lec.lecturerId,
      fullName: lec.fullName,
      designation: lec.designation,
      department: lec.department,
      email: lec.email,
      phone: lec.phone,
      qualifications: lec.qualifications,
      photoUrl: lec.photoUrl,
      assignedModuleIds: lec.assignedModuleIds || []
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLecturer) {
      updateLecturer({
        ...editingLecturer,
        ...form
      });
    } else {
      addLecturer(form);
    }
    setIsModalOpen(false);
  };

  const filteredLecturers = lecturers.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lecturerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || l.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Academic Faculty & Lecturers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agriculture instructors, senior lecturers, and module coordinators
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Lecturer / Instructor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lecturer name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Academic Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lecturer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLecturers.map((lec) => {
          const assignedMods = modules.filter(
            (m) => m.primaryLecturerId === lec.id || lec.assignedModuleIds?.includes(m.id)
          );

          return (
            <div
              key={lec.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <img
                    src={lec.photoUrl}
                    alt={lec.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {lec.lecturerId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{lec.fullName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{lec.designation}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{lec.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{lec.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{lec.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 italic leading-snug">
                      {lec.qualifications}
                    </span>
                  </div>
                </div>

                {/* Assigned Modules */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Assigned Teaching Modules ({assignedMods.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedMods.length === 0 ? (
                      <span className="text-[11px] text-slate-400">No active modules assigned</span>
                    ) : (
                      assignedMods.map((mod) => (
                        <span
                          key={mod.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                          title={mod.title}
                        >
                          {mod.code}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(lec)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  title="Edit Lecturer"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete lecturer ${lec.fullName}?`)) {
                      deleteLecturer(lec.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Lecturer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Lecturer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLecturer ? 'Edit Lecturer Profile' : 'Add New Lecturer'}
        subtitle="Department of Agriculture Faculty Register"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID</label>
              <input
                type="text"
                required
                value={form.lecturerId}
                onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Crop Science & Agronomy"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name & Title</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Dr. Kapila M. Perera"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              required
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="e.g. Senior Lecturer / Head of Department"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@soa.doa.gov.lk"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Qualifications</label>
            <input
              type="text"
              required
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              placeholder="e.g. B.Sc. (Agric) Peradeniya, M.Sc., Ph.D."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Modules</label>
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              {modules.map((m) => {
                const checked = form.assignedModuleIds.includes(m.id);
                return (
                  <label key={m.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, assignedModuleIds: [...form.assignedModuleIds, m.id] });
                        } else {
                          setForm({ ...form, assignedModuleIds: form.assignedModuleIds.filter((id) => id !== m.id) });
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800">{m.code}</span>
                    <span className="text-slate-600 truncate">{m.title}</span>
                  </label>
                );
              })}
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
              Save Lecturer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
