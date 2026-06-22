import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { NavigationBar } from '../components/NavigationBar';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, {
        email,
      });

      if (response.data.status === 'success') {
        setSubmitted(true);
        toast.success('Password reset link sent to your email!');
        
        // For development: show the reset token in console
        if (response.data.data?.resetToken) {
          console.log('Reset Token:', response.data.data.resetToken);
          console.log('Reset URL:', response.data.data.resetUrl);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <NavigationBar userType="admin" />
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <img 
                src="/logo.png" 
                alt="ElderEase Logo" 
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The reset link will expire in 10 minutes. 
                  If you don't receive an email, check your spam folder or try again.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <NavigationBar userType="admin" />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img 
                src="/logo.png" 
                alt="ElderEase Logo" 
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="admin@elderease.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3 text-xs text-gray-500">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  For security reasons, we'll send the reset link to the email address associated with your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
