import { useState, useEffect } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Clock, CheckCircle, XCircle, User, Calendar, Menu, LayoutDashboard, UserCog, Users as UsersIcon, MessageSquare, Banknote, Eye, X, FileText, Briefcase, Award, MapPin, Phone, Mail } from 'lucide-react';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface PendingRequestsProps {
  onBack?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  onHome?: () => void;
}

interface Request {
  _id: string;
  name: string;
  email: string;
  role: 'caregiver' | 'carereceiver' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  profileImage?: string;
  // Caregiver specific fields
  experience?: string;
  qualifications?: string;
  specializations?: string[];
  availability?: string;
  hourlyRate?: number;
  bio?: string;
  certifications?: string[];
  languages?: string[];
  documents?: {
    idProof?: string;
    qualificationCertificates?: string[];
    policeVerification?: string;
    medicalCertificate?: string;
  };
}

export default function PendingRequests({ userName = 'Admin User', profileImage, onBack, onNavigateToProfile, onNavigateToUserManagement, onNavigateToFeedback, onNavigateToPayments, onLogout, onHome }: PendingRequestsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingRequests(filter === 'all' ? undefined : filter);
      setRequests(response.data.data);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await adminAPI.approveRequest(requestId);
      toast.success('Request accepted successfully');
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!requestToReject || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await adminAPI.rejectRequest(requestToReject, { reason: rejectionReason });
      toast.success('Request rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setRequestToReject(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const openRejectModal = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectModal(true);
  };

  const openDetailsModal = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getRequestStatus = (request: Request) => {
    if (request.isVerified) return 'approved';
    if (!request.isActive && !request.isVerified) return 'rejected';
    return 'pending';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending requests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Caregiver Approval Requests</h1>
          <p className="text-gray-600">Review and approve caregiver registration requests</p>
          
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
                  onClick={() => { onNavigateToUserManagement?.(); setQuickActionsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <UsersIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Manage Users</span>
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

        {/* Filter Dropdown */}
        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 focus:outline-none focus:border-green-500 transition-colors bg-white"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-gray-600">Total: {requests.filter(req => req.role === 'caregiver').length}</span>
        </div>

        {/* Requests List */}
        {requests.filter(req => req.role === 'caregiver').length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No caregiver requests found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'There are no caregiver registration requests at the moment.'
                : `There are no ${filter} caregiver requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.filter(req => req.role === 'caregiver').slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => {
              const status = getRequestStatus(request);
              return (
                <div key={request._id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-colors shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {request.profileImage ? (
                        <img 
                          src={request.profileImage} 
                          alt={request.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.role === 'caregiver'
                              ? 'bg-purple-100 text-purple-700'
                              : request.role === 'carereceiver'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {request.role === 'caregiver' ? 'Caregiver' : request.role === 'carereceiver' ? 'Care Receiver' : 'Admin'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{request.email}</span>
                          </div>
                          {request.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{request.phone}</span>
                            </div>
                          )}
                          {request.city && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{request.city}, {request.province}</span>
                            </div>
                          )}
                          {request.experience && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-4 h-4" />
                              <span>{request.experience} experience</span>
                            </div>
                          )}
                        </div>
                        {request.qualifications && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700"><span className="font-medium">Qualifications:</span> {request.qualifications}</p>
                          </div>
                        )}
                        {request.specializations && request.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {request.specializations.map((spec, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted {formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailsModal(request)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => openRejectModal(request._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination */}
        {requests.filter(req => req.role === 'caregiver').length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(requests.filter(req => req.role === 'caregiver').length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(requests.filter(req => req.role === 'caregiver').length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(requests.filter(req => req.role === 'caregiver').length / itemsPerPage)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
        
        {/* Results Summary */}
        {requests.filter(req => req.role === 'caregiver').length > 0 && (
          <div className="mt-4 text-center text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, requests.filter(req => req.role === 'caregiver').length)} to {Math.min(currentPage * itemsPerPage, requests.filter(req => req.role === 'caregiver').length)} of {requests.filter(req => req.role === 'caregiver').length} caregiver requests
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Caregiver Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Personal Information
                </h3>
                {selectedRequest.profileImage && (
                  <div className="flex justify-center mb-6">
                    <img 
                      src={selectedRequest.profileImage} 
                      alt={selectedRequest.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedRequest.email}</p>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedRequest.phone}</p>
                    </div>
                  )}
                  {selectedRequest.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{selectedRequest.address}</p>
                    </div>
                  )}
                  {selectedRequest.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="text-gray-900">{selectedRequest.city}</p>
                    </div>
                  )}
                  {selectedRequest.province && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Province</label>
                      <p className="text-gray-900">{selectedRequest.province}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Professional Information
                </h3>
                <div className="space-y-4">
                  {selectedRequest.experience && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900">{selectedRequest.experience}</p>
                    </div>
                  )}
                  {selectedRequest.qualifications && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Qualifications</label>
                      <p className="text-gray-900">{selectedRequest.qualifications}</p>
                    </div>
                  )}
                  {selectedRequest.specializations && selectedRequest.specializations.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specializations</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRequest.specializations.map((spec, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRequest.certifications && selectedRequest.certifications.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Certifications</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRequest.certifications.map((cert, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRequest.languages && selectedRequest.languages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Languages</label>
                      <p className="text-gray-900">{selectedRequest.languages.join(', ')}</p>
                    </div>
                  )}
                  {selectedRequest.availability && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Availability</label>
                      <p className="text-gray-900">{selectedRequest.availability}</p>
                    </div>
                  )}
                  {selectedRequest.hourlyRate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Hourly Rate</label>
                      <p className="text-gray-900 font-semibold">LKR {selectedRequest.hourlyRate}/hour</p>
                    </div>
                  )}
                  {selectedRequest.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bio</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted Documents */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Submitted Documents
                </h3>
                <div className="space-y-3">
                  {selectedRequest.documents?.idProof && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">ID Proof</span>
                      <a
                        href={selectedRequest.documents.idProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                  {selectedRequest.documents?.qualificationCertificates && selectedRequest.documents.qualificationCertificates.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium block mb-2">Qualification Certificates</span>
                      <div className="space-y-2 ml-4">
                        {selectedRequest.documents.qualificationCertificates.map((cert, idx) => (
                          <a
                            key={idx}
                            href={cert}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 block"
                          >
                            Certificate {idx + 1} →
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRequest.documents?.policeVerification && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Police Verification</span>
                      <a
                        href={selectedRequest.documents.policeVerification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                  {selectedRequest.documents?.medicalCertificate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Medical Certificate</span>
                      <a
                        href={selectedRequest.documents.medicalCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                  {!selectedRequest.documents?.idProof && 
                   !selectedRequest.documents?.qualificationCertificates?.length && 
                   !selectedRequest.documents?.policeVerification && 
                   !selectedRequest.documents?.medicalCertificate && (
                    <p className="text-gray-500 text-center py-4">No documents submitted yet</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {getRequestStatus(selectedRequest) === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Request
                  </button>
                  <button
                    onClick={() => {
                      openRejectModal(selectedRequest._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reject Application</h2>
              <p className="text-gray-600 mt-2">Please provide a reason for rejecting this application. The applicant will receive this feedback.</p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {rejectionReason.length} / 500 characters
              </p>
            </div>

            <div className="p-6 border-t-2 border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRequestToReject(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}