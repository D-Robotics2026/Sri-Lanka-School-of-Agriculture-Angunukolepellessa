import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  MealWeek,
  WeeklyMealChoices,
  DayOfWeek,
  MealType
} from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrintHeader } from '../components/common/PrintHeader';
import { formatDateTime } from '../utils/dateUtils';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  Printer,
  TrendingUp,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const HostelMealsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    mealWeeks,
    addMealWeek,
    updateMealWeek,
    mealSubmissions,
    saveMealSubmission,
    isMealWeekLocked,
    students
  } = useData();

  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics' | 'weeks' | 'print'>('matrix');
  const [selectedWeekId, setSelectedWeekId] = useState<string>(
    mealWeeks.find((w) => w.status === 'open')?.id || mealWeeks[0]?.id || ''
  );

  // New Meal Week Modal
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [weekForm, setWeekForm] = useState({
    weekNumber: 46,
    title: 'Week 46 (Nov 09 - Nov 15, 2026)',
    startDate: '2026-11-09',
    endDate: '2026-11-15',
    submissionDeadline: '2026-11-08T18:00:00',
    status: 'open' as 'open' | 'closed',
    notes: ''
  });

  const selectedWeek = mealWeeks.find((w) => w.id === selectedWeekId) || mealWeeks[0];
  const isLocked = selectedWeek ? isMealWeekLocked(selectedWeek) : true;

  // Identify current student (if student role, or allow warden to view specific student)
  const isStudent = currentUser?.role === 'student';
  const defaultStudentId = isStudent
    ? currentUser.linkedStudentId || students[0]?.id
    : students[0]?.id;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudentId || '');
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Retrieve current student's submission for the selected week
  const studentSubmission = useMemo(() => {
    return mealSubmissions.find(
      (sub) => sub.mealWeekId === selectedWeek?.id && sub.studentId === activeStudent?.id
    );
  }, [mealSubmissions, selectedWeek, activeStudent]);

  // Default empty matrix
  const createDefaultMatrix = (): WeeklyMealChoices => ({
    monday: { breakfast: true, lunch: true, dinner: true },
    tuesday: { breakfast: true, lunch: true, dinner: true },
    wednesday: { breakfast: true, lunch: true, dinner: true },
    thursday: { breakfast: true, lunch: true, dinner: true },
    friday: { breakfast: true, lunch: true, dinner: true },
    saturday: { breakfast: true, lunch: true, dinner: true },
    sunday: { breakfast: true, lunch: true, dinner: true }
  });

  // Local state for 7x3 matrix choices
  const [choices, setChoices] = useState<WeeklyMealChoices>(() => {
    return studentSubmission ? studentSubmission.choices : createDefaultMatrix();
  });

  const [specialDietary, setSpecialDietary] = useState<string>(() => {
    return studentSubmission?.specialDietaryRemarks || '';
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Sync choices when selected week or student changes
  React.useEffect(() => {
    if (studentSubmission) {
      setChoices(studentSubmission.choices);
      setSpecialDietary(studentSubmission.specialDietaryRemarks || '');
    } else {
      setChoices(createDefaultMatrix());
      setSpecialDietary('');
    }
    setFeedbackMsg(null);
  }, [selectedWeekId, selectedStudentId, studentSubmission]);

  // Toggle individual meal checkbox
  const toggleMeal = (day: DayOfWeek, meal: MealType) => {
    if (isLocked) return;
    setChoices((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: !prev[day][meal]
      }
    }));
  };

  // Quick Action Helpers
  const handleSelectAll = () => {
    if (isLocked) return;
    setChoices(createDefaultMatrix());
  };

  const handleDeselectAll = () => {
    if (isLocked) return;
    const empty: WeeklyMealChoices = {
      monday: { breakfast: false, lunch: false, dinner: false },
      tuesday: { breakfast: false, lunch: false, dinner: false },
      wednesday: { breakfast: false, lunch: false, dinner: false },
      thursday: { breakfast: false, lunch: false, dinner: false },
      friday: { breakfast: false, lunch: false, dinner: false },
      saturday: { breakfast: false, lunch: false, dinner: false },
      sunday: { breakfast: false, lunch: false, dinner: false }
    };
    setChoices(empty);
  };

  const handleWeekdaysOnly = () => {
    if (isLocked) return;
    setChoices({
      monday: { breakfast: true, lunch: true, dinner: true },
      tuesday: { breakfast: true, lunch: true, dinner: true },
      wednesday: { breakfast: true, lunch: true, dinner: true },
      thursday: { breakfast: true, lunch: true, dinner: true },
      friday: { breakfast: true, lunch: true, dinner: true },
      saturday: { breakfast: false, lunch: false, dinner: false },
      sunday: { breakfast: false, lunch: false, dinner: false }
    });
  };

  // Save 7x3 matrix submission
  const handleSaveChoices = () => {
    if (!selectedWeek || !activeStudent) return;
    const res = saveMealSubmission(
      selectedWeek.id,
      activeStudent.id,
      activeStudent.indexNumber,
      choices,
      specialDietary
    );

    if (res.success) {
      setFeedbackMsg({ text: 'Weekly 7×3 Meal Selection saved successfully!' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to save', error: true });
    }
  };

  // Create Meal Week
  const handleCreateWeek = (e: React.FormEvent) => {
    e.preventDefault();
    addMealWeek(weekForm);
    setIsWeekModalOpen(false);
  };

  // Toggle Week Status (Open / Close manually)
  const handleToggleWeekStatus = (week: MealWeek) => {
    const nextStatus = week.status === 'open' ? 'closed' : 'open';
    updateMealWeek({ ...week, status: nextStatus });
  };

  // Calculate Daily Headcounts & Total Requirements
  const weekAnalytics = useMemo(() => {
    const submissionsForWeek = mealSubmissions.filter((s) => s.mealWeekId === selectedWeek?.id);
    const hostelResidents = students.filter((s) => s.isHostelResident);

    const counts: Record<DayOfWeek, { breakfast: number; lunch: number; dinner: number; total: number }> = {
      monday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      tuesday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      wednesday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      thursday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      friday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      saturday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 },
      sunday: { breakfast: 0, lunch: 0, dinner: 0, total: 0 }
    };

    submissionsForWeek.forEach((sub) => {
      DAYS_OF_WEEK.forEach(({ key }) => {
        if (sub.choices[key]?.breakfast) counts[key].breakfast++;
        if (sub.choices[key]?.lunch) counts[key].lunch++;
        if (sub.choices[key]?.dinner) counts[key].dinner++;
        counts[key].total = counts[key].breakfast + counts[key].lunch + counts[key].dinner;
      });
    });

    const chartData = DAYS_OF_WEEK.map(({ key, label }) => ({
      day: label.slice(0, 3),
      Breakfast: counts[key].breakfast,
      Lunch: counts[key].lunch,
      Dinner: counts[key].dinner
    }));

    const weeklyTotalMeals = DAYS_OF_WEEK.reduce((acc, { key }) => acc + counts[key].total, 0);

    // Projected Raw Material Predictions
    // Average 150g rice/meal, 200g vegetables/meal, 1 egg/protein unit/dinner & lunch
    const estRiceKg = Math.round((weeklyTotalMeals * 0.15) * 10) / 10;
    const estVegetablesKg = Math.round((weeklyTotalMeals * 0.2) * 10) / 10;
    const estEggsUnits = DAYS_OF_WEEK.reduce((acc, { key }) => acc + counts[key].lunch + counts[key].dinner, 0);

    return {
      submissionsCount: submissionsForWeek.length,
      totalHostelResidents: hostelResidents.length,
      counts,
      chartData,
      weeklyTotalMeals,
      estRiceKg,
      estVegetablesKg,
      estEggsUnits
    };
  }, [mealSubmissions, selectedWeek, students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Hostel Boarding & 7×3 Meal System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly 21-choice meal matrix (Breakfast, Lunch, Dinner Mon-Sun) with automatic deadline enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(currentUser?.role === 'hostel_warden' || currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setIsWeekModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} />
              <span>Open New Meal Week</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('print')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer size={16} />
            <span>Kitchen Duty Printouts</span>
          </button>
        </div>
      </div>

      {/* Week Selector Bar & Lock Status */}
      {selectedWeek && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isLocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isLocked ? <Lock size={22} /> : <Unlock size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{selectedWeek.title}</span>
                <Badge variant={isLocked ? 'red' : 'green'}>
                  {isLocked ? 'Submissions Locked' : 'Open for Submissions'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lock Deadline:{' '}
                <span className="font-mono font-semibold text-slate-700">
                  {formatDateTime(selectedWeek.submissionDeadline)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Select Active Week</span>
              <select
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                {mealWeeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {(currentUser?.role === 'hostel_warden' || currentUser?.role === 'super_admin') && (
              <button
                onClick={() => handleToggleWeekStatus(selectedWeek)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                  selectedWeek.status === 'open'
                    ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                    : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {selectedWeek.status === 'open' ? 'Close Schedule Now' : 'Re-open Schedule'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit no-print">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed size={14} />
          <span>7×3 Meal Selection Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp size={14} />
          <span>Kitchen Analytics & Predictions</span>
        </button>
        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'print' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer size={14} />
          <span>Kitchen Print Sheets</span>
        </button>
      </div>

      {/* Tab 1: 7x3 Meal Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Student Selector (If Admin/Warden viewing different students) */}
          {!isStudent && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800">Viewing Student Record:</span>
                <p className="text-[11px] text-slate-500">Hostel wardens can inspect or record meals on behalf of students</p>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.indexNumber} — {s.fullName} {s.isHostelResident ? '(Boarder)' : '(Day)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Action Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Meal Selection: {activeStudent?.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                Index: <span className="font-mono font-bold text-slate-700">{activeStudent?.indexNumber}</span> • Room: {activeStudent?.hostelRoomNumber || 'N/A'}
              </p>
            </div>

            {!isLocked && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-bold transition"
                >
                  Select All (21 Meals)
                </button>
                <button
                  type="button"
                  onClick={handleWeekdaysOnly}
                  className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg font-semibold transition"
                >
                  Weekdays Only (Mon-Fri)
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* 7x3 Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/70">
                  <th className="py-3 px-4 text-left">Day of the Week</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Coffee size={14} className="text-amber-600" />
                      <span>Breakfast (07:00 - 08:00)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Sun size={14} className="text-orange-500" />
                      <span>Lunch (12:00 - 13:30)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Moon size={14} className="text-indigo-600" />
                      <span>Dinner (19:30 - 20:45)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const dayChoices = choices[key] || { breakfast: false, lunch: false, dinner: false };
                  const isWeekend = key === 'saturday' || key === 'sunday';

                  return (
                    <tr
                      key={key}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isWeekend ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-left font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          {isWeekend && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                              Weekend
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Breakfast */}
                      <td className="py-3.5 px-4">
                        <label className={`inline-flex items-center justify-center p-2 rounded-xl transition ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-100'}`}>
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={dayChoices.breakfast}
                            onChange={() => toggleMeal(key, 'breakfast')}
                            className="w-5 h-5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>
                      </td>

                      {/* Lunch */}
                      <td className="py-3.5 px-4">
                        <label className={`inline-flex items-center justify-center p-2 rounded-xl transition ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-100'}`}>
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={dayChoices.lunch}
                            onChange={() => toggleMeal(key, 'lunch')}
                            className="w-5 h-5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>
                      </td>

                      {/* Dinner */}
                      <td className="py-3.5 px-4">
                        <label className={`inline-flex items-center justify-center p-2 rounded-xl transition ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-100'}`}>
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={dayChoices.dinner}
                            onChange={() => toggleMeal(key, 'dinner')}
                            className="w-5 h-5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dietary remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Dietary Remarks / Allergies
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={specialDietary}
              onChange={(e) => setSpecialDietary(e.target.value)}
              placeholder="e.g. Vegetarian on Wednesday; no spicy curry"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
            />
          </div>

          {/* Feedback Message */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                feedbackMsg.error
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-400">
              {isLocked
                ? 'Status: Locked (Read-Only)'
                : 'Selections auto-lock upon deadline passage'}
            </div>

            <button
              onClick={handleSaveChoices}
              disabled={isLocked}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              {isLocked ? 'Submissions Closed' : 'Save & Confirm Meal Choices'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Analytics & Predictions */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Total Meals</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {weekAnalytics.weeklyTotalMeals}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                From {weekAnalytics.submissionsCount} of {weekAnalytics.totalHostelResidents} Boarders
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Projected Raw Rice</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {weekAnalytics.estRiceKg} kg
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Calculated at 150g per head/meal</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Projected Vegetables</span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                {weekAnalytics.estVegetablesKg} kg
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Local DOA Farm harvest allocation</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Egg / Protein Units</span>
              <h3 className="text-2xl font-black text-blue-700 mt-1">
                {weekAnalytics.estEggsUnits} Units
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">For Lunch & Dinner requirements</p>
            </div>
          </div>

          {/* Daily Headcounts Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Daily Meal Headcount Breakdown ({selectedWeek?.title})
                </h3>
                <p className="text-xs text-slate-500">Breakfast vs Lunch vs Dinner per day</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekAnalytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Breakfast" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lunch" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dinner" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Printable Kitchen Sheet */}
      {activeTab === 'print' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-end no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Printer size={15} />
              <span>Print Official Kitchen Catering Sheet</span>
            </button>
          </div>

          <PrintHeader
            title={`Hostel Dining Hall Daily & Weekly Provision Summary — ${selectedWeek?.title}`}
            subtitle="Catering Department & Dining Hall Staff Operational Sheet"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">Day</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Breakfast</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Lunch</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Dinner</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Total Meals</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Rice Req (kg)</th>
                  <th className="py-2.5 px-3 text-center">Veg Req (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const c = weekAnalytics.counts[key];
                  const rice = (c.total * 0.15).toFixed(1);
                  const veg = (c.total * 0.2).toFixed(1);

                  return (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold border-r border-slate-200">{label}</td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">{c.breakfast}</td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">{c.lunch}</td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">{c.dinner}</td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200">{c.total}</td>
                      <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{rice}</td>
                      <td className="py-2 px-3 text-center font-mono">{veg}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 font-bold">
                  <td className="py-2.5 px-3 border-r border-slate-300">Weekly Total</td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300">
                    {DAYS_OF_WEEK.reduce((acc, { key }) => acc + weekAnalytics.counts[key].breakfast, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300">
                    {DAYS_OF_WEEK.reduce((acc, { key }) => acc + weekAnalytics.counts[key].lunch, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300">
                    {DAYS_OF_WEEK.reduce((acc, { key }) => acc + weekAnalytics.counts[key].dinner, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300">
                    {weekAnalytics.weeklyTotalMeals}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300">
                    {weekAnalytics.estRiceKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {weekAnalytics.estVegetablesKg} kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Hostel Warden / Matron</p>
              <p className="text-[10px] text-slate-500">SOA Angunakolapelessa</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Chief Catering Officer</p>
              <p className="text-[10px] text-slate-500">Dining Hall & Kitchen</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Administrative Officer</p>
              <p className="text-[10px] text-slate-500">Department of Agriculture</p>
            </div>
          </div>
        </div>
      )}

      {/* Open New Meal Week Modal */}
      <Modal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        title="Schedule New Weekly Meal Period"
        subtitle="Hostel Dining Administration"
      >
        <form onSubmit={handleCreateWeek} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Week Number</label>
              <input
                type="number"
                min={1}
                max={52}
                required
                value={weekForm.weekNumber}
                onChange={(e) => setWeekForm({ ...weekForm, weekNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={weekForm.status}
                onChange={(e) => setWeekForm({ ...weekForm, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold"
              >
                <option value="open">Open for Submissions</option>
                <option value="closed">Locked / Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Title</label>
            <input
              type="text"
              required
              value={weekForm.title}
              onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
              placeholder="e.g. Week 46 (Nov 09 - Nov 15, 2026)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date (Monday)</label>
              <input
                type="date"
                required
                value={weekForm.startDate}
                onChange={(e) => setWeekForm({ ...weekForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Sunday)</label>
              <input
                type="date"
                required
                value={weekForm.endDate}
                onChange={(e) => setWeekForm({ ...weekForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Lock Deadline (Date & Time)
            </label>
            <input
              type="datetime-local"
              required
              value={weekForm.submissionDeadline}
              onChange={(e) => setWeekForm({ ...weekForm, submissionDeadline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWeekModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Open Week Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
