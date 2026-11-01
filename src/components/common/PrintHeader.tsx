import React from 'react';
import { formatDate } from '../../utils/dateUtils';

interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  referenceNumber?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  title,
  subtitle,
  referenceNumber
}) => {
  const currentDate = formatDate(new Date());

  return (
    <div className="mb-6 border-b-2 border-slate-900 pb-4 text-center">
      <div className="flex items-center justify-between mb-2">
        <div className="text-left text-[11px] font-mono text-slate-600">
          <div>Ref: {referenceNumber || 'SOA/AKP/GEN/' + new Date().getFullYear()}</div>
          <div>Date: {currentDate}</div>
        </div>
        <div className="text-center flex-1 px-4">
          <p className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">
            Department of Agriculture, Sri Lanka
          </p>
          <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
            School of Agriculture — Angunakolapelessa
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Academic & Administrative Management System (National NVQ Level 5 & 6)
          </p>
        </div>
        <div className="text-right text-[11px] font-mono text-slate-600">
          <div className="px-2 py-0.5 border border-slate-300 rounded font-bold uppercase">
            Official Record
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-slate-600 italic mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
