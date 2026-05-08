import React from 'react';
import { Users, ClipboardList, MessageSquare, Banknote, LayoutDashboard, UserCog } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color: string;
}

interface QuickActionsMenuProps {
  actions?: QuickAction[];
  onNavigateToUserManagement?: () => void;
  onNavigateToPendingRequests?: () => void;
  onNavigateToFeedback?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProfile?: () => void;
}

export function QuickActionsMenu({
  actions,
  onNavigateToUserManagement,
  onNavigateToPendingRequests,
  onNavigateToFeedback,
  onNavigateToPayments,
  onNavigateToDashboard,
  onNavigateToProfile,
}: QuickActionsMenuProps) {

  // Default actions if none provided
  const defaultActions: QuickAction[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-6 h-6" />,
      label: 'Dashboard',
      action: onNavigateToDashboard || (() => {}),
      color: 'text-blue-600',
    },
    {
      id: 'users',
      icon: <Users className="w-6 h-6" />,
      label: 'Manage Users',
      action: onNavigateToUserManagement || (() => {}),
      color: 'text-purple-600',
    },
    {
      id: 'requests',
      icon: <ClipboardList className="w-6 h-6" />,
      label: 'Pending Requests',
      action: onNavigateToPendingRequests || (() => {}),
      color: 'text-orange-600',
    },
    {
      id: 'feedback',
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'User Feedback',
      action: onNavigateToFeedback || (() => {}),
      color: 'text-indigo-600',
    },
    {
      id: 'payments',
      icon: <Banknote className="w-6 h-6" />,
      label: 'Payment Management',
      action: onNavigateToPayments || (() => {}),
      color: 'text-emerald-600',
    },
    {
      id: 'profile',
      icon: <UserCog className="w-6 h-6" />,
      label: 'Profile',
      action: onNavigateToProfile || (() => {}),
      color: 'text-pink-600',
    },
  ];

  const actionsToRender = actions || defaultActions;

  return (
    <>
      <style>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .action-label {
          animation: slideInFromBottom 0.3s ease-out forwards;
        }
      `}</style>
      <div className="flex justify-center">
        <div className="flex items-start gap-6 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          {actionsToRender.map((action) => (
            <div key={action.id} className="flex flex-col items-center gap-2 group cursor-pointer">
              <button
                onClick={action.action}
                className={`p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 ${action.color} hover:scale-110 transform`}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
              
              {/* Label below icon - always visible */}
              <span className="text-xs font-medium text-gray-700 text-center max-w-[70px] action-label">
                {action.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
