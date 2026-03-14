import { Heart, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';

interface NavigationBarProps {
  userType?: 'care-receiver' | 'caregiver' | 'admin' | null;
  userName?: string;
  profileImage?: string;
  onMenuClick?: () => void;
  showAuth?: boolean;
  onLogout?: () => void;
  onHome?: () => void;
}

export function NavigationBar({ userType, userName, profileImage, onMenuClick, showAuth = false, onLogout, onHome }: NavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">ElderEase</h1>
              {userType && (
                <p className="text-xs text-gray-500 capitalize">
                  {userType === 'care-receiver' ? 'Care Receiver' : userType === 'caregiver' ? 'Caregiver' : 'Admin'} Portal
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {showAuth && userName && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage.startsWith('http') ? profileImage : `http://localhost:3001${profileImage}`} alt={userName} className="w-full h-full object-cover" />
                    ) : userType === 'admin' ? (
                      <Shield className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{userName}</span>
                </div>

                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            )}
            
            {!showAuth && (
              <div className="flex items-center gap-3">
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  About
                </button>
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  Contact
                </button>
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  Help
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {showAuth && userName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage.startsWith('http') ? profileImage : `http://localhost:3001${profileImage}`} alt={userName} className="w-full h-full object-cover" />
                    ) : userType === 'admin' ? (
                      <Shield className="w-5 h-5 text-blue-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userType}</p>
                  </div>
                </div>
                <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  About
                </button>
                <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Contact
                </button>
                <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Help
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}