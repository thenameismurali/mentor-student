
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Network from './components/Network';
import Messaging from './components/Messaging';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { User } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check for logged-in user in localStorage (simple session persistence)
    const storedUserId = StorageService.getCurrentUserId();
    if (storedUserId) {
      const user = StorageService.getUserById(storedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  // Polling to simulate real-time updates for notifications and connection requests
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const updatedUser = StorageService.getUserById(currentUser.id);
      if (updatedUser) {
        // We only update if critical data changed to avoid too many re-renders
        // For simulation, we check incoming requests length or profile view count
        if (
            updatedUser.incomingRequests.length !== currentUser.incomingRequests.length ||
            updatedUser.connections.length !== currentUser.connections.length ||
            updatedUser.profileViews !== currentUser.profileViews
        ) {
            setCurrentUser(updatedUser);
        }
        // Force refresh trigger for notifications in Navbar
        setRefreshTrigger(prev => prev + 1);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user.id);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.logout();
    setActiveTab('home');
  };

  const refreshUser = () => {
      if(currentUser) {
          const updated = StorageService.getUserById(currentUser.id);
          if(updated) setCurrentUser(updated);
      }
  }

  const handleUpdateProfile = (updatedUser: User) => {
      StorageService.updateUser(updatedUser);
      setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-800">
      <Navbar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        refreshTrigger={refreshTrigger}
      />
      
      <main className="pb-10">
        {activeTab === 'home' && (
            <Home 
                currentUser={currentUser} 
                searchQuery={searchQuery}
            />
        )}
        {activeTab === 'network' && (
            <Network 
                currentUser={currentUser} 
                onConnect={refreshUser} 
                searchQuery={searchQuery}
            />
        )}
        {activeTab === 'messaging' && <Messaging currentUser={currentUser} />}
        {activeTab === 'me' && (
            <Profile 
                currentUser={currentUser} 
                onUpdateProfile={handleUpdateProfile}
            />
        )}
      </main>
    </div>
  );
};

export default App;
