import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../ui/Button';

export const UnauthorizedPage: React.FC<{ message?: string }> = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-6">
        <Lock className="w-10 h-10 text-red-500 dark:text-red-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">غير مصرح لك بعرض هذه الصفحة</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message || 'ليس لديك الصلاحية للوصول إلى هذا المحتوى. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الإدارة.'}</p>
      <Button onClick={() => navigate('/dashboard')}>العودة للوحة التحكم</Button>
    </div>
  );
}; 