export type UserRole = "student" | "alumni" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

export interface Opportunity {
  _id: string;
  title: string;
  company: string;
  type: "Internship" | "Full-time" | "Part-time";
  status: "pending" | "approved" | "rejected";
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
