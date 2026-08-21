import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { KPICard } from '@/components/admin/KPICard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { Users, UserPlus, FileText, Package, DollarSign, Eye } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Route = createFileRoute('/admin/dashboard')({
  component: DashboardPage,
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function DashboardPage() {
  // Fetch KPI data
  const { data: kpiData } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const [customers, leads, quotes, shipments, blogPosts] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('quotes').select('id, status', { count: 'exact' }).eq('status', 'submitted'),
        supabase.from('shipments').select('id', { count: 'exact', head: true }).eq('status', 'in_transit'),
        supabase.from('blog_posts').select('view_count'),
      ]);

      const totalBlogViews = blogPosts.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

      return {
        totalCustomers: customers.count || 0,
        activeLeads: leads.count || 0,
        pendingQuotes: quotes.count || 0,
        shipmentsInTransit: shipments.count || 0,
        blogViews: totalBlogViews,
      };
    },
  });

  // Fetch monthly leads data
  const { data: leadsData } = useQuery({
    queryKey: ['dashboard-leads-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, { month: string; leads: number; converted: number }> = {};
      
      data.forEach((lead) => {
        const month = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, leads: 0, converted: 0 };
        }
        monthlyData[month].leads++;
        if (lead.status === 'won') {
          monthlyData[month].converted++;
        }
      });

      return Object.values(monthlyData);
    },
  });

  // Fetch shipment status distribution
  const { data: shipmentStatusData } = useQuery({
    queryKey: ['dashboard-shipment-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('status');

      if (error) throw error;

      const statusCount: Record<string, number> = {};
      data.forEach((shipment) => {
        const status = shipment.status.replace('_', ' ');
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    },
  });

  // Fetch revenue trend (mock data for now)
  const revenueTrendData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 58000 },
    { month: 'Jun', revenue: 70000 },
  ];

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'sales_agent', 'logistics_officer', 'content_manager']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <KPICard
              title="Total Customers"
              value={kpiData?.totalCustomers || 0}
              change={{ value: 12, trend: 'up' }}
              icon={Users}
              iconColor="text-blue-600"
            />
            <KPICard
              title="Active Leads"
              value={kpiData?.activeLeads || 0}
              change={{ value: 8, trend: 'up' }}
              icon={UserPlus}
              iconColor="text-green-600"
            />
            <KPICard
              title="Quotes Pending"
              value={kpiData?.pendingQuotes || 0}
              change={{ value: 3, trend: 'down' }}
              icon={FileText}
              iconColor="text-yellow-600"
            />
            <KPICard
              title="In Transit"
              value={kpiData?.shipmentsInTransit || 0}
              icon={Package}
              iconColor="text-purple-600"
            />
            <KPICard
              title="Blog Views"
              value={kpiData?.blogViews || 0}
              change={{ value: 24, trend: 'up' }}
              icon={Eye}
              iconColor="text-indigo-600"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Leads */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Leads</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Total Leads" />
                  <Bar dataKey="converted" fill="#10b981" name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `ZMW ${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Revenue (ZMW)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Shipment Status Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Shipment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shipmentStatusData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(shipmentStatusData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Feed */}
            <ActivityFeed />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
