
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Pencil, X, Save, Camera, MapPin, Briefcase, Mail } from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  onUpdateProfile: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editHeadline, setEditHeadline] = useState(currentUser.headline);
  const [editLocation, setEditLocation] = useState(currentUser.location || '');
  const [editAbout, setEditAbout] = useState(currentUser.about || '');
  const [editSkills, setEditSkills] = useState(currentUser.skills.join(', '));
  const [editAvatar, setEditAvatar] = useState(currentUser.avatarUrl || '');

  const handleSave = () => {
      const updatedUser: User = {
          ...currentUser,
          name: editName,
          headline: editHeadline,
          location: editLocation,
          about: editAbout,
          skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
          avatarUrl: editAvatar
      };
      onUpdateProfile(updatedUser);
      setIsEditing(false);
  };

  const handleCancel = () => {
      setEditName(currentUser.name);
      setEditHeadline(currentUser.headline);
      setEditLocation(currentUser.location || '');
      setEditAbout(currentUser.about || '');
      setEditSkills(currentUser.skills.join(', '));
      setEditAvatar(currentUser.avatarUrl || '');
      setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditAvatar(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Header / Cover */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="relative flex justify-between items-end -mt-16 mb-6">
                 <div className="relative group">
                     <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg relative z-10">
                        {isEditing ? (
                             editAvatar ? (
                                <img src={editAvatar} alt="Profile" className="h-full w-full object-cover" />
                             ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-300 bg-gray-100">
                                    {currentUser.name.charAt(0)}
                                </div>
                             )
                        ) : (
                             currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                             ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-blue-600 bg-blue-50">
                                    {currentUser.name.charAt(0)}
                                </div>
                             )
                        )}
                        
                        {/* Camera Overlay when Editing */}
                        {isEditing && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        )}
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                     />
                 </div>

                 {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-gray-700 bg-white border border-gray-300 font-medium hover:bg-gray-50 px-4 py-2 rounded-full transition-all shadow-sm"
                    >
                        <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                    </button>
                 )}
            </div>
            
            {isEditing ? (
                <div className="space-y-6 mb-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Headline</label>
                            <input 
                                type="text" 
                                value={editHeadline} 
                                onChange={e => setEditHeadline(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                            <input 
                                type="text" 
                                value={editLocation} 
                                onChange={e => setEditLocation(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Profile Picture</label>
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:bg-gray-50 text-left flex items-center"
                             >
                                <Camera className="h-4 w-4 mr-2" /> 
                                {editAvatar ? 'Change Photo' : 'Upload Photo'}
                             </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">About</label>
                        <textarea 
                            value={editAbout} 
                            onChange={e => setEditAbout(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px]" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Skills (comma separated)</label>
                        <input 
                            type="text" 
                            value={editSkills} 
                            onChange={e => setEditSkills(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                            <Save className="h-4 w-4 mr-2" /> Save Changes
                        </button>
                        <button onClick={handleCancel} className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center">
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentUser.name}</h1>
                        <p className="text-lg text-gray-600 mb-3">{currentUser.headline}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                             <div className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1.5 text-gray-400" />
                                <span className="font-medium text-gray-700">{currentUser.role}</span>
                             </div>
                             {currentUser.location && (
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                                    <span>{currentUser.location}</span>
                                </div>
                             )}
                             <div className="flex items-center">
                                 <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                                 <span>{currentUser.email}</span>
                             </div>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                            <div className="bg-gray-50 p-5 rounded-xl text-gray-700 leading-relaxed border border-gray-100">
                                {currentUser.about ? (
                                    <p className="whitespace-pre-wrap">{currentUser.about}</p>
                                ) : (
                                    <p className="text-gray-400 italic">No bio available. Click edit to add one.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {currentUser.skills.length > 0 ? (
                                    currentUser.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 italic">No skills listed.</span>
                                )}
                            </div>
                        </section>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
