import React, { useState } from 'react';
import { Copy, Check, Barcode as BarcodeIcon } from 'lucide-react';

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  height?: number;
  showText?: boolean;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  label,
  height = 48,
  showText = true
}) => {
  const [copied, setCopied] = useState(false);

  // Generate stylized barcode bars derived from string characters
  const generateBars = (code: string) => {
    const bars: { width: number; isBlack: boolean }[] = [];
    // Start quiet zone & guard
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const b1 = (charCode % 3) + 1;
      const b2 = ((charCode * 2) % 3) + 1;
      const b3 = ((charCode * 3) % 4) + 1;
      const b4 = ((charCode * 5) % 2) + 1;

      bars.push({ width: b1, isBlack: false });
      bars.push({ width: b2, isBlack: true });
      bars.push({ width: b3, isBlack: false });
      bars.push({ width: b4, isBlack: true });
    }

    // End guard
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    return bars;
  };

  const bars = generateBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      {label && <span className="text-[11px] font-semibold text-slate-500 mb-1">{label}</span>}
      <div className="relative group cursor-pointer" onClick={handleCopy} title="Click to copy barcode value">
        <svg
          viewBox={`0 0 ${totalWidth} 40`}
          className="h-10 w-auto"
          preserveAspectRatio="none"
          style={{ height: `${height}px` }}
        >
          {bars.reduce<{ elements: React.ReactNode[]; currentX: number }>(
            (acc, bar, index) => {
              if (bar.isBlack) {
                acc.elements.push(
                  <rect
                    key={index}
                    x={acc.currentX}
                    y={0}
                    width={bar.width}
                    height={40}
                    fill="#1e293b"
                  />
                );
              }
              acc.currentX += bar.width;
              return acc;
            },
            { elements: [], currentX: 0 }
          ).elements}
        </svg>

        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
          <div className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
            {copied ? <Check size={10} /> : <Copy size={10} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </div>
        </div>
      </div>
      {showText && (
        <div className="flex items-center gap-1.5 mt-1 font-mono text-xs tracking-widest text-slate-700 font-bold">
          <BarcodeIcon size={12} className="text-slate-400" />
          <span>{value}</span>
        </div>
      )}
    </div>
  );
};
