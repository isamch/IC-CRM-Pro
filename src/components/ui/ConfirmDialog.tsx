import React, { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (password?: string) => void;
  onCancel: () => void;
  requirePassword?: boolean;
  errorMessage?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'تأكيد العملية',
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  requirePassword = false,
  errorMessage = '',
}) => {
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (!isOpen) setPassword('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm mx-2">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">{title}</h3>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">{message}</p>
        {requirePassword && (
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور للتأكيد"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errorMessage && <div className="text-red-500 text-xs mt-2 text-center">{errorMessage}</div>}
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(requirePassword ? password : undefined)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={requirePassword && !password}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 