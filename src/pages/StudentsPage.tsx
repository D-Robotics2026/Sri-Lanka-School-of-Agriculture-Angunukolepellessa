import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Student, NVQLevel, EnrollmentStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { BarcodeDisplay } from '../components/common/BarcodeDisplay';
import { BulkActionBar } from '../components/common/BulkActionBar';
import { BulkImportModal } from '../components/common/BulkImportModal';
import { ImageUpload } from '../components/common/ImageUpload';
import { formatDate } from '../utils/dateUtils';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Home,
  UserCheck,
  IdCard,
  Printer,
  Upload
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    groups,
    academicYears
  } = useData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | NVQLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EnrollmentStatus>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Form State
  const [form, setForm] = useState({
    indexNumber: '',
    barcode: '',
    nic: '',
    fullName: '',
    callingName: '',
    gender: 'male' as 'male' | 'female',
    dob: '',
    address: '',
    phone: '',
    email: '',
    parentName: '',
    parentRelationship: 'Father',
    parentPhone: '',
    parentAddress: '',
    parentOccupation: '',
    nvqLevel: 'Level 5' as NVQLevel,
    semester: 1 as number | 'OJT',
    groupId: '',
    academicYearId: '',
    photoUrl: '',
    enrollmentStatus: 'active' as EnrollmentStatus,
    isHostelResident: true,
    hostelRoomNumber: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const randomBarcode = '884012024' + Math.floor(100 + Math.random() * 900);
    setForm({
      indexNumber: 'AG/2024/L5/' + Math.floor(100 + Math.random() * 900),
      barcode: randomBarcode,
      nic: '2003' + Math.floor(10000000 + Math.random() * 90000000),
      fullName: '',
      callingName: '',
      gender: 'male',
      dob: '2003-05-15',
      address: 'Angunakolapelessa, Southern Province',
      phone: '+94 77 ' + Math.floor(1000000 + Math.random() * 9000000),
      email: '',
      parentName: '',
      parentRelationship: 'Father',
      parentPhone: '+94 71 ' + Math.floor(1000000 + Math.random() * 9000000),
      parentAddress: '',
      parentOccupation: 'Farmer',
      nvqLevel: 'Level 5',
      semester: 1,
      groupId: groups[0]?.id || '',
      academicYearId: academicYears[0]?.id || '',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      enrollmentStatus: 'active',
      isHostelResident: true,
      hostelRoomNumber: 'Block A, Room 10',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      indexNumber: student.indexNumber,
      barcode: student.barcode,
      nic: student.nic,
      fullName: student.fullName,
      callingName: student.callingName,
      gender: student.gender,
      dob: student.dob,
      address: student.address,
      phone: student.phone,
      email: student.email,
      parentName: student.parent.name,
      parentRelationship: student.parent.relationship,
      parentPhone: student.parent.phone,
      parentAddress: student.parent.address,
      parentOccupation: student.parent.occupation || '',
      nvqLevel: student.nvqLevel,
      semester: student.semester,
      groupId: student.groupId,
      academicYearId: student.academicYearId,
      photoUrl: student.photoUrl,
      enrollmentStatus: student.enrollmentStatus,
      isHostelResident: student.isHostelResident,
      hostelRoomNumber: student.hostelRoomNumber || '',
      enrollmentDate: student.enrollmentDate
    });
    setIsFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const studentPayload = {
      indexNumber: form.indexNumber,
      barcode: form.barcode,
      nic: form.nic,
      fullName: form.fullName,
      callingName: form.callingName || form.fullName.split(' ')[0],
      gender: form.gender,
      dob: form.dob,
      address: form.address,
      phone: form.phone,
      email: form.email || `${form.indexNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@student.soa.ac.lk`,
      parent: {
        name: form.parentName,
        relationship: form.parentRelationship,
        phone: form.parentPhone,
        address: form.parentAddress || form.address,
        occupation: form.parentOccupation
      },
      nvqLevel: form.nvqLevel,
      semester: form.semester,
      groupId: form.groupId,
      academicYearId: form.academicYearId,
      photoUrl: form.photoUrl,
      enrollmentStatus: form.enrollmentStatus,
      isHostelResident: form.isHostelResident,
      hostelRoomNumber: form.hostelRoomNumber,
      enrollmentDate: form.enrollmentDate
    };

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...studentPayload
      });
    } else {
      addStudent(studentPayload);
    }
    setIsFormModalOpen(false);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = levelFilter === 'all' || s.nvqLevel === levelFilter;
      const matchesStatus = statusFilter === 'all' || s.enrollmentStatus === statusFilter;
      const matchesGroup = groupFilter === 'all' || s.groupId === groupFilter;

      return matchesSearch && matchesLevel && matchesStatus && matchesGroup;
    });
  }, [students, searchQuery, levelFilter, statusFilter, groupFilter]);

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="green">Active</Badge>;
      case 'ojt':
        return <Badge variant="purple">In 6-Mo OJT</Badge>;
      case 'graduated':
        return <Badge variant="blue">Graduated</Badge>;
      case 'suspended':
        return <Badge variant="red">Suspended</Badge>;
      case 'dropped_out':
        return <Badge variant="slate">Withdrawn</Badge>;
    }
  };

  const studentImportColumns = [
    { key: 'indexNumber', label: 'Index Number', required: true },
    { key: 'fullName', label: 'Full Name', required: true },
    { key: 'nic', label: 'NIC / Passport', required: true },
    { key: 'nvqLevel', label: 'NVQ Level (Level 5 / Level 6)', required: true },
    { key: 'semester', label: 'Semester (1, 2, 3, 4, or OJT)' },
    { key: 'gender', label: 'Gender (male / female)' },
    { key: 'callingName', label: 'Calling / Nick Name' },
    { key: 'phone', label: 'Contact Phone' },
    { key: 'email', label: 'Email Address' },
    { key: 'address', label: 'Residential Address' },
    { key: 'parentName', label: 'Guardian Name' },
    { key: 'parentPhone', label: 'Guardian Phone' },
    { key: 'barcode', label: 'Barcode Number' },
    { key: 'hostelRoomNumber', label: 'Hostel Room Number' }
  ];

  const studentSampleData = [
    {
      indexNumber: 'AG/2024/L5/001',
      fullName: 'Kavindu Chamod Senanayake',
      nic: '200318900456',
      nvqLevel: 'Level 5',
      semester: '1',
      gender: 'male',
      callingName: 'Kavindu',
      phone: '+94 77 123 4567',
      email: 'kavindu@student.soa.doa.gov.lk',
      address: 'Main St, Angunakolapelessa',
      parentName: 'S. Senanayake',
      parentPhone: '+94 71 987 6543',
      barcode: '884012024001',
      hostelRoomNumber: 'A-12'
    },
    {
      indexNumber: 'AG/2024/L6/002',
      fullName: 'Nethmi Dilhara Wickramasinghe',
      nic: '200276500123',
      nvqLevel: 'Level 6',
      semester: '1',
      gender: 'female',
      callingName: 'Nethmi',
      phone: '+94 76 234 5678',
      email: 'nethmi@student.soa.doa.gov.lk',
      address: 'Tangalle Road, Beliatta',
      parentName: 'W. Wickramasinghe',
      parentPhone: '+94 70 876 5432',
      barcode: '884012024002',
      hostelRoomNumber: 'G-05'
    }
  ];

  const handleBulkImportStudents = async (rows: any[]) => {
    for (const r of rows) {
      const nvq: NVQLevel =
        r.nvqLevel && r.nvqLevel.toString().includes('6') ? 'Level 6' : 'Level 5';
      const sem =
        r.semester === 'OJT' || r.semester === 'ojt'
          ? 'OJT'
          : parseInt(r.semester, 10) || 1;
      const gender =
        (r.gender || '').toLowerCase().startsWith('f') ? 'female' : 'male';
      const barcode =
        r.barcode || '884012024' + Math.floor(1000 + Math.random() * 9000);
      const indexNum =
        r.indexNumber || `AG/2024/${nvq === 'Level 6' ? 'L6' : 'L5'}/${Math.floor(100 + Math.random() * 900)}`;

      addStudent({
        indexNumber: indexNum,
        barcode: barcode,
        nic: r.nic || `2003${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: r.fullName || 'Student Name',
        callingName: r.callingName || (r.fullName ? r.fullName.split(' ')[0] : 'Student'),
        gender: gender,
        dob: r.dob || '2003-01-01',
        address: r.address || 'Angunakolapelessa, Southern Province',
        phone: r.phone || '+94 77 000 0000',
        email: r.email || `${indexNum.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@student.soa.ac.lk`,
        parent: {
          name: r.parentName || 'Guardian',
          relationship: r.parentRelationship || 'Father',
          phone: r.parentPhone || '+94 71 000 0000',
          address: r.parentAddress || r.address || 'Angunakolapelessa',
          occupation: r.parentOccupation || 'Agriculture'
        },
        nvqLevel: nvq,
        semester: sem,
        groupId: groups[0]?.id || '',
        academicYearId: academicYears[0]?.id || '',
        photoUrl:
          gender === 'female'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
            : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
        enrollmentStatus: 'active',
        isHostelResident: Boolean(r.hostelRoomNumber),
        hostelRoomNumber: r.hostelRoomNumber || '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Student Management & Profiles
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Bulk import students from CSV or Excel"
          >
            <Upload size={15} />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, index, barcode, NIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All NVQ Levels</option>
              <option value="Level 5">NVQ Level 5</option>
              <option value="Level 6">NVQ Level 6</option>
            </select>
          </div>

          <div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Batches / Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Enrollment Statuses</option>
              <option value="active">Active</option>
              <option value="ojt">In 6-Mo OJT</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {filteredStudents.length} of {students.length} enrolled students</span>
          {(searchQuery || levelFilter !== 'all' || statusFilter !== 'all' || groupFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('all');
                setStatusFilter('all');
                setGroupFilter('all');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Index No & Barcode</th>
                <th className="py-3 px-4">Curriculum Stage</th>
                <th className="py-3 px-4">Hostel Resident</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const grp = groups.find((g) => g.id === s.groupId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.photoUrl}
                            alt={s.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="text-[11px] text-slate-400">
                              NIC: {s.nic} • {s.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{s.indexNumber}</div>
                        <div className="font-mono text-[11px] text-slate-400">{s.barcode}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant={s.nvqLevel === 'Level 5' ? 'green' : 'blue'}>
                            {s.nvqLevel}
                          </Badge>
                          <span className="font-bold text-slate-700">
                            {s.semester === 'OJT' ? 'OJT Phase' : `Sem ${s.semester}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {grp?.code || 'No Group'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {s.isHostelResident ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                              <Home size={11} />
                              <span>Resident</span>
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{s.hostelRoomNumber}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Day Scholar</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(s.enrollmentStatus)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="View Full Profile & ID Card"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Student Profile"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove student ${s.fullName} (${s.indexNumber})?`)) {
                                deleteStudent(s.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Student"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Student View / ID Card Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Student Dossier & Official ID"
          subtitle="School of Agriculture - Angunakolapelessa"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Student ID Card Simulation */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-700/50 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-white text-xs">
                    DOA
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                      Department of Agriculture — Sri Lanka
                    </p>
                    <h4 className="text-xs font-black tracking-tight">
                      School of Agriculture, Angunakolapelessa
                    </h4>
                  </div>
                </div>
                <Badge variant="green" size="sm">
                  {selectedStudent.nvqLevel}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.fullName}
                  className="w-24 h-28 rounded-xl object-cover border-2 border-white/40 shadow-md shrink-0"
                />

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base font-extrabold text-white">{selectedStudent.fullName}</h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    NIC: <span className="font-mono text-white">{selectedStudent.nic}</span>
                  </p>
                  <p className="text-xs text-emerald-200">
                    Index: <span className="font-mono font-bold text-white text-sm">{selectedStudent.indexNumber}</span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] bg-black/20 px-2.5 py-1 rounded-lg">
                    <span>Stage: {selectedStudent.semester === 'OJT' ? '6-Month OJT' : `Semester ${selectedStudent.semester}`}</span>
                    <span>•</span>
                    <span>Status: {selectedStudent.enrollmentStatus.toUpperCase()}</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-xl shrink-0">
                  <BarcodeDisplay value={selectedStudent.barcode} height={36} />
                </div>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Personal & Contact Details
                </h5>
                <p>
                  <span className="text-slate-400">Calling Name:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.callingName}</span>
                </p>
                <p>
                  <span className="text-slate-400">Gender:</span>{' '}
                  <span className="font-medium capitalize text-slate-700">{selectedStudent.gender}</span>
                </p>
                <p>
                  <span className="text-slate-400">Date of Birth:</span>{' '}
                  <span className="font-medium text-slate-700">{formatDate(selectedStudent.dob)}</span>
                </p>
                <p>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.phone}</span>
                </p>
                <p>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.email}</span>
                </p>
                <p>
                  <span className="text-slate-400">Address:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.address}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Guardian & Residential Status
                </h5>
                <p>
                  <span className="text-slate-400">Parent/Guardian:</span>{' '}
                  <span className="font-medium text-slate-700">
                    {selectedStudent.parent.name} ({selectedStudent.parent.relationship})
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Guardian Contact:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.parent.phone}</span>
                </p>
                <p>
                  <span className="text-slate-400">Guardian Occupation:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedStudent.parent.occupation || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-slate-400">Hostel Resident:</span>{' '}
                  <span className="font-medium text-slate-700">
                    {selectedStudent.isHostelResident ? `Yes (${selectedStudent.hostelRoomNumber})` : 'No (Day Scholar)'}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Enrolled On:</span>{' '}
                  <span className="font-medium text-slate-700">{formatDate(selectedStudent.enrollmentDate)}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedStudent);
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 transition"
              >
                <Edit2 size={14} />
                <span>Edit & Change Photo</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition"
              >
                <Printer size={14} />
                <span>Print Student Card</span>
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        subtitle="Department of Agriculture Sri Lanka - Institutional Enrollment"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Official Student Photograph Upload to Firebase Storage */}
          <ImageUpload
            value={form.photoUrl}
            onChange={(url) => setForm({ ...form, photoUrl: url })}
            folder="students"
            label="Student Official Photograph (Max 1MB • Firebase Storage)"
            shape="square"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Index Number</label>
              <input
                type="text"
                required
                value={form.indexNumber}
                onChange={(e) => setForm({ ...form, indexNumber: e.target.value })}
                placeholder="e.g. AG/2024/L5/042"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode Value</label>
              <input
                type="text"
                required
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="e.g. 884012024042"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">National Identity Card (NIC)</label>
              <input
                type="text"
                required
                value={form.nic}
                onChange={(e) => setForm({ ...form, nic: e.target.value })}
                placeholder="e.g. 200215401234"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Full name as in birth certificate"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calling Name</label>
              <input
                type="text"
                value={form.callingName}
                onChange={(e) => setForm({ ...form, callingName: e.target.value })}
                placeholder="e.g. Kasun"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. No. 45, Temple Road, Ranna, Tangalle"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Academic Placement */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">Curriculum & Cohort Placement</h5>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">NVQ Level</label>
                <select
                  value={form.nvqLevel}
                  onChange={(e) => setForm({ ...form, nvqLevel: e.target.value as NVQLevel })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Level 5">NVQ Level 5</option>
                  <option value="Level 6">NVQ Level 6</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semester / Phase</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value === 'OJT' ? 'OJT' : Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  {form.nvqLevel === 'Level 6' && (
                    <>
                      <option value={3}>Semester 3</option>
                      <option value={4}>Semester 4</option>
                    </>
                  )}
                  <option value="OJT">6-Month OJT Phase</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Batch / Group</label>
                <select
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enrollment Status</label>
                <select
                  value={form.enrollmentStatus}
                  onChange={(e) => setForm({ ...form, enrollmentStatus: e.target.value as EnrollmentStatus })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="ojt">In OJT</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hostel Residency Check */}
          <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isHostelResident"
                checked={form.isHostelResident}
                onChange={(e) => setForm({ ...form, isHostelResident: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="isHostelResident" className="text-xs font-bold text-slate-800 cursor-pointer">
                Hostel Boarder Resident (Enables Weekly 7×3 Meal Matrix)
              </label>
            </div>
            {form.isHostelResident && (
              <input
                type="text"
                placeholder="Room / Wing (e.g. Block B-12)"
                value={form.hostelRoomNumber}
                onChange={(e) => setForm({ ...form, hostelRoomNumber: e.target.value })}
                className="w-48 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-xl"
              />
            )}
          </div>

          {/* Parent/Guardian Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">Parent / Guardian Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Guardian Name</label>
                <input
                  type="text"
                  required
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  placeholder="Guardian's full name"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relationship</label>
                <select
                  value={form.parentRelationship}
                  onChange={(e) => setForm({ ...form, parentRelationship: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Guardian Phone</label>
                <input
                  type="text"
                  required
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  placeholder="+94 71 234 5678"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Students"
        subtitle="Import multiple student profiles with NIC, barcodes, and NVQ levels from CSV / Excel"
        columns={studentImportColumns}
        sampleData={studentSampleData}
        onImport={handleBulkImportStudents}
        entityName="Students"
      />
    </div>
  );
};
