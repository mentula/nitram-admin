import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isSupabaseConnected } from '@/lib/supabase';

export function PlaceholderBanner() {
  if (isSupabaseConnected) return null;

  return (
    <Alert className="border-orange-500 bg-orange-50 mb-4">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-900">
        <strong>🎭 Demo Mode Active:</strong> You're viewing the UI with placeholder data. 
        All features are visible but database operations won't work. 
        To enable full functionality, add your Supabase credentials to <code className="bg-orange-100 px-1 rounded">.env.local</code> and restart the server.
      </AlertDescription>
    </Alert>
  );
}
