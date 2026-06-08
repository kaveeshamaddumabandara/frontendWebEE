import { NavigationBar } from '../components/NavigationBar';
import { QuickActionsMenu } from '../components/QuickActionsMenu';
import { ImageUpload } from '../components/ImageUpload';
import { Mail, Phone, Shield, Edit2, Calendar, Key, Save, X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  // Change password modal state
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwShow, setPwShow] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const openPasswordModal = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwShow({ current: false, newPw: false, confirm: false });
    setPwError('');
    setPwModalOpen(true);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPwError('New password must be different from your current password.');
      return;
    }

    try {
      setPwChanging(true);
      setPwError('');
      await profileAPI.changePassword({ currentPassword, newPassword });
      setPwModalOpen(false);
      toast.success('Password changed successfully!');
    } catch (error: any) {
      setPwError(error.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPwChanging(false);
    }
  };

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
    <div className="min-h-screen bg-white">
      <NavigationBar userType="admin" userName={userName} profileImage={profileData?.profileImage || profileImage} showAuth={true} onLogout={onLogout} onHome={onHome} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Menu Component - Above Header */}
        <div className="mb-8">
          <QuickActionsMenu
            onNavigateToUserManagement={onNavigateToUserManagement}
            onNavigateToPendingRequests={onNavigateToPendingRequests}
            onNavigateToFeedback={onNavigateToFeedback}
            onNavigateToPayments={onNavigateToPayments}
            onNavigateToDashboard={onBack}
          />
        </div>

        {/* Header with Page Title */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
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

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            
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
            <Lock className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openPasswordModal}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-yellow-500 hover:text-yellow-700 transition-colors font-medium"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              </div>
              <button
                onClick={() => setPwModalOpen(false)}
                disabled={pwChanging}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Error banner */}
              {pwError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.current ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none text-sm"
                    disabled={pwChanging}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow(s => ({ ...s, current: !s.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {pwShow.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.newPw ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none text-sm"
                    disabled={pwChanging}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow(s => ({ ...s, newPw: !s.newPw }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {pwShow.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength hint */}
                {pwForm.newPassword.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          (() => {
                            let s = 0;
                            if (pwForm.newPassword.length >= 8) s++;
                            if (/[A-Z]/.test(pwForm.newPassword)) s++;
                            if (/\d/.test(pwForm.newPassword)) s++;
                            if (/[^A-Za-z0-9]/.test(pwForm.newPassword)) s++;
                            return s >= level
                              ? ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][level - 1]
                              : 'bg-gray-200';
                          })()
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {(() => {
                        let s = 0;
                        if (pwForm.newPassword.length >= 8) s++;
                        if (/[A-Z]/.test(pwForm.newPassword)) s++;
                        if (/\d/.test(pwForm.newPassword)) s++;
                        if (/[^A-Za-z0-9]/.test(pwForm.newPassword)) s++;
                        return ['', 'Weak', 'Fair', 'Good', 'Strong'][s];
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none text-sm"
                    disabled={pwChanging}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {pwShow.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {pwForm.confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    pwForm.newPassword === pwForm.confirmPassword ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {pwForm.newPassword === pwForm.confirmPassword
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                      : <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setPwModalOpen(false)}
                disabled={pwChanging}
                className="flex-1 px-4 py-2.5 text-sm font-medium border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwChanging}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pwChanging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    Change Password
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