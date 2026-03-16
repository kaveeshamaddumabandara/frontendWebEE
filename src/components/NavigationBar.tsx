import { Menu, X, User, LogOut, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-emerald-50/70 backdrop-blur-md shadow-lg py-3' 
            : 'bg-emerald-50/50 backdrop-blur-sm py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            
            {/* Logo Section - Asymmetric Design */}
            <div 
              className="flex items-center gap-3 cursor-pointer group relative"
              onClick={onHome}
            >
              {/* Animated blob behind logo */}
              <div className="absolute -inset-3 bg-emerald-100/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative flex items-center gap-3">
                {/* Logo */}
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="ElderEase" 
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Brand text with quirky styling */}
                <div className="hidden sm:block">
                  <h1 className="text-xl font-extrabold text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Elder<span className="text-teal-600">Ease</span>
                  </h1>
                  {userType && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {userType === 'care-receiver' ? 'Care Receiver' : userType === 'caregiver' ? 'Caregiver' : 'Admin'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Menu - Organic spacing */}
            <div className="hidden md:flex items-center gap-2">
              {showAuth && userName ? (
                <>
                  {/* Notification with bounce */}
                  <button className="relative group p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-300">
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300" />
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </button>

                  {/* Profile - Unconventional layout */}
                  <div className="relative ml-2">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 rounded-2xl transition-all duration-300 group"
                    >
                      {/* Avatar with animated ring */}
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-emerald-200 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
                        <div className="relative w-9 h-9 bg-emerald-200 rounded-xl flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img 
                              src={profileImage.startsWith('http') ? profileImage : `http://localhost:3001${profileImage}`} 
                              alt={userName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : userType === 'admin' ? (
                            <Shield className="w-4.5 h-4.5 text-emerald-700" />
                          ) : (
                            <User className="w-4.5 h-4.5 text-emerald-700" />
                          )}
                        </div>
                      </div>

                      {/* Name with subtle animation */}
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {userName}
                        </p>
                      </div>

                      {/* Animated dots instead of chevron */}
                      <div className="flex flex-col gap-0.5 ml-1">
                        <div className={`w-1 h-1 rounded-full bg-gray-400 transition-all duration-300 ${showProfileMenu ? 'translate-y-0.5' : ''}`}></div>
                        <div className={`w-1 h-1 rounded-full bg-gray-400 transition-all duration-300`}></div>
                        <div className={`w-1 h-1 rounded-full bg-gray-400 transition-all duration-300 ${showProfileMenu ? '-translate-y-0.5' : ''}`}></div>
                      </div>
                    </button>

                    {/* Dropdown - Appears from side */}
                    {showProfileMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowProfileMenu(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-right-2 duration-300">
                          {/* Light green header */}
                          <div className="h-20 bg-emerald-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
                            <div className="relative p-4 flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-200 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden ring-2 ring-emerald-300">
                                {profileImage ? (
                                  <img 
                                    src={profileImage.startsWith('http') ? profileImage : `http://localhost:3001${profileImage}`} 
                                    alt={userName} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : userType === 'admin' ? (
                                  <Shield className="w-6 h-6 text-emerald-700" />
                                ) : (
                                  <User className="w-6 h-6 text-emerald-700" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-emerald-900 text-sm">{userName}</p>
                                <p className="text-xs text-emerald-700 capitalize">{userType}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu items with stagger effect */}
                          <div className="p-3 space-y-1">
                            <button 
                            onClick={() => navigate('/profile')}
                              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-emerald-50 rounded-2xl transition-all duration-200 font-medium flex items-center gap-3 group"
                              style={{ animationDelay: '50ms' }}
                            >
                              <div className="w-8 h-8 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                                <User className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                              </div>
                              Profile Settings
                            </button>
                            <button 
                              onClick={onLogout}
                              className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-medium flex items-center gap-3 group"
                              style={{ animationDelay: '100ms' }}
                            >
                              <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => navigate('/about')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Contact
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Creative hamburger */}
            <button
              className="md:hidden relative w-10 h-10 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu - Slides from top */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-6 pb-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
              {showAuth && userName ? (
                <>
                  {/* Mobile Profile */}
                  <div className="bg-emerald-100 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center overflow-hidden">
                        {profileImage ? (
                          <img 
                            src={profileImage.startsWith('http') ? profileImage : `http://localhost:3001${profileImage}`} 
                            alt={userName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : userType === 'admin' ? (
                          <Shield className="w-6 h-6 text-emerald-700" />
                        ) : (
                          <User className="w-6 h-6 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{userName}</p>
                        <p className="text-sm text-gray-600 capitalize">{userType}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-3 font-medium">
                    <Bell className="w-5 h-5" />
                    Notifications
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </button>
                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-3 font-medium">
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-3 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/about')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all font-medium"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all font-medium"
                  >
                    Contact
                  </button>
                  <button className="w-full px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:shadow-lg transition-all">
                    Get Started
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Spacer */}
      <div className={`transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}></div>
    </>
  );
}
