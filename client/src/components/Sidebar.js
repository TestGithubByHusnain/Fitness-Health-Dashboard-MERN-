import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X,
  Home,
  Activity,
  Utensils,
  Droplets,
  TrendingUp,
  User
} from 'lucide-react';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Activity Tracker', href: '/activity', icon: Activity },
    { name: 'Nutrition Log', href: '/nutrition', icon: Utensils },
    { name: 'Water Tracker', href: '/water', icon: Droplets },
    { name: 'Progress & Analytics', href: '/progress', icon: TrendingUp },
    { name: 'Profile & Settings', href: '/profile', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img
              src="/favicon.png"
              alt="Fitness & Health Logo"
              className="h-12 w-12 rounded-lg"
            />
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              Fitness & Health
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`sidebar-link ${
                    active ? 'active' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Today's Steps</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">8,432</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Calories Burned</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Water Intake</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">6/8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
