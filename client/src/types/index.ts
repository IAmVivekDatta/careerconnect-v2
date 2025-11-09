export type UserRole = "student" | "alumni" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

// @ts-prune-ignore-next
export interface Opportunity {
  _id: string;
  title: string;
  company: string;
  description: string;
  type: "Internship" | "Full-time" | "Part-time" | "Training";
  status: "pending" | "approved" | "rejected";
  skills?: string[];
  location?: string;
  salary?: string;
  applyUrl?: string;
  createdAt?: string;
}

export interface PostComment {
  _id: string;
  user: AuthUser;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  author: AuthUser;
  createdAt: string;
  likes: string[] | any[];
  comments: PostComment[];
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    alumni: number;
    active30d: number;
  };
  posts: {
    total: number;
    today: number;
  };
  opportunities: {
    total: number;
    pending: number;
    approved: number;
  };
}

export interface ConnectionUser extends AuthUser {
  skills?: string[];
  bio?: string;
  points?: number;
  createdAt?: string;
  overlap?: number;
  requestedAt?: string;
}

export interface ConnectionsOverview {
  connections: ConnectionUser[];
  pending: ConnectionUser[];
  outgoing: ConnectionUser[];
  suggestions: ConnectionUser[];
  counts: {
    connections: number;
    pending: number;
    outgoing: number;
  };
}

export type ConnectionCounts = ConnectionsOverview['counts'];

export interface UnreadSummary {
  messages: number;
  notifications: number;
  total: number;
}

export interface BadgeWithMeta {
  key: string;
  name: string;
  description: string;
  points: number;
  awardedAt: string;
}

export interface BadgeResponse {
  totalPoints: number;
  badges: BadgeWithMeta[];
}

export interface QuestProgressResponse {
  streak: number;
  completedToday: string[];
  history: Record<string, string[]>;
}

export type SkillEndorsementsResponse = Record<
  string,
  Array<{
    _id: string;
    name: string;
    profilePicture?: string;
  }>
>;

export interface ConversationParticipant {
  _id: string;
  name: string;
  email?: string;
  role?: UserRole;
  profilePicture?: string;
}

export interface ConversationSummary {
  _id: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount?: Record<string, number>;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: ConversationParticipant;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  isRead: boolean;
}
