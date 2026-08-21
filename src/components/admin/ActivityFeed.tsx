import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  UserPlus,
  FileText,
  Package,
  FileBox,
  BookOpen,
  Settings as SettingsIcon,
} from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
  user: {
    full_name: string | null;
    email: string;
  } | null;
}

const actionIcons: Record<string, any> = {
  customer: Users,
  lead: UserPlus,
  quote: FileText,
  shipment: Package,
  document: FileBox,
  blog_post: BookOpen,
  settings: SettingsIcon,
};

const actionColors: Record<string, string> = {
  created: 'text-green-600',
  updated: 'text-blue-600',
  deleted: 'text-red-600',
  sent: 'text-purple-600',
  approved: 'text-green-600',
  rejected: 'text-red-600',
};

function getActionIcon(entityType: string | null) {
  if (!entityType) return Users;
  return actionIcons[entityType] || Users;
}

function getActionColor(action: string) {
  const actionType = action.split('.')[1];
  return actionColors[actionType] || 'text-gray-600';
}

function formatAction(action: string, details: any) {
  const parts = action.split('.');
  const entity = parts[0]?.replace('_', ' ');
  const actionType = parts[1]?.replace('_', ' ');
  return `${actionType} ${entity}`;
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          details,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data.map((item) => ({
        ...item,
        user: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
      })) as Activity[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = getActionIcon(activity.entity_type);
            const color = getActionColor(activity.action);

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.user?.full_name || activity.user?.email || 'Unknown user'}
                    </span>{' '}
                    {formatAction(activity.action, activity.details)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}
