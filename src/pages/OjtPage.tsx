import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { OJTPlacement, OJTMonthlyReport } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/dateUtils';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Building,
  UserCheck,
  FileCheck,
  Phone,
  Mail,
  Edit2,
  Star,
  Printer
} from 'lucide-react';

export const OjtPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    ojtPlacements,
    addOJTPlacement,
    updateOJTPlacement,
    updateOJTMonthlyReport,
    saveOJTFinalEvaluation,
    students
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState<OJTPlacement | null>(null);

  // New Placement Modal
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [placementForm, setPlacementForm] = useState({
    studentId: '',
    establishmentName: 'Regional Agricultural Research & Development Centre (RARDC) - Angunakolapelessa',
    establishmentAddress: 'Angunakolapelessa, Southern Province',
    establishmentSector: 'Government Research' as OJTPlacement['establishmentSector'],
    supervisorName: 'Dr. W. M. Bandara',
    supervisorDesignation: 'Senior Research Officer',
    supervisorPhone: '+94 47 222 8204',
    supervisorEmail: 'bandara.r@doa.gov.lk',
    startDate: '2026-05-01',
    endDate: '2026-10-31'
  });

  // Monthly Report Review Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activePlacementForReport, setActivePlacementForReport] = useState<OJTPlacement | null>(null);
  const [activeMonthNumber, setActiveMonthNumber] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [reportStatus, setReportStatus] = useState<'pending' | 'submitted' | 'reviewed' | 'approved'>('approved');
  const [reportFeedback, setReportFeedback] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // Final Evaluation Modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalPlacement, setEvalPlacement] = useState<OJTPlacement | null>(null);
  const [evalForm, setEvalForm] = useState({
    technicalSkillsScore: 35, // max 40
    attendanceDisciplineScore: 18, // max 20
    logbookReportScore: 18, // max 20
    presentationScore: 18, // max 20
    supervisorComments: ''
  });

  const handleOpenAddPlacement = () => {
    setPlacementForm({
      studentId: students[0]?.id || '',
      establishmentName: 'Regional Agricultural Research & Development Centre (RARDC) - Angunakolapelessa',
      establishmentAddress: 'Angunakolapelessa, Southern Province',
      establishmentSector: 'Government Research',
      supervisorName: '',
      supervisorDesignation: 'Senior Research Officer',
      supervisorPhone: '+94 47 222 8204',
      supervisorEmail: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
    });
    setIsPlacementModalOpen(true);
  };

  const handleSavePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    addOJTPlacement(placementForm);
    setIsPlacementModalOpen(false);
  };

  const handleOpenMonthlyReport = (placement: OJTPlacement, month: 1 | 2 | 3 | 4 | 5 | 6) => {
    setActivePlacementForReport(placement);
    setActiveMonthNumber(month);
    const existing = placement.monthlyReports.find((r) => r.monthNumber === month);
    setReportStatus(existing?.status || 'approved');
    setReportFeedback(existing?.supervisorFeedback || '');
    setSkillsInput(existing?.skillsPracticed?.join(', ') || '');
    setReportModalOpen(true);
  };

  const handleSaveMonthlyReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlacementForReport) return;

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateOJTMonthlyReport(activePlacementForReport.id, activeMonthNumber, {
      status: reportStatus,
      supervisorFeedback: reportFeedback,
      skillsPracticed: skillsArray,
      submissionDate: new Date().toISOString().split('T')[0],
      reviewedBy: currentUser?.fullName || 'Supervising Officer'
    });

    setReportModalOpen(false);
  };

  const handleOpenFinalEval = (placement: OJTPlacement) => {
    setEvalPlacement(placement);
    if (placement.finalEvaluation) {
      setEvalForm({
        technicalSkillsScore: placement.finalEvaluation.technicalSkillsScore,
        attendanceDisciplineScore: placement.finalEvaluation.attendanceDisciplineScore,
        logbookReportScore: placement.finalEvaluation.logbookReportScore,
        presentationScore: placement.finalEvaluation.presentationScore,
        supervisorComments: placement.finalEvaluation.supervisorComments
      });
    } else {
      setEvalForm({
        technicalSkillsScore: 35,
        attendanceDisciplineScore: 18,
        logbookReportScore: 18,
        presentationScore: 17,
        supervisorComments: 'Candidate demonstrated high aptitude in agronomic practices and field trials.'
      });
    }
    setEvalModalOpen(true);
  };

  const handleSaveFinalEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalPlacement) return;

    const total =
      evalForm.technicalSkillsScore +
      evalForm.attendanceDisciplineScore +
      evalForm.logbookReportScore +
      evalForm.presentationScore;

    let grade: 'Distinction' | 'Merit' | 'Pass' | 'Fail' = 'Pass';
    if (total >= 85) grade = 'Distinction';
    else if (total >= 70) grade = 'Merit';
    else if (total >= 50) grade = 'Pass';
    else grade = 'Fail';

    saveOJTFinalEvaluation(evalPlacement.id, {
      technicalSkillsScore: evalForm.technicalSkillsScore,
      attendanceDisciplineScore: evalForm.attendanceDisciplineScore,
      logbookReportScore: evalForm.logbookReportScore,
      presentationScore: evalForm.presentationScore,
      totalScore: total,
      finalGrade: grade,
      supervisorComments: evalForm.supervisorComments,
      evaluatedDate: new Date().toISOString().split('T')[0]
    });

    setEvalModalOpen(false);
  };

  const filteredPlacements = ojtPlacements.filter((p) => {
    const stu = students.find((s) => s.id === p.studentId);
    return (
      p.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu && stu.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stu && stu.indexNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            6-Month On-the-Job Training (OJT) Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory 6-month industry training requirement for NVQ Level 5 & Level 6 certification
          </p>
        </div>

        <button
          onClick={handleOpenAddPlacement}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New OJT Placement</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, index, establishment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Placements Cards */}
      <div className="space-y-6">
        {filteredPlacements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No active OJT placements recorded</p>
          </div>
        ) : (
          filteredPlacements.map((plc) => {
            const stu = students.find((s) => s.id === plc.studentId);
            const approvedReportsCount = plc.monthlyReports.filter((r) => r.status === 'approved').length;

            return (
              <div
                key={plc.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-5"
              >
                {/* Placement Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {stu?.indexNumber || 'Unknown'}
                        </span>
                        <Badge variant={stu?.nvqLevel === 'Level 5' ? 'green' : 'blue'}>
                          {stu?.nvqLevel || 'Level 6'}
                        </Badge>
                        <Badge variant="purple">{plc.establishmentSector}</Badge>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{stu?.fullName}</h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                        <Building size={14} className="text-slate-400" />
                        <span>{plc.establishmentName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => handleOpenFinalEval(plc)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        plc.finalEvaluation
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      <Award size={14} />
                      <span>{plc.finalEvaluation ? 'View / Edit Final Grade' : 'Evaluate Candidate'}</span>
                    </button>
                  </div>
                </div>

                {/* Supervisor & Placement Period */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Industry Supervisor
                    </span>
                    <span className="font-bold text-slate-800">{plc.supervisorName}</span>
                    <div className="text-[11px] text-slate-500">{plc.supervisorDesignation}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Information</span>
                    <div>{plc.supervisorPhone}</div>
                    <div className="truncate text-slate-500">{plc.supervisorEmail}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      6-Month Training Duration
                    </span>
                    <div className="font-semibold text-slate-800 font-mono">
                      {formatDate(plc.startDate)} to {formatDate(plc.endDate)}
                    </div>
                    <span className="text-emerald-700 font-bold text-[11px]">
                      {approvedReportsCount} of 6 Reports Approved
                    </span>
                  </div>
                </div>

                {/* 6 Monthly Reports Tracker */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-emerald-600" />
                    <span>6 Monthly Progress Reports (Mandatory Submissions)</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {plc.monthlyReports.map((report) => {
                      const isApproved = report.status === 'approved';
                      const isSubmitted = report.status === 'submitted';
                      return (
                        <div
                          key={report.monthNumber}
                          onClick={() => handleOpenMonthlyReport(plc, report.monthNumber)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition hover:shadow-xs ${
                            isApproved
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : isSubmitted
                              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-[11px] font-bold">Month {report.monthNumber}</div>
                          <div className="mt-1">
                            {isApproved ? (
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">✓ Approved</span>
                            ) : isSubmitted ? (
                              <span className="text-[10px] font-bold text-blue-700 uppercase">● Submitted</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Evaluation Card if completed */}
                {plc.finalEvaluation && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <Award size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-950">Official OJT Final Grade:</span>
                          <span className="font-extrabold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded shadow-2xs">
                            {plc.finalEvaluation.finalGrade} ({plc.finalEvaluation.totalScore}/100)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 italic">
                          "{plc.finalEvaluation.supervisorComments}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs font-medium text-slate-500 shrink-0">
                      <div>Technical: {plc.finalEvaluation.technicalSkillsScore}/40</div>
                      <div>Discipline: {plc.finalEvaluation.attendanceDisciplineScore}/20</div>
                      <div>Report: {plc.finalEvaluation.logbookReportScore}/20 | Viva: {plc.finalEvaluation.presentationScore}/20</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Placement Modal */}
      <Modal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        title="Establish New 6-Month OJT Placement"
        subtitle="Department of Agriculture Industrial Linkage"
        maxWidth="lg"
      >
        <form onSubmit={handleSavePlacement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student Candidate</label>
            <select
              value={placementForm.studentId}
              onChange={(e) => setPlacementForm({ ...placementForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.indexNumber} — {s.fullName} ({s.nvqLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Establishment / Research Station</label>
              <input
                type="text"
                required
                value={placementForm.establishmentName}
                onChange={(e) => setPlacementForm({ ...placementForm, establishmentName: e.target.value })}
                placeholder="e.g. Rice Research Institute (RRDI) - Batalagoda"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
              <select
                value={placementForm.establishmentSector}
                onChange={(e) => setPlacementForm({ ...placementForm, establishmentSector: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="Government Research">Government Research</option>
                <option value="Commercial Farm">Commercial Farm</option>
                <option value="Agri-Business">Agri-Business</option>
                <option value="Extension Centre">Extension Centre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Establishment Address</label>
            <input
              type="text"
              required
              value={placementForm.establishmentAddress}
              onChange={(e) => setPlacementForm({ ...placementForm, establishmentAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Supervisor Name</label>
              <input
                type="text"
                required
                value={placementForm.supervisorName}
                onChange={(e) => setPlacementForm({ ...placementForm, supervisorName: e.target.value })}
                placeholder="e.g. Dr. W. M. Bandara"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor Designation</label>
              <input
                type="text"
                required
                value={placementForm.supervisorDesignation}
                onChange={(e) => setPlacementForm({ ...placementForm, supervisorDesignation: e.target.value })}
                placeholder="e.g. Senior Research Officer"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor Phone</label>
              <input
                type="text"
                required
                value={placementForm.supervisorPhone}
                onChange={(e) => setPlacementForm({ ...placementForm, supervisorPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor Email</label>
              <input
                type="email"
                required
                value={placementForm.supervisorEmail}
                onChange={(e) => setPlacementForm({ ...placementForm, supervisorEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={placementForm.startDate}
                onChange={(e) => setPlacementForm({ ...placementForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (6 Months)</label>
              <input
                type="date"
                required
                value={placementForm.endDate}
                onChange={(e) => setPlacementForm({ ...placementForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPlacementModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Create Placement
            </button>
          </div>
        </form>
      </Modal>

      {/* Monthly Report Review Modal */}
      {activePlacementForReport && (
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title={`Monthly Report ${activeMonthNumber} Review`}
          subtitle={activePlacementForReport.establishmentName}
        >
          <form onSubmit={handleSaveMonthlyReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Report Status</label>
              <select
                value={reportStatus}
                onChange={(e) => setReportStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold"
              >
                <option value="pending">Pending Submission</option>
                <option value="submitted">Submitted by Trainee</option>
                <option value="reviewed">Reviewed by Institute</option>
                <option value="approved">Approved & Verified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Practical Skills Practiced (Comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Seed hybridization, Germination test, Tensiometer monitoring"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor Observations & Feedback</label>
              <textarea
                rows={3}
                value={reportFeedback}
                onChange={(e) => setReportFeedback(e.target.value)}
                placeholder="Review of trainee's weekly logs, field competency, and diligence..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Save Report Review
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Final Evaluation Modal */}
      {evalPlacement && (
        <Modal
          isOpen={evalModalOpen}
          onClose={() => setEvalModalOpen(false)}
          title="Final 6-Month OJT Comprehensive Evaluation"
          subtitle="Department of Agriculture Sri Lanka - National NVQ Scoring Rubric"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveFinalEval} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Competency (Max 40)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  required
                  value={evalForm.technicalSkillsScore}
                  onChange={(e) => setEvalForm({ ...evalForm, technicalSkillsScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance & Discipline (Max 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  required
                  value={evalForm.attendanceDisciplineScore}
                  onChange={(e) => setEvalForm({ ...evalForm, attendanceDisciplineScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logbook & Technical Report (Max 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  required
                  value={evalForm.logbookReportScore}
                  onChange={(e) => setEvalForm({ ...evalForm, logbookReportScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Presentation & Viva (Max 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  required
                  value={evalForm.presentationScore}
                  onChange={(e) => setEvalForm({ ...evalForm, presentationScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
              <span className="text-xs text-slate-500">Cumulative Total Score:</span>
              <div className="text-xl font-black text-emerald-800">
                {evalForm.technicalSkillsScore +
                  evalForm.attendanceDisciplineScore +
                  evalForm.logbookReportScore +
                  evalForm.presentationScore}{' '}
                / 100
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor's Final Remarks</label>
              <textarea
                rows={3}
                required
                value={evalForm.supervisorComments}
                onChange={(e) => setEvalForm({ ...evalForm, supervisorComments: e.target.value })}
                placeholder="Summary of student's professional growth, conduct, and recommendation..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Submit Official OJT Evaluation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
