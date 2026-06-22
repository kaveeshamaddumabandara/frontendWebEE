import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { QuickActionsMenu } from '../components/QuickActionsMenu';
import { DollarSign, CreditCard, TrendingUp, Filter, Search, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface PaymentsProps {
  onBack?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  description: string;
  serviceType: string;
  createdAt: string;
}

export function Payments({ userName = 'Admin User', profileImage, onBack, onNavigateToProfile, onNavigateToUserManagement, onNavigateToPendingRequests, onNavigateToFeedback, onLogout, onHome }: PaymentsProps) {
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [statsData, setStatsData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    initializePaymentsPage();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    if (initialLoading) return;
    setCurrentPage(1);
  }, [filterStatus, filterMethod]);

  // Fetch whenever page changes (also triggered by the filter reset above)
  useEffect(() => {
    if (initialLoading) return;
    fetchPayments();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializePaymentsPage = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        fetchPayments(true),
        fetchStats(),
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPayments = async (isInitialLoad = false) => {
    try {
      if (!isInitialLoad) {
        setTableLoading(true);
      }
      const response = await paymentAPI.getAllPayments({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        paymentMethod: filterMethod !== 'all' ? filterMethod : undefined,
        page: currentPage,
        limit: 10,
      });

      const { payments: fetched, pagination } = response.data.data;
      setPayments(fetched);
      setTotalPages(pagination.totalPages ?? 1);
      setTotalPayments(pagination.totalPayments ?? fetched.length);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(error.response?.data?.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      if (!isInitialLoad) {
        setTableLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await paymentAPI.getPaymentStats();
      setStatsData(response.data.data);
    } catch (error: any) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' LKR';
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      (payment.userId?.name || '').toLowerCase().includes(query) ||
      (payment.userId?.email || '').toLowerCase().includes(query) ||
      (payment.transactionId || '').toLowerCase().includes(query) ||
      (payment.description || '').toLowerCase().includes(query)
    );
  });

  // Calculate statistics from API data
  const stats = statsData?.overview || {
    grossRevenue: 0,
    completedRevenue: 0,
    totalTransactions: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  };

  // Format revenue trends from API
  const revenueTrends = statsData?.revenueTrends?.map((item: any) => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
  })) || [];

  // Format payment methods distribution from API
  const paymentMethodsData = statsData?.methodDistribution?.map((item: any) => {
    const colors: any = {
      'Credit Card': '#3B82F6',
      'Debit Card': '#10B981',
      'Bank Transfer': '#F59E0B',
    };
    const total = statsData.overview.totalTransactions;
    return {
      name: item._id,
      value: total > 0 ? Math.round((item.count / total) * 100) : 0,
      color: colors[item._id] || '#6B7280',
    };
  }) || [];

  // Format service types distribution from API
  const serviceTypesData = statsData?.serviceDistribution?.map((item: any) => ({
    type: item._id,
    count: item.count,
  })) || [];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToDashboard={onBack}
          />
        </div>

        {/* Header with Page Title */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.completedRevenue ?? 0, 'LKR')}</h3>
            <p className="text-xs text-gray-400 mt-1">Completed transactions only</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Completed Payments</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.completedCount || 0}</h3>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Pending Payments</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingCount || 0}</h3>
            {statsData?.overview?.pendingRegistrationFees > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                {statsData.overview.pendingRegistrationFees} unpaid registration fee{statsData.overview.pendingRegistrationFees > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Total Transactions</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTransactions || 0}</h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Types Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Service Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceTypesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {tableLoading ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterMethod !== 'all'
                ? 'Try adjusting your filters'
                : 'No payment transactions available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment._id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-colors shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{payment.userId?.name || 'Unknown User'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          <span>{payment.userId?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Service:</span>
                          <span>{payment.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Transaction ID:</span>
                          <span className="font-mono text-xs">{payment.transactionId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{payment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPayments > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-medium">{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalPayments)}</span>
              {' '}of <span className="font-medium">{totalPayments}</span> transactions
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || tableLoading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    const isNear = Math.abs(p - currentPage) <= 1;
                    const isEdge = p === 1 || p === totalPages;
                    if (!isNear && !isEdge) {
                      if (p === currentPage - 2 || p === currentPage + 2) {
                        return <span key={p} className="px-1 text-gray-400 text-sm">…</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        disabled={tableLoading}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-green-600 text-white font-semibold'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || tableLoading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
