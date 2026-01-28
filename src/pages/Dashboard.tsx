import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Users, UserCheck, Activity, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock, Menu, UserCog, ClipboardList, FileText, Settings, MessageSquare, Banknote } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigateToProfile: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

export function AdminDashboard({ userName = 'Admin User', profileImage, onNavigateToProfile, onNavigateToUserManagement, onNavigateToPendingRequests, onNavigateToFeedback, onNavigateToPayments, onLogout, onHome }: AdminDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-teal-50">
      <NavigationBar userType="admin" userName={user?.name || userName} profileImage={user?.profileImage || profileImage} showAuth={true} onLogout={onLogout} onHome={onHome} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Quick Actions Menu */}
        <div className="mb-6 relative">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and analytics</p>
          
          {/* Quick Actions Menu Icon */}
          <div className="absolute top-0 right-0">
            <button 
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Quick Actions Menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
            {quickActionsOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                <button 
                  onClick={() => { onNavigateToProfile(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <UserCog className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">View My Profile</span>
                </button>
                <button 
                  onClick={() => { onNavigateToUserManagement?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Manage Users</span>
                </button>
                <button 
                  onClick={() => { onNavigateToPendingRequests?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Pending Requests</span>
                </button>
                <button 
                  onClick={() => { onNavigateToFeedback?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">User Feedback</span>
                </button>
                <button 
                  onClick={() => { onNavigateToPayments?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Payment Management</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">+{stats?.userGrowthPercentage || 0}%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalUsers || 0}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-purple-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600">{stats?.activeCaregivers || 0} Active</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.caregivers || 0}</h3>
            <p className="text-sm text-gray-600">Active Caregivers</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">+{stats?.appointmentGrowth || 0}%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.appointmentsThisWeek || 0}</h3>
            <p className="text-sm text-gray-600">Appointments This Week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-yellow-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">+{stats?.revenueGrowth || 0}%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats?.revenueThisMonth || 0)}</h3>
            <p className="text-sm text-gray-600">Revenue This Month</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Revenue Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
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