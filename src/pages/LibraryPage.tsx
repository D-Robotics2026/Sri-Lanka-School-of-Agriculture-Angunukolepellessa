import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Book, BorrowRecord, BookReservation } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import {
  Library,
  BookOpen,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  Coins,
  Bookmark,
  Edit2,
  Trash2,
  Barcode
} from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    borrowRecords,
    issueBook,
    returnBook,
    payFine,
    waiveFine,
    bookReservations,
    reserveBook,
    cancelReservation,
    fulfillReservation,
    fineSettings,
    students
  } = useData();

  const [activeTab, setActiveTab] = useState<'inventory' | 'circulation' | 'reservations'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Book Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    category: 'Agronomy',
    publicationYear: 2022,
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Shelf AGR-01-A'
  });

  // Issue Book Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueBookId, setIssueBookId] = useState('');
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueError, setIssueError] = useState<string | null>(null);

  // Reserve Book Modal
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveBookId, setReserveBookId] = useState('');
  const [reserveStudentId, setReserveStudentId] = useState('');
  const [reserveError, setReserveError] = useState<string | null>(null);

  // KPI calculations
  const totalBooksCount = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalTitlesCount = books.length;
  const activeBorrows = borrowRecords.filter((r) => r.status === 'borrowed' || r.status === 'overdue').length;
  const overdueBorrows = borrowRecords.filter((r) => r.status === 'overdue').length;
  const totalFinesPending = borrowRecords
    .filter((r) => r.fineStatus === 'pending')
    .reduce((sum, r) => sum + r.fineAmount, 0);
  const totalFinesPaid = borrowRecords
    .filter((r) => r.fineStatus === 'paid')
    .reduce((sum, r) => sum + r.fineAmount, 0);

  const categories = Array.from(new Set(books.map((b) => b.category)));

  // Open add book
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      isbn: '978-955-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10 + Math.random() * 90),
      title: '',
      author: '',
      category: 'Agronomy',
      publicationYear: 2023,
      totalCopies: 5,
      availableCopies: 5,
      shelfLocation: 'Shelf AGR-02-B'
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setBookForm({
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      category: b.category,
      publicationYear: b.publicationYear,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      shelfLocation: b.shelfLocation
    });
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateBook({
        ...editingBook,
        ...bookForm
      });
    } else {
      addBook(bookForm);
    }
    setIsBookModalOpen(false);
  };

  // Handle Book Issue
  const handleOpenIssue = (bookId?: string) => {
    setIssueError(null);
    setIssueBookId(bookId || books[0]?.id || '');
    setIssueStudentId(students[0]?.id || '');
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError(null);
    const stu = students.find((s) => s.id === issueStudentId);
    if (!stu) return;

    const res = issueBook(issueBookId, stu.id, stu.indexNumber);
    if (!res.success) {
      setIssueError(res.error || 'Failed to issue book');
      return;
    }
    setIsIssueModalOpen(false);
  };

  // Handle Book Return
  const handleReturn = (recordId: string) => {
    const res = returnBook(recordId);
    if (res.success && res.fineAmount > 0) {
      alert(`Book returned! An overdue fine of LKR ${res.fineAmount}.00 has been added.`);
    }
  };

  // Handle Book Reservation
  const handleOpenReserve = (bookId?: string) => {
    setReserveError(null);
    setReserveBookId(bookId || books[0]?.id || '');
    setReserveStudentId(students[0]?.id || '');
    setIsReserveModalOpen(true);
  };

  const handleConfirmReserve = (e: React.FormEvent) => {
    e.preventDefault();
    setReserveError(null);
    const stu = students.find((s) => s.id === reserveStudentId);
    if (!stu) return;

    const res = reserveBook(reserveBookId, stu.id, stu.indexNumber);
    if (!res.success) {
      setReserveError(res.error || 'Failed to reserve book');
      return;
    }
    setIsReserveModalOpen(false);
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);
    const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Library & Circulation Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated borrowing, return tracking, and daily overdue fine computation (LKR {fineSettings.dailyRateLkr}/day)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenIssue()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <ArrowUpRight size={16} />
            <span>Issue Book</span>
          </button>
          <button
            onClick={handleOpenAddBook}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} />
            <span>New Book Title</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory"
          value={`${totalBooksCount} Copies`}
          subtitle={`${totalTitlesCount} Agriculture Titles`}
          icon={Library}
          color="emerald"
        />
        <StatCard
          title="Active Borrowings"
          value={activeBorrows}
          subtitle={`${books.reduce((s, b) => s + b.availableCopies, 0)} available on shelves`}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Overdue Books"
          value={overdueBorrows}
          subtitle={overdueBorrows > 0 ? 'Requires student follow-up' : 'All returns up to date'}
          icon={AlertTriangle}
          color={overdueBorrows > 0 ? 'rose' : 'slate'}
        />
        <StatCard
          title="Fine Collections"
          value={`LKR ${totalFinesPending}`}
          subtitle={`Collected: LKR ${totalFinesPaid} • Rate: LKR ${fineSettings.dailyRateLkr}/day`}
          icon={Coins}
          color="amber"
        />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Library size={14} />
            <span>Book Catalogue ({books.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('circulation')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'circulation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>Circulation & Fines ({borrowRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark size={14} />
            <span>Reservations Queue ({bookReservations.filter((r) => r.status === 'active').length})</span>
          </button>
        </div>

        {activeTab === 'inventory' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Book Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Shelf Location</th>
                  <th className="py-3 px-4 text-center">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.author} ({b.publicationYear})
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{b.isbn}</td>

                    <td className="py-3 px-4">
                      <Badge variant="blue" size="sm">
                        {b.category}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {b.shelfLocation}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                          b.availableCopies > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {b.availableCopies} of {b.totalCopies} Available
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenIssue(b.id)}
                          disabled={b.availableCopies <= 0}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 rounded-lg text-xs font-bold transition"
                        >
                          Issue
                        </button>
                        <button
                          onClick={() => handleOpenReserve(b.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          Reserve
                        </button>
                        <button
                          onClick={() => handleOpenEditBook(b)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Circulation & Fines Table */}
      {activeTab === 'circulation' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Student Candidate</th>
                  <th className="py-3 px-4">Issue & Due Date</th>
                  <th className="py-3 px-4">Circulation Status</th>
                  <th className="py-3 px-4">Fine Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowRecords.map((rec) => {
                  const bk = books.find((b) => b.id === rec.bookId);
                  const stu = students.find((s) => s.id === rec.studentId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bk?.title || 'Book Title'}</div>
                        <div className="text-[11px] font-mono text-slate-400">{bk?.isbn}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{stu?.fullName || rec.studentIndex}</div>
                        <div className="text-[11px] font-mono text-slate-400">{rec.studentIndex}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div>Issue: <span className="font-medium text-slate-700">{rec.issueDate}</span></div>
                        <div>Due: <span className="font-bold text-slate-900">{rec.dueDate}</span></div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            rec.status === 'returned'
                              ? 'green'
                              : rec.status === 'overdue'
                              ? 'red'
                              : 'blue'
                          }
                        >
                          {rec.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        {rec.fineAmount > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-rose-600">
                              LKR {rec.fineAmount}.00
                            </span>
                            <span className="ml-1 text-[10px] uppercase font-bold text-slate-400">
                              ({rec.fineStatus})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">None (0.00)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status !== 'returned' && (
                            <button
                              onClick={() => handleReturn(rec.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                            >
                              Return Book
                            </button>
                          )}
                          {rec.fineAmount > 0 && rec.fineStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => payFine(rec.id)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
                              >
                                Collect Fine
                              </button>
                              <button
                                onClick={() => waiveFine(rec.id)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition"
                              >
                                Waive
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reservations Queue */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reserved Date</th>
                  <th className="py-3 px-4">Queue Position</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookReservations.map((res) => {
                  const bk = books.find((b) => b.id === res.bookId);
                  const stu = students.find((s) => s.id === res.studentId);

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{bk?.title}</td>
                      <td className="py-3 px-4">
                        <div>{stu?.fullName}</div>
                        <span className="font-mono text-slate-400">{res.studentIndex}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{res.reservedDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">#{res.queuePosition}</td>
                      <td className="py-3 px-4">
                        <Badge variant={res.status === 'active' ? 'amber' : 'green'}>
                          {res.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {res.status === 'active' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => fulfillReservation(res.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold transition"
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => cancelReservation(res.id)}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Create/Edit Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={editingBook ? 'Edit Book Catalogue Item' : 'Add New Agricultural Text'}
        subtitle="Department of Agriculture Central Library Repository"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Number</label>
              <input
                type="text"
                required
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                placeholder="978-955-..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                placeholder="e.g. Agronomy, Soil Science"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title</label>
            <input
              type="text"
              required
              value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              placeholder="e.g. Paddy Cultivation in Sri Lanka: Principles & Modern Agronomy"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Author(s)</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder="Author name or Department"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Year</label>
              <input
                type="number"
                min={1970}
                max={2030}
                required
                value={bookForm.publicationYear}
                onChange={(e) => setBookForm({ ...bookForm, publicationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies</label>
              <input
                type="number"
                min={1}
                required
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available Copies</label>
              <input
                type="number"
                min={0}
                max={bookForm.totalCopies}
                required
                value={bookForm.availableCopies}
                onChange={(e) => setBookForm({ ...bookForm, availableCopies: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
              <input
                type="text"
                required
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                placeholder="Shelf AGR-01-A"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Save Book
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Student"
        subtitle="Automatic copy decrement & due date schedule (14 days)"
      >
        <form onSubmit={handleConfirmIssue} className="space-y-4">
          {issueError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {issueError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Book</label>
            <select
              value={issueBookId}
              onChange={(e) => setIssueBookId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student (Index Number / Barcode)
            </label>
            <select
              value={issueStudentId}
              onChange={(e) => setIssueStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.indexNumber} — {s.fullName} ({s.barcode})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Borrowing Period:</span>
              <span className="font-bold text-slate-800">{fineSettings.maxBorrowDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue Fine Rate:</span>
              <span className="font-bold text-slate-800">LKR {fineSettings.dailyRateLkr}.00 / Day</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Confirm Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* Reserve Book Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="Reserve Book"
        subtitle="Queue entry for student reservation"
      >
        <form onSubmit={handleConfirmReserve} className="space-y-4">
          {reserveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {reserveError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Book</label>
            <select
              value={reserveBookId}
              onChange={(e) => setReserveBookId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
            <select
              value={reserveStudentId}
              onChange={(e) => setReserveStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.indexNumber} — {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Place Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
