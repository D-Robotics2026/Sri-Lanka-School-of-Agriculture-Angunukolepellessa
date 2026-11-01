import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Assignment, PracticalTest, AssignmentStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { BulkActionBar } from '../components/common/BulkActionBar';
import { formatDate } from '../utils/dateUtils';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  Edit2,
  Trash2,
  Users,
  Search,
  BookOpenCheck
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    assignments,
    addAssignment,
    deleteAssignment,
    gradeAssignmentSubmission,
    practicalTests,
    addPracticalTest,
    deletePracticalTest,
    recordPracticalResult,
    modules,
    students
  } = useData();

  const [activeTab, setActiveTab] = useState<'assignments' | 'tests'>('assignments');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [selectedAsnIds, setSelectedAsnIds] = useState<string[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  // Assignment Modal
  const [isAsnModalOpen, setIsAsnModalOpen] = useState(false);
  const [asnForm, setAsnForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    semester: 1,
    maxMarks: 100,
    weightagePercent: 15,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  // Grade Assignment Submission Modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [activeAsnForGrading, setActiveAsnForGrading] = useState<Assignment | null>(null);
  const [gradingStudentId, setGradingStudentId] = useState('');
  const [marksEarned, setMarksEarned] = useState<number>(85);
  const [submissionStatus, setSubmissionStatus] = useState<'submitted' | 'late'>('submitted');
  const [gradingRemarks, setGradingRemarks] = useState('');

  // Practical Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    moduleId: '',
    title: '',
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    venue: 'Demonstration Plot 3 / Botany Lab',
    maxMarks: 100,
    weightagePercent: 20,
    status: 'scheduled' as 'scheduled' | 'completed'
  });

  // Score Practical Test Modal
  const [testScoreModalOpen, setTestScoreModalOpen] = useState(false);
  const [activeTestForScoring, setActiveTestForScoring] = useState<PracticalTest | null>(null);
  const [scoringStudentId, setScoringStudentId] = useState('');
  const [testMarks, setTestMarks] = useState<number>(80);
  const [competencyAchieved, setCompetencyAchieved] = useState(true);
  const [testRemarks, setTestRemarks] = useState('');

  // Open create assignment
  const handleOpenAddAsn = () => {
    setAsnForm({
      moduleId: modules[0]?.id || '',
      title: '',
      description: '',
      semester: 1,
      maxMarks: 100,
      weightagePercent: 15,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });
    setIsAsnModalOpen(true);
  };

  const handleSaveAsn = (e: React.FormEvent) => {
    e.preventDefault();
    addAssignment(asnForm);
    setIsAsnModalOpen(false);
  };

  // Open create test
  const handleOpenAddTest = () => {
    setTestForm({
      moduleId: modules[0]?.id || '',
      title: '',
      scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      venue: 'Agronomy Lab / Workshop 1',
      maxMarks: 100,
      weightagePercent: 20,
      status: 'scheduled'
    });
    setIsTestModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    addPracticalTest(testForm);
    setIsTestModalOpen(false);
  };

  // Submit Grade for Assignment
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsnForGrading || !gradingStudentId) return;
    const stu = students.find((s) => s.id === gradingStudentId);
    if (!stu) return;

    gradeAssignmentSubmission(
      activeAsnForGrading.id,
      stu.id,
      stu.indexNumber,
      marksEarned,
      gradingRemarks,
      submissionStatus
    );
    setGradeModalOpen(false);
  };

  // Submit Result for Practical Test
  const handleSaveTestResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestForScoring || !scoringStudentId) return;
    const stu = students.find((s) => s.id === scoringStudentId);
    if (!stu) return;

    recordPracticalResult(
      activeTestForScoring.id,
      stu.id,
      stu.indexNumber,
      testMarks,
      competencyAchieved,
      testRemarks
    );
    setTestScoreModalOpen(false);
  };

  const filteredAssignments = assignments.filter((a) => {
    return selectedModuleFilter === 'all' || a.moduleId === selectedModuleFilter;
  });

  const filteredTests = practicalTests.filter((t) => {
    return selectedModuleFilter === 'all' || t.moduleId === selectedModuleFilter;
  });


  const handleBulkDeleteAssignments = () => {
    if (selectedAsnIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedAsnIds.length} selected student assignments?`)) {
      selectedAsnIds.forEach((id) => deleteAssignment(id));
      setSelectedAsnIds([]);
    }
  };

  const handleBulkDeleteTests = () => {
    if (selectedTestIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedTestIds.length} selected practical competency tests?`)) {
      selectedTestIds.forEach((id) => deletePracticalTest(id));
      setSelectedTestIds([]);
    }
  };

  const toggleSelectAsn = (id: string) => {
    setSelectedAsnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectTest = (id: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Assessments & Practical Grading
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theory assignments, practical competence exams, and grade scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'assignments' ? (
            <button
              onClick={handleOpenAddAsn}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddTest}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} />
              <span>Schedule Practical Test</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Assignments ({assignments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award size={14} />
            <span>Practical Tests ({practicalTests.length})</span>
          </button>
        </div>

        <div>
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {filteredAssignments.map((asn) => {
            const mod = modules.find((m) => m.id === asn.moduleId);
            const submittedCount = asn.submissions.filter((s) => s.status !== 'not_submitted').length;

            return (
              <div
                key={asn.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {mod?.code}
                      </span>
                      <span className="text-xs text-slate-500">Semester {asn.semester}</span>
                      <span className="text-xs font-bold text-slate-700">• Max Marks: {asn.maxMarks}</span>
                      <span className="text-xs text-slate-500">• Weightage: {asn.weightagePercent}%</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{asn.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asn.description}</p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Due: <strong className="text-slate-800 font-mono">{formatDate(asn.dueDate)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-emerald-600" />
                        <span>Submissions Marked: <strong>{submittedCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => {
                        setActiveAsnForGrading(asn);
                        setGradingStudentId(students[0]?.id || '');
                        setGradeModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Award size={14} />
                      <span>Grade Student</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete assignment "${asn.title}"?`)) {
                          deleteAssignment(asn.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Submissions List Snippet */}
                {asn.submissions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Recorded Student Submissions ({asn.submissions.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {asn.submissions.map((sub) => {
                        const stu = students.find((s) => s.id === sub.studentId);
                        return (
                          <div
                            key={sub.studentId}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-slate-800 truncate">{stu?.fullName || sub.studentIndex}</p>
                              <p className="text-[10px] text-slate-400">{sub.studentIndex} • {sub.status}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-700 text-sm">
                                {sub.marks !== undefined ? `${sub.marks}/${asn.maxMarks}` : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Practical Tests */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {filteredTests.map((test) => {
            const mod = modules.find((m) => m.id === test.moduleId);
            const scoredCount = test.results.length;

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {mod?.code}
                      </span>
                      <Badge variant={test.status === 'completed' ? 'green' : 'amber'}>
                        {test.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-bold text-slate-700">• Max Marks: {test.maxMarks}</span>
                      <span className="text-xs text-slate-500">• Weightage: {test.weightagePercent}%</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{test.title}</h3>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Venue: <strong className="text-slate-800">{test.venue}</strong></span>
                      <span>Date: <strong className="text-slate-800 font-mono">{formatDate(test.scheduledDate)}</strong></span>
                      <span>Candidates Assessed: <strong>{scoredCount}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => {
                        setActiveTestForScoring(test);
                        setScoringStudentId(students[0]?.id || '');
                        setTestScoreModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Award size={14} />
                      <span>Record Candidate Score</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete test "${test.title}"?`)) {
                          deletePracticalTest(test.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Practical Test Results Grid */}
                {test.results.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Competency Results & Scores ({test.results.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {test.results.map((res) => {
                        const stu = students.find((s) => s.id === res.studentId);
                        return (
                          <div
                            key={res.studentId}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-slate-800 truncate">{stu?.fullName || res.studentIndex}</p>
                              <p className="text-[10px] text-slate-400">{res.studentIndex}</p>
                              {res.competencyAchieved ? (
                                <span className="text-[10px] font-bold text-emerald-600">✓ Competent</span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-600">✗ Not Yet Competent</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {res.marks} / {res.maxMarks}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isAsnModalOpen}
        onClose={() => setIsAsnModalOpen(false)}
        title="Create New Theory Assignment"
        subtitle="Department of Agriculture Course Assessment"
      >
        <form onSubmit={handleSaveAsn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Module</label>
            <select
              value={asnForm.moduleId}
              onChange={(e) => setAsnForm({ ...asnForm, moduleId: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={asnForm.title}
              onChange={(e) => setAsnForm({ ...asnForm, title: e.target.value })}
              placeholder="e.g. Nutrient Deficiency Symptoms & Corrective Action Sheet"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Task Prompt</label>
            <textarea
              rows={3}
              required
              value={asnForm.description}
              onChange={(e) => setAsnForm({ ...asnForm, description: e.target.value })}
              placeholder="Provide instructions, required sections, and submission format..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
              <input
                type="number"
                min={10}
                max={100}
                value={asnForm.maxMarks}
                onChange={(e) => setAsnForm({ ...asnForm, maxMarks: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weightage (%)</label>
              <input
                type="number"
                min={5}
                max={50}
                value={asnForm.weightagePercent}
                onChange={(e) => setAsnForm({ ...asnForm, weightagePercent: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={asnForm.dueDate}
                onChange={(e) => setAsnForm({ ...asnForm, dueDate: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAsnModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Grade Assignment Modal */}
      {activeAsnForGrading && (
        <Modal
          isOpen={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
          title="Grade Assignment Submission"
          subtitle={activeAsnForGrading.title}
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                value={gradingStudentId}
                onChange={(e) => setGradingStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.indexNumber} — {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marks Obtained (out of {activeAsnForGrading.maxMarks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={activeAsnForGrading.maxMarks}
                  required
                  value={marksEarned}
                  onChange={(e) => setMarksEarned(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Status</label>
                <select
                  value={submissionStatus}
                  onChange={(e) => setSubmissionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="submitted">On-Time Submission</option>
                  <option value="late">Late Submission</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Remarks</label>
              <textarea
                rows={2}
                value={gradingRemarks}
                onChange={(e) => setGradingRemarks(e.target.value)}
                placeholder="Strengths, areas for improvement..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Save Grade Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Practical Test Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Schedule Practical Competency Test"
        subtitle="School of Agriculture - Angunakolapelessa"
      >
        <form onSubmit={handleSaveTest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Module</label>
            <select
              value={testForm.moduleId}
              onChange={(e) => setTestForm({ ...testForm, moduleId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Test Title</label>
            <input
              type="text"
              required
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              placeholder="e.g. Practical Test: Paddy Puddling & Rotor Assembly"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Field Location</label>
              <input
                type="text"
                required
                value={testForm.venue}
                onChange={(e) => setTestForm({ ...testForm, venue: e.target.value })}
                placeholder="e.g. Field Plot 4 / Tractor Shed"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={testForm.scheduledDate}
                onChange={(e) => setTestForm({ ...testForm, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
              <input
                type="number"
                min={20}
                max={100}
                value={testForm.maxMarks}
                onChange={(e) => setTestForm({ ...testForm, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weightage (%)</label>
              <input
                type="number"
                min={10}
                max={40}
                value={testForm.weightagePercent}
                onChange={(e) => setTestForm({ ...testForm, weightagePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Schedule Test
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Test Result Modal */}
      {activeTestForScoring && (
        <Modal
          isOpen={testScoreModalOpen}
          onClose={() => setTestScoreModalOpen(false)}
          title="Record Practical Test Score"
          subtitle={activeTestForScoring.title}
        >
          <form onSubmit={handleSaveTestResult} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate</label>
              <select
                value={scoringStudentId}
                onChange={(e) => setScoringStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.indexNumber} — {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marks (out of {activeTestForScoring.maxMarks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={activeTestForScoring.maxMarks}
                  required
                  value={testMarks}
                  onChange={(e) => setTestMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Competency Status</label>
                <select
                  value={competencyAchieved ? 'yes' : 'no'}
                  onChange={(e) => setCompetencyAchieved(e.target.value === 'yes')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="yes">Competent (Pass)</option>
                  <option value="no">Not Yet Competent (Re-assessment)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks & Observations</label>
              <textarea
                rows={2}
                value={testRemarks}
                onChange={(e) => setTestRemarks(e.target.value)}
                placeholder="Hands-on observations, safety adherence..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTestScoreModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Save Test Result
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
