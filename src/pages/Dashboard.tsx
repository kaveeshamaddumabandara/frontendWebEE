import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { QuickActionsMenu } from '../components/QuickActionsMenu';
import { Users, Activity, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

export function AdminDashboard({ userName = 'Admin User', profileImage, onNavigateToUserManagement, onNavigateToPendingRequests, onNavigateToFeedback, onNavigateToPayments, onLogout, onHome }: AdminDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [platformActivity, setPlatformActivity] = useState<any[]>([]);
  const [userDistribution, setUserDistribution] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [
        statsRes,
        growthRes,
        distributionRes,
        activityRes,
        revenueRes,
        activitiesRes,
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getUserGrowth(),
        dashboardAPI.getUserDistribution(),
        dashboardAPI.getPlatformActivity(),
        dashboardAPI.getRevenueTrends(),
        dashboardAPI.getRecentActivities(),
      ]);

      setStats(statsRes.data.data);
      setUserGrowth(growthRes.data.data);
      setUserDistribution(distributionRes.data.data);
      setPlatformActivity(activityRes.data.data);
      setRevenueData(revenueRes.data.data);
      setRecentActivities(activitiesRes.data.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' LKR';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar userType="admin" userName={user?.name || userName} profileImage={user?.profileImage || profileImage} showAuth={true} onLogout={onLogout} onHome={onHome} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Menu Component - Above Header */}
        <div className="mb-8">
          <QuickActionsMenu
            onNavigateToUserManagement={onNavigateToUserManagement}
            onNavigateToPendingRequests={onNavigateToPendingRequests}
            onNavigateToFeedback={onNavigateToFeedback}
            onNavigateToPayments={onNavigateToPayments}
          />
        </div>

        {/* Header with Page Title */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-800">Total Users</p>
              
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalUsers || 0}</h3>
            
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-purple-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-800">Caregivers</p>
              
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.caregivers || 0}</h3>
            <p className="text-sm text-gray-600">Active Caregivers</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-800">Appointments</p>
              
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.appointmentsThisWeek || 0}</h3>
            <p className="text-sm text-gray-600">Appointments This Week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-yellow-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-800">Revenue</p>
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats?.revenueThisMonth || 0)}
            </h3>
            <p className="text-sm text-gray-500 mb-2">Platform Revenue This Month</p>
            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Registration Fees
                </span>
                <span className="font-semibold text-gray-700">
                  {formatCurrency(stats?.registrationFeeRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Booking Flat Fees
                </span>
                <span className="font-semibold text-gray-700">
                  {formatCurrency(stats?.flatFeeRevenue || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              User Growth (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="careReceivers" stroke="#3B82F6" strokeWidth={2} name="Care Receivers" />
                <Line type="monotone" dataKey="caregivers" stroke="#8B5CF6" strokeWidth={2} name="Caregivers" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              User Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Activity */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Weekly Platform Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#3B82F6" name="Appointments" />
                <Bar dataKey="completedCare" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Platform Revenue Trends
            </h3>
            <p className="text-xs text-gray-400 mb-4">Registration fees + booking flat fees (LKR)</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip
                  formatter={(value: number | undefined, name: string | undefined) => [
                    `${new Intl.NumberFormat('en-US').format(value ?? 0)} LKR`,
                    name ?? '',
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="registrationFee"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  name="Registration Fees"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="flatFee"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  name="Booking Flat Fees"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Platform Activity
            </h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivities
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'urgent' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     activity.status === 'urgent' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                     <Clock className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'urgent' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status === 'completed' ? 'Completed' :
                     activity.status === 'urgent' ? 'Urgent' :
                     'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {recentActivities.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, recentActivities.length)} of {recentActivities.length} activities
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(recentActivities.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(recentActivities.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(recentActivities.length / itemsPerPage)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}