
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { MapPin, UserPlus, Check, Clock, UserCheck, X, Eye } from 'lucide-react';

interface NetworkProps {
  currentUser: User;
  onConnect: () => void; // Trigger refresh
  searchQuery: string;
}

const Network: React.FC<NetworkProps> = ({ currentUser, onConnect, searchQuery }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requestUsers, setRequestUsers] = useState<User[]>([]);
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);

  useEffect(() => {
    // Get all users except current one
    const allUsers = StorageService.getUsers();
    setUsers(allUsers.filter(u => u.id !== currentUser.id));

    // Get users who sent requests
    const requesters = allUsers.filter(u => currentUser.incomingRequests.includes(u.id));
    setRequestUsers(requesters);
  }, [currentUser, onConnect]);

  const handleSendRequest = (targetId: string) => {
    StorageService.sendConnectionRequest(currentUser.id, targetId);
    // Force refresh
    onConnect();
  };

  const handleAcceptRequest = (requesterId: string) => {
    StorageService.acceptConnectionRequest(currentUser.id, requesterId);
    onConnect();
  };

  const handleIgnoreRequest = (requesterId: string) => {
    StorageService.rejectConnectionRequest(currentUser.id, requesterId);
    onConnect();
  };

  const handleViewProfile = (user: User) => {
      // Increment view count
      StorageService.incrementProfileViews(user.id);
      setViewProfileUser(user);
  };

  const isConnected = (targetId: string) => {
    return currentUser.connections.includes(targetId);
  };

  const isPending = (targetId: string) => {
      const targetUser = StorageService.getUserById(targetId);
      return targetUser?.incomingRequests.includes(currentUser.id);
  };

  const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Invitations Section */}
      {requestUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Invitations</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{requestUsers.length}</span>
            </div>
            <div className="space-y-4">
                {requestUsers.map(user => (
                    <div key={user.id} className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3 sm:mb-0 cursor-pointer" onClick={() => handleViewProfile(user)}>
                             <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 overflow-hidden">
                                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover"/> : user.name.charAt(0)}
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900 hover:underline">{user.name}</h3>
                                 <p className="text-xs text-gray-500">{user.headline}</p>
                             </div>
                        </div>
                        <div className="flex space-x-2">
                             <button 
                                onClick={() => handleIgnoreRequest(user.id)}
                                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100"
                             >
                                 Ignore
                             </button>
                             <button 
                                onClick={() => handleAcceptRequest(user.id)}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                             >
                                 Accept
                             </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Recommendations Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recommended for you</h2>
        <p className="text-gray-500 text-sm">Connect with alumni and students who share your skills and interests. Click on a user to view their full profile.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No users found matching "{searchQuery}".
            </div>
        )}

        {filteredUsers.map(user => {
          const connected = isConnected(user.id);
          const pending = isPending(user.id);
          
          return (
          <div key={user.id} className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleViewProfile(user)}>
               {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
               ) : (
                   <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                     {user.name.charAt(0)}
                   </div>
               )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="cursor-pointer" onClick={() => handleViewProfile(user)}>
                   <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors">{user.name}</h3>
                   <p className="text-sm text-gray-600 mb-1">{user.headline}</p>
                   {user.location && (
                       <div className="flex items-center text-xs text-gray-500 mb-2">
                           <MapPin className="h-3 w-3 mr-1" />
                           {user.location}
                       </div>
                   )}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">About</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{user.about || "No bio available."}</p>
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex-shrink-0">
                 {connected ? (
                     <button disabled className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-green-600 text-green-600 rounded-full text-sm font-medium bg-green-50">
                        <Check className="h-4 w-4 mr-2" /> Connected
                     </button>
                 ) : pending ? (
                     <button disabled className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-gray-300 text-gray-500 rounded-full text-sm font-medium bg-gray-50">
                        <Clock className="h-4 w-4 mr-2" /> Pending
                     </button>
                 ) : (
                    <button 
                        onClick={() => handleSendRequest(user.id)}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-sm font-medium transition-colors"
                    >
                        <UserPlus className="h-4 w-4 mr-2" /> Connect
                    </button>
                 )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Profile Modal */}
      {viewProfileUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                <button 
                    onClick={() => setViewProfileUser(null)}
                    className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 z-10"
                >
                    <X className="h-5 w-5 text-gray-600" />
                </button>
                
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-6 pb-6">
                    <div className="-mt-12 mb-4">
                        <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                            <img src={viewProfileUser.avatarUrl || `https://picsum.photos/seed/${viewProfileUser.id}/200`} className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewProfileUser.name}</h2>
                    <p className="text-gray-600 mb-4">{viewProfileUser.headline}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {viewProfileUser.location}</div>
                        <div className="flex items-center"><UserCheck className="h-4 w-4 mr-1" /> {viewProfileUser.connections.length} connections</div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{viewProfileUser.about}</p>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {viewProfileUser.skills.map(s => (
                                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{s}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        {!isConnected(viewProfileUser.id) && !isPending(viewProfileUser.id) && (
                            <button 
                                onClick={() => { handleSendRequest(viewProfileUser.id); setViewProfileUser(null); }}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                            >
                                Connect
                            </button>
                        )}
                         {isConnected(viewProfileUser.id) && (
                            <button disabled className="w-full bg-green-50 text-green-700 border border-green-200 py-3 rounded-lg font-bold">
                                Connected
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Network;
