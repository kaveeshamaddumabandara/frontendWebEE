import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Users, UserPlus, Search, Edit, Trash2, CheckCircle, XCircle, Filter, Eye, X, Menu, LayoutDashboard, UserCog, ClipboardList, MessageSquare, Banknote } from 'lucide-react';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface UserManagementProps {
  onBack: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export function UserManagement({ userName = 'Admin User', profileImage, onBack, onNavigateToProfile, onNavigateToPendingRequests, onNavigateToFeedback, onNavigateToPayments, onLogout, onHome }: UserManagementProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const userData = response.data.data.users || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeletionReason('');
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletionReason.trim()) {
      toast.error('Please provide a reason for deleting this user');
      return;
    }

    if (!userToDelete) return;

    try {
      setDeleting(true);
      await adminAPI.deleteUser(userToDelete._id, { reason: deletionReason });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeletionReason('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const confirmEditUser = async (newStatus: boolean) => {
    if (!userToEdit) return;

    try {
      setEditingStatus(true);
      await adminAPI.updateUserStatus(userToEdit._id, { isActive: newStatus });
      
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setShowEditModal(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setEditingStatus(false);
    }
  };

  const handleViewDetails = async (user: User) => {
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const response = await adminAPI.getUserById(user._id);
      setSelectedUser(response.data.data);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast.error(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all platform users</p>
          
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
                  onClick={() => { onBack?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <LayoutDashboard className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <button 
                  onClick={() => { onNavigateToProfile?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <UserCog className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">View Profile</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{users.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isActive).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-purple-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'caregiver').length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Caregivers</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'carereceiver').length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Care Receivers</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="caregiver">Caregiver</option>
                <option value="carereceiver">Care Receiver</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Verified</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'caregiver' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {user.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={user.isVerified ? 'text-green-600' : 'text-gray-400'}>
                          {user.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Edit User Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
        
        {/* Results Summary */}
        <div className="mt-4 text-center text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {detailsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading details...</p>
                </div>
              ) : selectedUser ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{selectedUser.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedUser.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-medium text-gray-900 capitalize">{selectedUser.user?.role || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedUser.user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-medium ${selectedUser.user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.user?.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Verified</p>
                        <p className={`font-medium ${selectedUser.user?.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                          {selectedUser.user?.isVerified ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Caregiver Details */}
                  {selectedUser.user?.role === 'caregiver' && selectedUser.profile && (
                    <>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Experience (Years)</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.experience || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Availability</p>
                            <p className="font-medium text-gray-900 capitalize">{selectedUser.profile.status || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Specializations</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedUser.profile.specializations && selectedUser.profile.specializations.length > 0 ? (
                                selectedUser.profile.specializations.map((spec: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {spec}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500">No specializations listed</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications & Certifications</h3>
                        <div className="space-y-3">
                          {selectedUser.profile.qualifications && selectedUser.profile.qualifications.length > 0 ? (
                            selectedUser.profile.qualifications.map((qual: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-900">{qual}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No qualifications listed</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Bio</p>
                            <p className="text-gray-900 mt-1">{selectedUser.profile.bio || 'No bio provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Languages</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedUser.profile.languages && selectedUser.profile.languages.length > 0 ? (
                                selectedUser.profile.languages.map((lang: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    {lang}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500">No languages specified</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Care Receiver Details */}
                  {(selectedUser.user?.role === 'carereceiver' || selectedUser.user?.role === 'care-receiver') && selectedUser.profile && (
                    <>
                      <div className="bg-orange-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.age || 'N/A'} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium text-gray-900 capitalize">{selectedUser.profile.gender || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.profile.medicalConditions && selectedUser.profile.medicalConditions.length > 0 ? (
                                selectedUser.profile.medicalConditions.map((condition: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                    {condition}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500">No medical conditions listed</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Medications</p>
                            <div className="space-y-2">
                              {selectedUser.profile.medications && selectedUser.profile.medications.length > 0 ? (
                                selectedUser.profile.medications.map((med: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-gray-900">{med}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500">No medications listed</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Concerns & Requirements</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Mobility Level</p>
                            <p className="font-medium text-gray-900 capitalize">{selectedUser.profile.mobilityLevel || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Special Requirements</p>
                            <p className="text-gray-900 mt-1">{selectedUser.profile.specialRequirements || 'None specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Emergency Contact</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.emergencyContact || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Admin or No Profile */}
                  {selectedUser.user?.role === 'admin' && (
                    <div className="bg-purple-50 rounded-xl p-6 text-center">
                      <p className="text-gray-600">Administrator accounts do not have additional profile information.</p>
                    </div>
                  )}

                  {!selectedUser.profile && selectedUser.user?.role !== 'admin' && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-600">No additional profile information available for this user.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Failed to load user details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Status Modal */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-blue-900">Edit User Status</h2>
              <p className="text-blue-700 mt-1">Change user account status</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">User:</p>
                <p className="font-semibold text-gray-900 mt-1">{userToEdit.name}</p>
                <p className="text-sm text-gray-600">{userToEdit.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  userToEdit.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  userToEdit.role === 'caregiver' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {userToEdit.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">Current Status:</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-lg font-medium ${
                      userToEdit.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {userToEdit.isActive ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          Inactive
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Change Status To:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => confirmEditUser(true)}
                      disabled={userToEdit.isActive || editingStatus}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {editingStatus ? 'Updating...' : 'Activate'}
                    </button>
                    <button
                      onClick={() => confirmEditUser(false)}
                      disabled={!userToEdit.isActive || editingStatus}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      {editingStatus ? 'Updating...' : 'Deactivate'}
                    </button>
                  </div>
                </div>

                {userToEdit.isActive ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Deactivating this user will prevent them from accessing the platform.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Activating this user will restore their access to the platform.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setUserToEdit(null);
                }}
                disabled={editingStatus}
                className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-red-900">Delete User</h2>
              <p className="text-red-700 mt-1">This action cannot be undone</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">User to be deleted:</p>
                <p className="font-semibold text-gray-900 mt-1">{userToDelete.name}</p>
                <p className="text-sm text-gray-600">{userToDelete.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  userToDelete.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  userToDelete.role === 'caregiver' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {userToDelete.role}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Deletion <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for deleting this user account..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                  rows={4}
                  maxLength={500}
                  disabled={deleting}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Required for record keeping</p>
                  <p className="text-xs text-gray-500">{deletionReason.length}/500</p>
                </div>
              </div>

              {!deletionReason.trim() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Please provide a reason before proceeding</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setDeletionReason('');
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={!deletionReason.trim() || deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
