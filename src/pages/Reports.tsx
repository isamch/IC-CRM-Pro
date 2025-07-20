import React from 'react';
import { Card } from '../components/ui/Card';
import { CanView } from '../components/auth/PermissionGuard';

export const Reports: React.FC = () => {
  return (
    <CanView permission="reports">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            التقارير
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وتحليل البيانات والإحصائيات
          </p>
        </div>

        <Card className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            صفحة التقارير قيد التطوير
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            سيتم إضافة التقارير والإحصائيات قريباً
          </p>
        </Card>
      </div>
    </CanView>
  );
}; 