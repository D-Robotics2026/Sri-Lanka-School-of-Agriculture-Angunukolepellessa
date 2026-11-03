import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToFirebase, MAX_IMAGE_SIZE_BYTES } from '../../firebase/storageService';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'students' | 'lecturers' | 'users' | 'books' | 'general';
  label?: string;
  shape?: 'circle' | 'square' | 'book';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'general',
  label = 'Profile / Cover Photo',
  shape = 'circle'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset feedback
    setErrorMsg(null);
    setSuccessNotice(false);

    // Validate size limit (1MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`File size exceeds 1MB (${sizeMb}MB). Please upload an image under 1MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImageToFirebase(file, folder);
      if (result.success && result.url) {
        onChange(result.url);
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 3000);
      } else {
        setErrorMsg(result.error || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'w-20 h-20 rounded-full';
      case 'book':
        return 'w-16 h-22 rounded-xl';
      case 'square':
      default:
        return 'w-20 h-20 rounded-2xl';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
        {/* Image Preview Container */}
        <div className={`relative shrink-0 overflow-hidden bg-white border border-slate-200 shadow-2xs ${getShapeClasses()} flex items-center justify-center`}>
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-7 h-7 text-slate-300" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls & Guidelines */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Upload size={13} />
              <span>{value ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                title="Remove photo"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-1.5">
            Max <strong className="text-slate-600">1MB</strong> • JPG, PNG, WebP • Firebase Storage
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-medium flex items-center gap-1.5 animate-fade-in">
          <AlertCircle size={14} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Notice */}
      {successNotice && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 animate-fade-in">
          <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
          <span>Photo successfully uploaded to Firebase Storage!</span>
        </div>
      )}
    </div>
  );
};
