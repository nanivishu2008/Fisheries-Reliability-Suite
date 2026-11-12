import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Trash2 } from 'lucide-react';

export const FileUpload = ({
  onFileSelect,
  accept = 'image/*,.pdf,.doc,.docx',
  maxSizeMB = 10,
  label = 'Upload Evidence / Service Photos',
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer bg-slate-50/50"
      >
        <UploadCloud className="w-8 h-8 text-teal-600 mb-2" />
        <p className="text-xs font-semibold text-slate-700">Click to browse or drag file here</p>
        <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF up to {maxSizeMB}MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs">
          <div className="flex items-center space-x-2 truncate">
            <FileText className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="font-semibold text-teal-900 truncate">{selectedFile.name}</span>
            <span className="text-teal-600">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-teal-100 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-800"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => onMarkAsRead && onMarkAsRead(item._id)}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                !item.isRead ? 'bg-teal-50/40' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-800">{item.title}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-600 mt-1 line-clamp-2">{item.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-teal-700 hover:text-teal-900"
        >
          View All Notifications &rarr;
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
