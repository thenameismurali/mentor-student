
import React, { useState, useEffect } from 'react';
import { Home, Users, MessageSquare, User as UserIcon, LogOut, Search, Briefcase, Bell } from 'lucide-react';
import { User, Notification } from '../types';
import { StorageService } from '../services/storage';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  refreshTrigger?: number; // Used to trigger re-renders
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, activeTab, setActiveTab, onLogout, searchQuery, setSearchQuery, refreshTrigger }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setNotifications(StorageService.getNotifications(currentUser.id));
  }, [currentUser, refreshTrigger, showNotifications]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'me', label: 'Me', icon: UserIcon },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      StorageService.markAllNotificationsRead(currentUser.id);
      // We don't immediately clear badge to let user see what's new, but next fetch will clear it
      setTimeout(() => setNotifications(StorageService.getNotifications(currentUser.id)), 1000);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-blue-600 hidden md:block">AlumniConnect</span>
            </div>
            <div className="ml-6 flex-1 max-w-lg hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Search alumni, jobs, posts..."
                />
              </div>
            </div>
          </div>
          <div className="flex items-center relative">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-6 w-6 ${activeTab === item.id ? 'fill-current' : ''}`} />
                <span className="hidden md:block mt-1 text-xs">{item.label}</span>
              </button>
            ))}

            {/* Notification Bell */}
            <div className="relative mx-1">
                <button
                    onClick={handleNotificationClick}
                    className="flex flex-col items-center justify-center px-3 py-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                >
                    <Bell className="h-6 w-6" />
                    <span className="hidden md:block mt-1 text-xs">Alerts</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-2 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 border border-gray-100 max-h-96 overflow-y-auto z-50">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                            <button className="text-xs text-blue-600" onClick={() => setShowNotifications(false)}>Close</button>
                        </div>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 flex items-start gap-3 ${!notif.read ? 'bg-blue-50' : ''}`}>
                                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {notif.actorAvatar ? (
                                            <img src={notif.actorAvatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold">{notif.actorName.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-semibold">{notif.actorName}</span> {notif.content}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {Math.floor((Date.now() - notif.timestamp) / 60000)}m ago
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center px-3 py-2 mx-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="h-6 w-6" />
              <span className="hidden md:block mt-1 text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;