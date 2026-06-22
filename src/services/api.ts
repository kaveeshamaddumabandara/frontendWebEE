import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/updatepassword', data),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string, data?: { reason: string }) => api.delete(`/admin/users/${id}`, { data }),
  updateUserStatus: (id: string, data: { isActive: boolean }) => api.patch(`/admin/users/${id}/status`, data),
  toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),

  // Caregivers
  getAllCaregivers: () => api.get('/admin/caregivers'),
  getCaregiverById: (id: string) => api.get(`/admin/caregivers/${id}`),
  updateCaregiver: (id: string, data: any) => api.put(`/admin/caregivers/${id}`, data),
  deleteCaregiver: (id: string) => api.delete(`/admin/caregivers/${id}`),

  // Care Receivers
  getAllCareReceivers: () => api.get('/admin/care-receivers'),
  getCareReceiverById: (id: string) => api.get(`/admin/care-receivers/${id}`),
  updateCareReceiver: (id: string, data: any) => api.put(`/admin/care-receivers/${id}`, data),
  deleteCareReceiver: (id: string) => api.delete(`/admin/care-receivers/${id}`),

  // Statistics
  getStatistics: () => api.get('/admin/statistics'),

  // Pending Requests
  getPendingRequests: (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/admin/pending-requests', { params });
  },
  approveRequest: (id: string) => api.patch(`/admin/requests/${id}/approve`),
  rejectRequest: (id: string, data?: { reason: string }) => api.patch(`/admin/requests/${id}/reject`, data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getUserGrowth: () => api.get('/dashboard/user-growth'),
  getUserDistribution: () => api.get('/dashboard/user-distribution'),
  getRecentActivities: (page = 1, limit = 5) =>
    api.get('/dashboard/recent-activities', { params: { page, limit } }),
  getPlatformActivity: () => api.get('/dashboard/platform-activity'),
  getRevenueTrends: () => api.get('/dashboard/revenue-trends'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  getProfileStats: () => api.get('/profile/stats'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/profile/change-password', data),
  uploadProfileImage: (formData: FormData) => {
    return api.put('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Feedback API
export const feedbackAPI = {
  // Submit feedback (users)
  submitFeedback: (data: {
    rating: number;
    feedbackType?: string;
    category?: string;
    message: string;
  }) => api.post('/feedback/submit', data),
  
  // Get user's own feedbacks
  getMyFeedbacks: () => api.get('/feedback/my-feedbacks'),
  
  // Admin only - Get all feedbacks
  getAllFeedbacks: (params?: {
    status?: string;
    rating?: string;
    category?: string;
    search?: string;
  }) => api.get('/feedback/all', { params }),
  
  // Admin only - Get feedback statistics
  getFeedbackStats: () => api.get('/feedback/stats'),
  
  // Admin only - Get feedback by ID
  getFeedbackById: (id: string) => api.get(`/feedback/${id}`),
  
  // Admin only - Update feedback status
  updateFeedbackStatus: (id: string, data: {
    status: string;
    adminNotes?: string;
  }) => api.put(`/feedback/${id}/status`, data),
  
  // Admin only - Delete feedback
  deleteFeedback: (id: string) => api.delete(`/feedback/${id}`),
};

// Payment API endpoints
export const paymentAPI = {
  // User - Create payment
  createPayment: (data: {
    amount: number;
    paymentMethod: string;
    description: string;
    serviceType: string;
    currency?: string;
  }) => api.post('/payments', data),
  
  // User - Get my payments
  getMyPayments: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/payments/my-payments', { params }),
  
  // Get payment by ID
  getPaymentById: (id: string) => api.get(`/payments/${id}`),
  
  // Admin only - Get all payments
  getAllPayments: (params?: {
    status?: string;
    paymentMethod?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => api.get('/payments/admin/all', { params }),
  
  // Admin only - Get payment statistics
  getPaymentStats: (params?: {
    startDate?: string;
    endDate?: string;
  }) => api.get('/payments/admin/stats', { params }),
  
  // Admin only - Update payment status
  updatePaymentStatus: (id: string, data: {
    status: string;
  }) => api.put(`/payments/${id}/status`, data),
  
  // Admin only - Delete payment
  deletePayment: (id: string) => api.delete(`/payments/${id}`),
};

// Notification API (admin only)
export const notificationAPI = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  deleteAllRead: () => api.delete('/notifications/read'),
};

export default api;
