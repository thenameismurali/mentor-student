
import { User, Post, Message, Comment, Notification, INITIAL_USERS, INITIAL_POSTS } from '../types';

const KEYS = {
  USERS: 'alumniconnect_users',
  POSTS: 'alumniconnect_posts',
  MESSAGES: 'alumniconnect_messages',
  NOTIFICATIONS: 'alumniconnect_notifications',
  CURRENT_USER: 'alumniconnect_current_user_id'
};

// Initialize Data if empty
const initData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(KEYS.MESSAGES)) {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

initData();

export const StorageService = {
  getUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return users.map((u: any) => ({
        ...u,
        connections: u.connections || [],
        incomingRequests: u.incomingRequests || [],
        profileViews: u.profileViews || 0,
        skills: u.skills || []
    }));
  },

  getUserById: (id: string): User | undefined => {
    const users = StorageService.getUsers();
    return users.find(u => u.id === id);
  },

  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  },

  incrementProfileViews: (targetUserId: string) => {
      const users = StorageService.getUsers();
      const user = users.find(u => u.id === targetUserId);
      if (user) {
          user.profileViews = (user.profileViews || 0) + 1;
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
  },

  createUser: (userData: Partial<User>): User => {
    const users = StorageService.getUsers();
    const newUser: User = {
      id: `user_${Date.now()}`,
      connections: [],
      incomingRequests: [],
      skills: [],
      role: 'Student', // Default
      avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`,
      profileViews: 0,
      ...userData
    } as User;
    
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  login: (email: string): User | null => {
    const users = StorageService.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getPosts: (): Post[] => {
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
    return posts.map((p: any) => ({
        ...p,
        likes: Array.isArray(p.likes) ? p.likes : [],
        comments: Array.isArray(p.comments) ? p.comments : []
    })).sort((a: Post, b: Post) => b.timestamp - a.timestamp);
  },

  createPost: (post: Post) => {
    const posts = StorageService.getPosts();
    posts.unshift(post);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  toggleLikePost: (postId: string, userId: string) => {
    const posts = StorageService.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
  },

  addCommentToPost: (postId: string, comment: Comment) => {
    const posts = StorageService.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(comment);
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
  },

  // Notifications
  getNotifications: (userId: string): Notification[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
    return all.filter((n: Notification) => n.userId === userId).sort((a: any, b: any) => b.timestamp - a.timestamp);
  },

  createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const all = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
      const newNotif: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          read: false
      };
      all.unshift(newNotif);
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  markNotificationRead: (notifId: string) => {
      const all = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
      const updated = all.map((n: Notification) => n.id === notifId ? { ...n, read: true } : n);
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  markAllNotificationsRead: (userId: string) => {
      const all = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
      const updated = all.map((n: Notification) => n.userId === userId ? { ...n, read: true } : n);
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  // Networking Logic
  
  sendConnectionRequest: (requesterId: string, targetId: string) => {
      const users = StorageService.getUsers();
      const targetIndex = users.findIndex(u => u.id === targetId);
      const requester = users.find(u => u.id === requesterId);
      
      if (targetIndex !== -1 && requester) {
          const target = users[targetIndex];
          // Prevent duplicates
          if (!target.incomingRequests.includes(requesterId) && !target.connections.includes(requesterId)) {
              target.incomingRequests.push(requesterId);
              localStorage.setItem(KEYS.USERS, JSON.stringify(users));

              // Send Notification
              StorageService.createNotification({
                  userId: targetId,
                  actorId: requesterId,
                  actorName: requester.name,
                  actorAvatar: requester.avatarUrl,
                  type: 'CONNECTION_REQUEST',
                  content: 'sent you a connection request.'
              });
          }
      }
  },

  acceptConnectionRequest: (currentUserId: string, requesterId: string) => {
      const users = StorageService.getUsers();
      const currentUserIndex = users.findIndex(u => u.id === currentUserId);
      const requesterIndex = users.findIndex(u => u.id === requesterId);

      if (currentUserIndex !== -1 && requesterIndex !== -1) {
          const currentUser = users[currentUserIndex];
          const requester = users[requesterIndex];

          // Add to connections
          if (!currentUser.connections.includes(requesterId)) currentUser.connections.push(requesterId);
          if (!requester.connections.includes(currentUserId)) requester.connections.push(currentUserId);

          // Remove from requests
          currentUser.incomingRequests = currentUser.incomingRequests.filter(id => id !== requesterId);

          localStorage.setItem(KEYS.USERS, JSON.stringify(users));

          // Send Notification to Requester
          StorageService.createNotification({
              userId: requesterId,
              actorId: currentUserId,
              actorName: currentUser.name,
              actorAvatar: currentUser.avatarUrl,
              type: 'CONNECTION_ACCEPTED',
              content: 'accepted your connection request.'
          });
      }
  },

  rejectConnectionRequest: (currentUserId: string, requesterId: string) => {
      const users = StorageService.getUsers();
      const currentUserIndex = users.findIndex(u => u.id === currentUserId);

      if (currentUserIndex !== -1) {
          const currentUser = users[currentUserIndex];
          currentUser.incomingRequests = currentUser.incomingRequests.filter(id => id !== requesterId);
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
  },

  // Messaging Logic
  getMessages: (user1Id: string, user2Id: string): Message[] => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    return allMessages.filter(m => 
      (m.senderId === user1Id && m.receiverId === user2Id) || 
      (m.senderId === user2Id && m.receiverId === user1Id)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  sendMessage: (msg: Message) => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    allMessages.push(msg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(allMessages));

    // Get Sender info for notification
    const sender = StorageService.getUserById(msg.senderId);
    if(sender) {
        StorageService.createNotification({
            userId: msg.receiverId,
            actorId: msg.senderId,
            actorName: sender.name,
            actorAvatar: sender.avatarUrl,
            type: 'NEW_MESSAGE',
            content: `sent you a message: ${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}`
        });
    }
  },

  // Session Management
  setCurrentUser: (id: string) => localStorage.setItem(KEYS.CURRENT_USER, id),
  getCurrentUserId: () => localStorage.getItem(KEYS.CURRENT_USER),
  logout: () => localStorage.removeItem(KEYS.CURRENT_USER)
};