
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { StorageService } from '../services/storage';
import { Send, Search, Image as ImageIcon, X, MoreVertical } from 'lucide-react';

interface MessagingProps {
  currentUser: User;
}

const Messaging: React.FC<MessagingProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load connected users
  useEffect(() => {
    const allUsers = StorageService.getUsers();
    // Filter users that are in the connection list
    const connectedUsers = allUsers.filter(u => currentUser.connections.includes(u.id));
    setConversations(connectedUsers);
  }, [currentUser]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedUser) {
      const msgs = StorageService.getMessages(currentUser.id, selectedUser.id);
      setMessages(msgs);
    }
  }, [selectedUser, currentUser.id, messages]); // added messages dep to auto-update if polling were implemented, strictly keeping to request

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageAttachment(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !imageAttachment) || !selectedUser) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: inputMessage,
      imageUrl: imageAttachment || undefined,
      timestamp: Date.now(),
      read: false
    };

    StorageService.sendMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputMessage('');
    setImageAttachment(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
        
        {/* Sidebar - Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Messaging</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search messages" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {conversations.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No conversations yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Connect with people in your network to start chatting.</p>
                </div>
            ) : (
                conversations.map(user => (
                <div 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 flex items-center cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 border-r-2 border-blue-600' : 'hover:bg-gray-50'}`}
                >
                    <div className="relative flex-shrink-0">
                        <img 
                            src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200`} 
                            alt={user.name} 
                            className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-gray-100"></span>
                    </div>
                    <div className="ml-3 overflow-hidden flex-1">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-blue-700' : 'text-gray-900'}`}>{user.name}</h3>
                        </div>
                        <p className={`text-xs truncate ${selectedUser?.id === user.id ? 'text-blue-600/70' : 'text-gray-500'}`}>{user.headline}</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center">
                    <button 
                        className="md:hidden mr-3 text-gray-500 p-1 hover:bg-gray-100 rounded-full"
                        onClick={() => setSelectedUser(null)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="relative">
                        <img 
                            src={selectedUser.avatarUrl || `https://picsum.photos/seed/${selectedUser.id}/200`}
                            alt="" 
                            className="h-10 w-10 rounded-full object-cover border border-gray-100"
                        />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>
                    <div className="ml-3 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{selectedUser.name}</h3>
                        <span className="text-xs text-gray-500 leading-tight">{selectedUser.headline}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
                    <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-gray-300 ml-1" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">No messages yet</h3>
                        <p className="text-sm">Start the conversation with {selectedUser.name}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser.id;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                        
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                {!isMe && (
                                    <div className="w-8 flex-shrink-0 mr-2 flex items-end">
                                        {showAvatar ? (
                                            <img 
                                                src={selectedUser.avatarUrl || `https://picsum.photos/seed/${selectedUser.id}/200`} 
                                                className="h-8 w-8 rounded-full object-cover border border-gray-100" 
                                                alt=""
                                            />
                                        ) : <div className="w-8" />}
                                    </div>
                                )}
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-sm transition-all ${
                                    isMe 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                }`}>
                                    {msg.imageUrl && (
                                        <div className="mb-2 -mx-1 -mt-1">
                                            <img src={msg.imageUrl} alt="attachment" className="rounded-lg max-w-full object-cover max-h-60" />
                                        </div>
                                    )}
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1.5 text-right font-medium opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                {imageAttachment && (
                    <div className="mb-3 relative inline-block animate-fadeIn">
                        <img src={imageAttachment} alt="preview" className="h-24 rounded-lg border border-gray-200 shadow-sm object-cover" />
                        <button 
                            onClick={() => setImageAttachment(null)}
                            className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-md hover:bg-black transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-full transition-colors mb-1"
                        title="Attach image"
                    >
                        <ImageIcon className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Write a message..."
                            className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm"
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!inputMessage.trim() && !imageAttachment}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all mb-1"
                    >
                        <Send className="h-5 w-5 ml-0.5" />
                    </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
                <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                    <div className="relative">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center z-10 relative">
                             <Send className="h-8 w-8 text-blue-600 ml-1" />
                        </div>
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                             <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Your Messages</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Select a conversation from the list or start a new one to connect with your network.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
