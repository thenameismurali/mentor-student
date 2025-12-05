
import React, { useState } from 'react';
import { Briefcase, ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'landing' | 'login' | 'role_select' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated auth
  const [error, setError] = useState('');
  
  // Registration State
  const [regRole, setRegRole] = useState<UserRole>('Student');
  const [regName, setRegName] = useState('');
  const [regHeadline, setRegHeadline] = useState('');
  const [regAbout, setRegAbout] = useState('');
  const [regSkills, setRegSkills] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = StorageService.login(email);
    if (user) {
      onLogin(user);
    } else {
      setError('User not found. Try sarah@example.com or create an account.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !email) {
        setError("Name and Email are required.");
        return;
    }
    const newUser = StorageService.createUser({
        name: regName,
        email: email,
        role: regRole,
        headline: regHeadline,
        about: regAbout,
        skills: regSkills.split(',').map(s => s.trim()).filter(Boolean)
    });
    onLogin(newUser);
  };

  // 1. Landing View
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
         <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-blue-600">AlumniConnect</span>
            </div>
            <div className="space-x-4">
                <button onClick={() => setView('login')} className="font-semibold text-gray-600 hover:text-gray-900">Sign In</button>
                <button onClick={() => setView('role_select')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">Get Started</button>
            </div>
         </header>

         <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                Bridge the gap <br/> between <span className="text-blue-600">Juniors</span> <br/> & <span className="text-blue-600">Alumni.</span>
            </h1>
            <p className="max-w-2xl text-xl text-gray-500 mb-10">
                A dedicated platform for university students to find mentors, network with alumni, and accelerate their careers.
            </p>
            <div className="flex gap-4">
                <button onClick={() => setView('role_select')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg">
                    Join the Network
                </button>
                <button onClick={() => setView('login')} className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition">
                    Log In
                </button>
            </div>
            
            {/* Trust badge mock */}
            <div className="mt-16 flex items-center gap-2 grayscale opacity-50">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <img key={i} className="h-8 w-8 rounded-full border-2 border-white" src={`https://picsum.photos/seed/${i}/50`} alt="" />
                    ))}
                 </div>
                 <span className="text-sm font-medium">Trusted by 10,000+ students and alumni.</span>
            </div>
         </main>
      </div>
    );
  }

  // 2. Login View
  if (view === 'login') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-8 py-10 text-center">
                    <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-blue-200 hover:text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">AlumniConnect</h2>
                    <p className="text-blue-100">Connect. Mentor. Grow.</p>
                </div>
                
                <div className="px-8 py-10">
                    <div className="flex border-b border-gray-200 mb-8">
                        <button className="flex-1 pb-4 border-b-2 border-blue-600 text-blue-600 font-bold">Sign In</button>
                        <button onClick={() => setView('role_select')} className="flex-1 pb-4 text-gray-500 font-medium hover:text-gray-700">Join Now</button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Enter your email"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                            Sign In
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Try demo accounts: sarah@example.com, david@example.com
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 3. Role Select
  if (view === 'role_select') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
             <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-8 py-8 text-center relative">
                    <button onClick={() => setView('landing')} className="absolute top-6 left-4 text-blue-200 hover:text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-white">AlumniConnect</h2>
                    <p className="text-blue-100 text-sm mt-1">Connect. Mentor. Grow.</p>
                </div>
                
                <div className="px-8 py-8">
                     <div className="flex border-b border-gray-200 mb-6">
                        <button onClick={() => setView('login')} className="flex-1 pb-3 text-gray-500 font-medium">Sign In</button>
                        <button className="flex-1 pb-3 border-b-2 border-blue-600 text-blue-600 font-bold">Join Now</button>
                    </div>

                    <h3 className="text-center text-lg font-bold text-gray-900 mb-6">Choose your path</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div 
                            onClick={() => setRegRole('Student')}
                            className={`cursor-pointer p-6 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                                regRole === 'Student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <GraduationCap className={`h-8 w-8 mb-2 ${regRole === 'Student' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`font-bold ${regRole === 'Student' ? 'text-blue-700' : 'text-gray-600'}`}>Student</span>
                        </div>
                        <div 
                            onClick={() => setRegRole('Alumni')}
                            className={`cursor-pointer p-6 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                                regRole === 'Alumni' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <Briefcase className={`h-8 w-8 mb-2 ${regRole === 'Alumni' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`font-bold ${regRole === 'Alumni' ? 'text-blue-700' : 'text-gray-600'}`}>Alumni</span>
                        </div>
                    </div>

                    <button onClick={() => setView('register')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
             </div>
        </div>
      );
  }

  // 4. Registration Details
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden my-4">
             <div className="bg-blue-600 px-8 py-6 text-center relative">
                <button onClick={() => setView('role_select')} className="absolute top-6 left-4 text-blue-200 hover:text-white">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-white">AlumniConnect</h2>
                <p className="text-blue-100 text-sm mt-1">Connect. Mentor. Grow.</p>
            </div>

            <div className="px-8 py-6">
                <div className="flex border-b border-gray-200 mb-6">
                    <button onClick={() => setView('login')} className="flex-1 pb-3 text-gray-500 font-medium">Sign In</button>
                    <button className="flex-1 pb-3 border-b-2 border-blue-600 text-blue-600 font-bold">Join Now</button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Profile</h3>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                placeholder="jane@uni.edu"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Headline</label>
                        <input 
                            type="text" 
                            required
                            value={regHeadline}
                            onChange={(e) => setRegHeadline(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            placeholder={regRole === 'Student' ? "CS Student @ University" : "Software Engineer @ Google"}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">About / Interests</label>
                        <textarea 
                            value={regAbout}
                            onChange={(e) => setRegAbout(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none"
                            rows={3}
                            placeholder="I'm interested in..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Skills (comma separated)</label>
                        <input 
                            type="text" 
                            value={regSkills}
                            onChange={(e) => setRegSkills(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            placeholder="React, Python, Marketing"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setView('role_select')} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                            Back
                        </button>
                        <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default Auth;
