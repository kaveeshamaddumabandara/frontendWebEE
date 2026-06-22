import { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { QuickActionsMenu } from '../components/QuickActionsMenu';
import { MessageSquare, Star, User, Mail, Calendar, Search } from 'lucide-react';
import { feedbackAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface FeedbackProps {
  onBack?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

interface FeedbackRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  rating: number;
  feedbackType: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
}

export function Feedback({ userName = 'Admin User', profileImage, onBack, onNavigateToProfile, onNavigateToUserManagement, onNavigateToPendingRequests, onNavigateToPayments, onLogout, onHome }: FeedbackProps) {
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const hasInitialized = useRef(false);

  const fetchFeedbacks = useCallback(async (isInitialLoad = false) => {
    try {
      if (!isInitialLoad) {
        setTableLoading(true);
      }
      
      const params: any = {};
      if (filterRating !== 'all') params.rating = filterRating;
      if (filterCategory !== 'all') params.category = filterCategory;

      const feedbacksRes = await feedbackAPI.getAllFeedbacks(params);

      setFeedbacks(feedbacksRes.data.data);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      toast.error(error.response?.data?.message || 'Failed to load feedbacks');
      setFeedbacks([]);
    } finally {
      if (!isInitialLoad) {
        setTableLoading(false);
      }
    }
  }, [filterRating, filterCategory]);

  const fetchFeedbackStats = async () => {
    try {
      const statsRes = await feedbackAPI.getFeedbackStats();
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.error('Error fetching feedback stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load feedback stats');
      setStats(null);
    }
  };

  const initializeFeedbackPage = useCallback(async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        fetchFeedbackStats(),
        fetchFeedbacks(true),
      ]);
      hasInitialized.current = true;
    } catch (error) {
      hasInitialized.current = true;
    } finally {
      setInitialLoading(false);
    }
  }, [fetchFeedbacks]);

  useEffect(() => {
    initializeFeedbackPage();
  }, [initializeFeedbackPage]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    setCurrentPage(1);
    fetchFeedbacks();
  }, [filterRating, filterCategory, fetchFeedbacks]);

  const handleMarkAsReviewed = async (feedbackId: string) => {
    try {
      await feedbackAPI.updateFeedbackStatus(feedbackId, { status: 'reviewed' });
      toast.success('Feedback marked as reviewed');
      await Promise.all([fetchFeedbacks(), fetchFeedbackStats()]);
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to update feedback');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      feedback.userId.name.toLowerCase().includes(searchLower) ||
      feedback.userId.email.toLowerCase().includes(searchLower) ||
      feedback.message.toLowerCase().includes(searchLower)
    );
  });

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedbacks...</p>
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
            onNavigateToFeedback={undefined}
            onNavigateToPayments={onNavigateToPayments}
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToDashboard={onBack}
          />
        </div>

        {/* Header with Page Title */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Feedback</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Total Feedback</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.total || 0}</h3>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-yellow-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Average Rating</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.avgRating || 0}</h3>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Pending Review</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.pending || 0}</h3>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-700">Reviewed</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.reviewed || 0}</h3>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Platform Experience">Platform Experience</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Payment">Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {tableLoading ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback data...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-600">
              {searchTerm || filterRating !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'No user feedback available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-colors shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{feedback.userId?.name || 'Unknown User'}</h3>
                        {feedback.userId && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            feedback.userId.role === 'caregiver'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {feedback.userId.role === 'caregiver' ? 'Caregiver' : 'Care Receiver'}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                        </span>
                      </div>
                      {feedback.userId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <span>{feedback.userId.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(feedback.createdAt)}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{feedback.category}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{feedback.feedbackType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {renderStars(feedback.rating)}
                    <span className="text-sm font-semibold text-gray-700">{feedback.rating}/5</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
                </div>
                {feedback.status === 'pending' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleMarkAsReviewed(feedback._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Mark as Reviewed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredFeedbacks.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(filteredFeedbacks.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
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
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredFeedbacks.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredFeedbacks.length / itemsPerPage)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
        
        {/* Results Summary */}
        {filteredFeedbacks.length > 0 && (
          <div className="mt-4 text-center text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFeedbacks.length)} to {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedback entries
          </div>
        )}
      </div>
    </div>
  );
}
