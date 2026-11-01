import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  columns: ColumnDefinition[];
  sampleData: Record<string, any>[];
  onImport: (items: any[]) => Promise<void> | void;
  entityName?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  columns,
  sampleData,
  onImport,
  entityName = 'Records'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download sample CSV template
  const handleDownloadSample = () => {
    const headerLine = columns.map((c) => `"${c.label}"`).join(',');
    const sampleLines = sampleData.map((row) =>
      columns.map((c) => `"${(row[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headerLine, ...sampleLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityName.toLowerCase().replace(/\s+/g, '_')}_import_template.csv`;
    link.click();
  };

  // Parse CSV text into records
  const parseCsvText = (text: string) => {
    try {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length < 2) {
        setErrorMsg('CSV must contain at least a header line and one data row.');
        setParsedRows([]);
        return;
      }

      // Simple CSV line parser respecting quotes
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const rawHeaders = parseLine(lines[0]);
      // Match raw headers to column keys (case-insensitive)
      const headerMap: { index: number; key: string }[] = [];
      rawHeaders.forEach((h, idx) => {
        const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        const col = columns.find(
          (c) =>
            c.label.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanH ||
            c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanH
        );
        if (col) {
          headerMap.push({ index: idx, key: col.key });
        }
      });

      if (headerMap.length === 0) {
        setErrorMsg('Could not match any columns. Please download and check the template format.');
        setParsedRows([]);
        return;
      }

      const rows: Record<string, any>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseLine(lines[i]);
        if (vals.length === 0 || (vals.length === 1 && vals[0] === '')) continue;
        const rowObj: Record<string, any> = {};
        headerMap.forEach(({ index, key }) => {
          rowObj[key] = vals[index] ?? '';
        });
        rows.push(rowObj);
      }

      if (rows.length === 0) {
        setErrorMsg('No valid data rows found.');
        setParsedRows([]);
        return;
      }

      setErrorMsg(null);
      setParsedRows(rows);
    } catch (e: any) {
      setErrorMsg(`Parsing failed: ${e.message}`);
      setParsedRows([]);
    }
  };

  // Parse JSON text into records
  const parseJsonText = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (rows.length === 0) {
        setErrorMsg('JSON array is empty.');
        setParsedRows([]);
        return;
      }
      setErrorMsg(null);
      setParsedRows(rows);
    } catch (e: any) {
      setErrorMsg(`Invalid JSON format: ${e.message}`);
      setParsedRows([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      if (file.name.endsWith('.json')) {
        parseJsonText(content);
      } else {
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsedRows([]);
      setErrorMsg(null);
      return;
    }
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
      parseJsonText(text);
    } else {
      parseCsvText(text);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(parsedRows);
      setParsedRows([]);
      setRawText('');
      setErrorMsg(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetModal = () => {
    setParsedRows([]);
    setRawText('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={title}
      subtitle={subtitle || `Upload CSV or paste entries to bulk-import into the system`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Template download header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Standard Import Template</p>
              <p className="text-[11px] text-slate-500">Download formatted CSV with expected columns and sample values</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <Download size={13} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={13} />
            <span>Upload File (.csv / .json)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'paste' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={13} />
            <span>Paste CSV / Text</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Click to browse or drag file here</p>
              <p className="text-[11px] text-slate-400 mt-1">Accepts CSV (.csv) or JSON (.json) files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="Paste comma-separated rows or JSON array here..."
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Ready to Import: {parsedRows.length} {entityName}
              </span>
              <span className="text-slate-400 text-[11px]">Showing first {Math.min(5, parsedRows.length)} rows</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">#</th>
                    {columns.slice(0, 5).map((col) => (
                      <th key={col.key} className="py-2 px-2.5">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      {columns.slice(0, 5).map((col) => (
                        <td key={col.key} className="py-1.5 px-2.5 truncate max-w-[140px]">
                          {(row[col.key] ?? '').toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleResetModal}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleExecuteImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>{isImporting ? 'Importing...' : `Import ${parsedRows.length} ${entityName}`}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
