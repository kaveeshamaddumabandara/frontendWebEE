import { NavigationBar } from '../components/NavigationBar';
import { ImageUpload } from '../components/ImageUpload';
import { User, Mail, Phone, Shield, Edit2, Calendar, Settings, Key, Activity, Menu, LayoutDashboard, Users as UsersIcon, ClipboardList, MessageSquare, Banknote, Save, X, Upload, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface AdminProfileProps {
  onBack: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

export function AdminProfile({ userName = 'Admin User', profileImage, onBack, onNavigateToUserManagement, onNavigateToPendingRequests, onNavigateToFeedback, onNavigateToPayments, onLogout, onHome }: AdminProfileProps) {
  const { updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your profile');
        setLoading(false);
        return;
      }
      
      const [profileRes, statsRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getProfileStats(),
      ]);

      setProfileData(profileRes.data.data.user);
      setStats(statsRes.data.data);
      setEditedData({
        name: profileRes.data.data.user.name || '',
        email: profileRes.data.data.user.email || '',
        phone: profileRes.data.data.user.phone || '',
        profileImage: profileRes.data.data.user.profileImage || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await profileAPI.updateProfile(editedData);
      
      setProfileData(response.data.data.user);
      setIsEditing(false);
      
      // Refresh user in AuthContext to update navbar
      await refreshUser();
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      profileImage: profileData.profileImage || '',
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      profileImage: imageUrl,
    }));
  };

  const handleDeleteAccount = async () => {
    if (!deletionReason.trim()) {
      toast.error('Please provide a reason for account deletion');
      return;
    }
    try {
      setDeleting(true);
      // Call API to delete account with reason
      // await profileAPI.deleteAccount({ reason: deletionReason });
      toast.success('Account deletion request submitted successfully');
      setShowDeleteModal(false);
      setDeletionReason('');
      // Optionally logout or redirect
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile data not available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const responsibilities = [
    'User account management and approval',
    'Platform configuration and settings',
    'System monitoring and maintenance',
    'Data analytics and reporting',
    'Security and compliance oversight',
    'Customer support escalation handling',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-teal-50">
      <NavigationBar userType="admin" userName={userName} profileImage={profileData?.profileImage || profileImage} showAuth={true} onLogout={onLogout} onHome={onHome} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Quick Actions Menu */}
        <div className="mb-6 relative">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Administrator Account Information</p>
          
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
                  onClick={() => { onNavigateToUserManagement?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <UsersIcon className="w-5 h-5 text-green-600" />
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

        {/* Edit Profile Button */}
        <div className="mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture & Status Section */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="flex items-start gap-6">
            {isEditing ? (
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImage={editedData.profileImage}
                label="Profile Picture"
              />
            ) : (
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-12 h-12 text-green-600" />
                )}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name || 'Admin User'}</h2>
              <p className="text-gray-600 mb-2">Platform Administrator • Role: {profileData.role}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-green-600 font-medium">{profileData.isActive ? 'Active Session' : 'Inactive'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Last login: {stats?.lastLogin || 'N/A'}
                </div>
              </div>
              {isEditing && editedData.profileImage && (
                <p className="text-sm text-green-600 mt-2">✓ New profile picture selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLogins || 0}</p>
                <p className="text-xs text-gray-600">Total Logins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.actionsThisMonth || 0}</p>
                <p className="text-xs text-gray-600">Actions This Month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.reportsGenerated || 0}</p>
                <p className="text-xs text-gray-600">Reports Generated</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-600">Access Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-900 mt-1">{profileData.name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profileData.email || 'N/A'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {profileData.phone || 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-gray-900 mt-1">{profileData.role || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Join Date</label>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Administrative Information */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Administrative Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Access Level</label>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" />
                {profileData.role === 'admin' ? 'Super Admin' : profileData.role}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="text-gray-900 mt-1">{profileData.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Permissions</label>
              <p className="text-gray-900 mt-1">Full Access - All Modules</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Verified</label>
              <p className="text-gray-900 mt-1">{profileData.isVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Key Responsibilities</h3>
          </div>
          <div className="space-y-3">
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                </div>
                <p className="text-gray-900">{responsibility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Actions */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-yellow-500 transition-colors">
              Change Password
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
              <p className="text-gray-600 mt-2">Please provide a reason for deleting your account. This action cannot be undone and will require admin approval.</p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deletion Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Enter the reason for account deletion..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {deletionReason.length} / 500 characters
              </p>
            </div>

            <div className="p-6 border-t-2 border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletionReason('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletionReason.trim() || deleting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}