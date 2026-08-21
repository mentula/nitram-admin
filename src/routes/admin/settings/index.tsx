import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CompanyProfileSettings } from '@/components/admin/settings/CompanyProfileSettings';
import { UserManagement } from '@/components/admin/settings/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  Settings as SettingsIcon,
  Users,
  FileText,
} from 'lucide-react';

export const Route = createFileRoute('/admin/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your application settings and configurations
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList>
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="h-4 w-4" />
                Company Profile
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                System Settings
              </TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </TabsTrigger>
              )}
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" />
                Website Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <CompanyProfileSettings />
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">System Settings</h3>
                  <p className="text-muted-foreground mt-2">
                    System configuration features coming soon
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Email templates, notifications, and system defaults will be available here
                  </p>
                </div>
              </div>
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="users">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <UserManagement />
                </div>
              </TabsContent>
            )}

            <TabsContent value="content">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">Website Content</h3>
                  <p className="text-muted-foreground mt-2">
                    Website content management coming soon
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage FAQs, testimonials, process steps, and other website content
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
