import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-100 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
