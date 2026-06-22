import { X, User, LogOut, Shield, Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { resolveMediaUrl } from '../config/env';

interface NavigationBarProps {
  userType?: 'care-receiver' | 'caregiver' | 'admin' | null;
  userName?: string;
  profileImage?: string;
  onMenuClick?: () => void;
  showAuth?: boolean;
  onLogout?: () => void;
  onHome?: () => void;
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  caregiver_registration: 'bg-blue-100 text-blue-600',
  registration_fee_paid: 'bg-green-100 text-green-600',
  new_booking: 'bg-purple-100 text-purple-600',
  booking_completed: 'bg-emerald-100 text-emerald-600',
  new_feedback: 'bg-amber-100 text-amber-600',
  new_contact: 'bg-pink-100 text-pink-600',
  other: 'bg-gray-100 text-gray-600',
};

const TYPE_ICONS: Record<string, string> = {
  caregiver_registration: '👤',
  registration_fee_paid: '💳',
  new_booking: '📅',
  booking_completed: '✅',
  new_feedback: '⭐',
  new_contact: '✉️',
  other: '🔔',
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NavigationBar({ userType, userName, profileImage, onMenuClick, showAuth = false, onLogout, onHome }: NavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notification state — only populated for admin
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const isAdmin = userType === 'admin';

  // --- Fetch unread count (lightweight poll every 60 s) ---
  const fetchUnreadCount = useCallback(async () => {
    if (!isAdmin || !showAuth) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data?.data?.count ?? 0);
    } catch {
      // silently ignore — badge will just stay at previous value
    }
  }, [isAdmin, showAuth]);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // --- Fetch full notification list when dropdown opens ---
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ limit: 20 });
      setNotifications(res.data?.data?.notifications ?? []);
      setUnreadCount(res.data?.data?.unreadCount ?? 0);
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showNotifications && isAdmin) {
      fetchNotifications();
    }
  }, [showNotifications, isAdmin, fetchNotifications]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  // --- Scroll listener ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string, wasUnread: boolean) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationAPI.deleteAllRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch {
      // ignore
    }
  };

  // --- Bell button (shared for desktop & mobile) ---
  const BellButton = ({ className = '' }: { className?: string }) => (
    <button
      onClick={() => {
        if (!isAdmin) return;
        setShowNotifications(v => !v);
        setShowProfileMenu(false);
      }}
      className={`relative group p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-300 ${className}`}
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {unreadCount === 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </button>
  );

  // --- Notification dropdown panel ---
  const NotificationPanel = () => (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-800 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-emerald-600"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClearRead}
            title="Clear read notifications"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
        {notifLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Bell className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${TYPE_COLORS[n.type] ?? TYPE_COLORS.other}`}>
                {TYPE_ICONS[n.type] ?? '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-1 items-end">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    title="Mark as read"
                    className="p-1 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id, !n.isRead)}
                  title="Delete"
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
          <span className="text-xs text-gray-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );

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
            
            {/* Logo Section */}
            <div 
              className="flex items-center gap-3 cursor-pointer group relative"
              onClick={onHome}
            >
              <div className="absolute -inset-3 bg-emerald-100/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="ElderEase" 
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {showAuth && userName ? (
                <>
                  {/* Notification Bell with dropdown */}
                  <div ref={notifRef} className="relative">
                    <BellButton />
                    {showNotifications && isAdmin && <NotificationPanel />}
                  </div>

                  {/* Profile */}
                  <div className="relative ml-2">
                    <button 
                      onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-emerald-200 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
                        <div className="relative w-9 h-9 bg-emerald-200 rounded-xl flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img 
                              src={resolveMediaUrl(profileImage)} 
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

                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {userName}
                        </p>
                      </div>

                      <div className="flex flex-col gap-0.5 ml-1">
                        <div className={`w-1 h-1 rounded-full bg-gray-400 transition-all duration-300 ${showProfileMenu ? 'translate-y-0.5' : ''}`}></div>
                        <div className="w-1 h-1 rounded-full bg-gray-400 transition-all duration-300"></div>
                        <div className={`w-1 h-1 rounded-full bg-gray-400 transition-all duration-300 ${showProfileMenu ? '-translate-y-0.5' : ''}`}></div>
                      </div>
                    </button>

                    {showProfileMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowProfileMenu(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-right-2 duration-300">
                          <div className="h-20 bg-emerald-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
                            <div className="relative p-4 flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-200 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden ring-2 ring-emerald-300">
                                {profileImage ? (
                                  <img 
                                    src={resolveMediaUrl(profileImage)} 
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

                          <div className="p-3 space-y-1">
                            <button 
                              onClick={() => navigate('/profile')}
                              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-emerald-50 rounded-2xl transition-all duration-200 font-medium flex items-center gap-3 group"
                            >
                              <div className="w-8 h-8 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                                <User className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                              </div>
                              Profile Settings
                            </button>
                            <button 
                              onClick={onLogout}
                              className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-medium flex items-center gap-3 group"
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

            {/* Mobile Menu Button */}
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

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-6 pb-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
              {showAuth && userName ? (
                <>
                  <div className="bg-emerald-100 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center overflow-hidden">
                        {profileImage ? (
                          <img 
                            src={resolveMediaUrl(profileImage)} 
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

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowNotifications(true);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-3 font-medium"
                    >
                      <Bell className="w-5 h-5" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-3 font-medium"
                  >
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
