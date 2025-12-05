
import React, { useState, useEffect, useRef } from 'react';
import { User, Post, Comment } from '../types';
import { StorageService } from '../services/storage';
import { Image, Sparkles, Send, ThumbsUp, MessageCircle, Share2, Info, X, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface HomeProps {
  currentUser: User;
  searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ currentUser, searchQuery }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Comment State
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  // Share State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<Post | null>(null);
  const [shareSelectedUsers, setShareSelectedUsers] = useState<string[]>([]);
  const [connections, setConnections] = useState<User[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPosts(StorageService.getPosts());
    // Load connections for sharing
    const allUsers = StorageService.getUsers();
    setConnections(allUsers.filter(u => currentUser.connections.includes(u.id)));
  }, [currentUser]);

  const filteredPosts = posts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewPostImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePost = () => {
    if (!newPostContent.trim() && !newPostImage) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHeadline: currentUser.headline,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      timestamp: Date.now(),
      likes: [],
      comments: []
    };

    StorageService.createPost(newPost);
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
  };

  const handleLike = (postId: string) => {
      StorageService.toggleLikePost(postId, currentUser.id);
      // Refresh local state
      setPosts(posts.map(p => {
          if (p.id === postId) {
              const likes = p.likes.includes(currentUser.id) 
                  ? p.likes.filter(id => id !== currentUser.id)
                  : [...p.likes, currentUser.id];
              return { ...p, likes };
          }
          return p;
      }));
  };

  const openShareModal = (post: Post) => {
      setPostToShare(post);
      setShareSelectedUsers([]);
      setShareModalOpen(true);
  };

  const toggleShareUser = (userId: string) => {
      setShareSelectedUsers(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
  };

  const handleSendShare = () => {
      if (!postToShare) return;

      shareSelectedUsers.forEach(userId => {
          const messageContent = `Shared post from ${postToShare.authorName}:\n\n"${postToShare.content}"`;
          StorageService.sendMessage({
              id: `msg_${Date.now()}_${Math.random()}`,
              senderId: currentUser.id,
              receiverId: userId,
              content: messageContent,
              imageUrl: postToShare.imageUrl,
              timestamp: Date.now(),
              read: false
          });
      });

      alert(`Post sent to ${shareSelectedUsers.length} connection(s).`);
      setShareModalOpen(false);
      setPostToShare(null);
  };

  const handleSubmitComment = (postId: string) => {
      if(!commentContent.trim()) return;
      
      const newComment: Comment = {
          id: `c_${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatarUrl,
          content: commentContent,
          timestamp: Date.now()
      };

      StorageService.addCommentToPost(postId, newComment);
      setPosts(posts.map(p => {
          if(p.id === postId) {
              return { ...p, comments: [...p.comments, newComment] };
          }
          return p;
      }));
      setCommentContent('');
      setOpenCommentPostId(null);
  };

  const handleAIAssist = async () => {
    if(!process.env.API_KEY) {
        alert("API Key not found for AI Assist.");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a professional, short LinkedIn-style post for a ${currentUser.role} named ${currentUser.name}. 
            Topic: "Excited about connecting with peers and learning new things". 
            Tone: Professional but enthusiastic. Max 2 sentences.`,
        });
        if(response.text) {
            setNewPostContent(response.text);
        }
    } catch (e) {
        console.error("AI Error", e);
        setNewPostContent("Excited to join this community and connect with fellow professionals!");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden sticky top-24">
            <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-4 pb-4 relative">
              <div className="relative -mt-8 mb-3">
                 <div className="h-16 w-16 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 overflow-hidden">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                    ) : (
                        currentUser.name.charAt(0)
                    )}
                 </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{currentUser.headline}</p>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Profile viewers</span>
                  <span className="text-blue-600 font-medium">{currentUser.profileViews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Connections</span>
                  <span className="text-blue-600 font-medium">{currentUser.connections.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Feed */}
        <div className="col-span-1 md:col-span-6 space-y-4">
          {/* Post Creator */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex space-x-3 mb-4">
               <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 overflow-hidden">
                  {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover"/>
                  ) : (
                      currentUser.name.charAt(0)
                  )}
               </div>
               <div className="flex-1">
                   <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                    rows={3}
                    placeholder="Start a post..."
                   />
                   {newPostImage && (
                       <div className="relative mt-2">
                           <img src={newPostImage} alt="Preview" className="max-h-60 rounded-lg object-cover" />
                           <button 
                               onClick={() => setNewPostImage(null)}
                               className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90"
                           >
                               <X className="h-4 w-4" />
                           </button>
                       </div>
                   )}
               </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-gray-500 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
                >
                  <Image className="h-5 w-5 text-blue-500 mr-2" />
                  Media
                </button>
                <button 
                    onClick={handleAIAssist}
                    disabled={isGenerating}
                    className="flex items-center text-gray-500 hover:bg-purple-50 px-3 py-2 rounded-md transition-colors text-sm font-medium hover:text-purple-600"
                >
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                  {isGenerating ? 'Thinking...' : 'AI Assist'}
                </button>
              </div>
              <button 
                onClick={handlePost}
                disabled={!newPostContent.trim() && !newPostImage}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Post
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {filteredPosts.length === 0 && (
              <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
                  No posts found matching "{searchQuery}".
              </div>
          )}

          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${post.authorId}/200`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{post.authorName}</h3>
                  <p className="text-xs text-gray-500">{post.authorHeadline}</p>
                  <p className="text-xs text-gray-400">
                    {Math.floor((Date.now() - post.timestamp) / 60000)}m ago
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
              
              {post.imageUrl && (
                  <div className="mb-4">
                      <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full object-cover max-h-96" />
                  </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
                  <span className="flex items-center">
                      {post.likes.length > 0 && (
                        <>
                            <div className="bg-blue-500 rounded-full p-0.5 mr-1">
                                <ThumbsUp className="h-2 w-2 text-white fill-current" />
                            </div>
                            {post.likes.length}
                        </>
                      )}
                  </span>
                  <span>{post.comments.length} comments</span>
              </div>

              <div className="border-t border-gray-100 pt-2 flex justify-between">
                 <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-colors ${
                        post.likes.includes(currentUser.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                 >
                    <ThumbsUp className={`h-4 w-4 mr-2 ${post.likes.includes(currentUser.id) ? 'fill-current' : ''}`} /> 
                    Like
                 </button>
                 <button 
                    onClick={() => setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)}
                    className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium"
                 >
                    <MessageCircle className="h-4 w-4 mr-2" /> Comment
                 </button>
                 <button 
                    onClick={() => openShareModal(post)}
                    className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium"
                 >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                 </button>
              </div>

              {/* Comments Section */}
              {openCommentPostId === post.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex space-x-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {currentUser.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">{currentUser.name.charAt(0)}</div>
                                )}
                          </div>
                          <div className="flex-1 flex gap-2">
                              <input 
                                type="text" 
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleSubmitComment(post.id);
                                }}
                              />
                              <button 
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!commentContent.trim()}
                                className="text-blue-600 disabled:text-gray-300"
                              >
                                  <Send className="h-4 w-4" />
                              </button>
                          </div>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {post.comments.map(comment => (
                              <div key={comment.id} className="flex space-x-2">
                                  <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                      <img src={`https://picsum.photos/seed/${comment.authorId}/200`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="bg-gray-100 rounded-lg p-2 text-sm flex-1">
                                      <span className="font-bold block text-xs text-gray-900">{comment.authorName}</span>
                                      <p className="text-gray-700">{comment.content}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Sidebar - News */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-900">AlumniConnect News</h3>
               <Info className="h-4 w-4 text-gray-400" />
            </div>
            <ul className="space-y-4">
              <li className="cursor-pointer group">
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Gemini 2.5 Released</div>
                <div className="text-xs text-gray-500">10,234 readers</div>
              </li>
              <li className="cursor-pointer group">
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">University Hackathon Winners</div>
                <div className="text-xs text-gray-500">5,102 readers</div>
              </li>
              <li className="cursor-pointer group">
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Tech Hiring Trends 2025</div>
                <div className="text-xs text-gray-500">22,912 readers</div>
              </li>
              <li className="cursor-pointer group">
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Alumni Meetup: NYC</div>
                <div className="text-xs text-gray-500">800 readers</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Send to connections</h3>
                      <button onClick={() => setShareModalOpen(false)}><X className="h-5 w-5 text-gray-500" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto mb-4">
                      {connections.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No connections found.</p>
                      ) : (
                          connections.map(user => (
                              <div 
                                key={user.id} 
                                onClick={() => toggleShareUser(user.id)}
                                className={`flex items-center p-2 rounded cursor-pointer ${shareSelectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                              >
                                  <div className="relative">
                                     <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200`} className="h-10 w-10 rounded-full mr-3 object-cover"/>
                                     {shareSelectedUsers.includes(user.id) && (
                                         <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                                             <Check className="h-3 w-3" />
                                         </div>
                                     )}
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm">{user.name}</p>
                                      <p className="text-xs text-gray-500">{user.headline.substring(0, 30)}...</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  <button 
                    onClick={handleSendShare}
                    disabled={shareSelectedUsers.length === 0}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                      Send
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;