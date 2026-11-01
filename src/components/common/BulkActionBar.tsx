import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  onDeleteSelected: () => void;
  entityName?: string;
  isAllSelected?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onDeleteSelected,
  entityName = 'items',
  isAllSelected = false
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-2 z-20 mb-4 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-fade-up">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-200">
          {selectedCount} of {totalCount} {entityName} selected
        </span>
        {onSelectAll && !isAllSelected && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
          >
            Select All ({totalCount})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1"
        >
          <X size={14} />
          <span>Clear</span>
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition flex items-center gap-1.5 active:scale-95"
        >
          <Trash2 size={14} />
          <span>Delete Selected ({selectedCount})</span>
        </button>
      </div>
    </div>
  );
};
