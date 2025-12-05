
export type UserRole = 'Student' | 'Alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  headline: string;
  about?: string;
  location?: string;
  skills: string[];
  connections: string[]; // Array of user IDs
  incomingRequests: string[]; // Array of user IDs who sent a request
  avatarUrl?: string; // Optional custom avatar
  profileViews: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: string[]; // Array of User IDs who liked the post
  comments: Comment[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  partnerId: string;
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string; // The recipient
  actorId: string; // The user who performed the action
  actorName: string;
  actorAvatar?: string;
  type: 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' | 'NEW_MESSAGE' | 'PROFILE_VIEW';
  content?: string; // Preview text
  timestamp: number;
  read: boolean;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    role: 'Alumni',
    headline: 'Software Engineer at Google | CS Class of 2020',
    about: 'I specialize in distributed systems and cloud computing. Happy to mentor students interested in FAANG interviews.',
    location: 'Mountain View, CA',
    skills: ['Java', 'Distributed Systems', 'Cloud Architecture'],
    connections: [],
    incomingRequests: [],
    avatarUrl: 'https://picsum.photos/id/64/200/200',
    profileViews: 12
  },
  {
    id: 'user_2',
    name: 'David Chen',
    email: 'david@example.com',
    role: 'Alumni',
    headline: 'Product Manager at Spotify | MBA 2019',
    about: 'Transitioned from engineering to product management. I love helping engineers understand the business side.',
    location: 'New York, NY',
    skills: ['Product Management', 'Agile', 'Strategy'],
    connections: [],
    incomingRequests: [],
    avatarUrl: 'https://picsum.photos/id/91/200/200',
    profileViews: 8
  },
  {
    id: 'user_3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    role: 'Alumni',
    headline: 'AI Researcher at OpenAI | PhD in ML',
    about: 'Researching large language models and reinforcement learning.',
    location: 'San Francisco, CA',
    skills: ['Python', 'PyTorch', 'Machine Learning'],
    connections: [],
    incomingRequests: [],
    avatarUrl: 'https://picsum.photos/id/65/200/200',
    profileViews: 45
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_1',
    authorName: 'Sarah Jenkins',
    authorHeadline: 'Software Engineer at Google',
    content: 'Just finished a great workshop on Kubernetes scaling. If any juniors are struggling with container orchestration concepts, feel free to reach out!',
    timestamp: Date.now() - 3600000,
    likes: ['user_2', 'user_3'],
    comments: [
      {
        id: 'c1',
        authorId: 'user_2',
        authorName: 'David Chen',
        content: 'This is super helpful, Sarah! Shared with my mentees.',
        timestamp: Date.now() - 3000000
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_2',
    authorName: 'David Chen',
    authorHeadline: 'Product Manager at Spotify',
    content: 'Hiring season is coming up! Here are my top 5 tips for cracking the PM interview. #career #productmanagement',
    timestamp: Date.now() - 7200000,
    likes: ['user_1'],
    comments: []
  }
];
