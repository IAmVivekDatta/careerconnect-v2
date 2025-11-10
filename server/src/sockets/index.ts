import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Types } from 'mongoose';

interface SocketUserData {
  id: string;
  role: string;
}

const userRoom = (userId: string) => `user:${userId}`;
const conversationRoom = (conversationId: string) => `conversation:${conversationId}`;

export const SOCKET_EVENTS = {
  POST_CREATED: 'post:created',
  CONVERSATION_NEW_MESSAGE: 'conversation:new-message',
  CONVERSATION_UPDATED: 'conversation:updated',
  UNREAD_SUMMARY: 'unread:summary'
} as const;

let io: SocketIOServer | null = null;

const resolveToken = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth?.token as string | undefined;
  if (authToken) {
    return authToken;
  }

  const header = socket.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === 'string') {
    return queryToken;
  }

  return null;
};

const registerCoreHandlers = (socket: Socket) => {
  const user = socket.data.user as SocketUserData | undefined;
  if (!user) {
    socket.disconnect(true);
    return;
  }

  socket.join(userRoom(user.id));

  socket.on('conversation:join', async (conversationId: string) => {
    try {
      if (!conversationId || !Types.ObjectId.isValid(conversationId)) {
        return;
      }

      const conversation = await Conversation.findById(conversationId).select('_id participants');
      if (!conversation) {
        return;
      }

      const isParticipant = conversation.participants.some((participant) => String(participant) === user.id);
      if (!isParticipant) {
        return;
      }

      socket.join(conversationRoom(conversationId));
    } catch (error) {
      console.error('conversation:join failed', error);
    }
  });

  socket.on('conversation:leave', (conversationId: string) => {
    if (!conversationId) {
      return;
    }
    socket.leave(conversationRoom(conversationId));
  });

  socket.on('disconnect', () => {
    socket.leave(userRoom(user.id));
  });
};

export const initSocket = (server: HttpServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = resolveToken(socket);
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select('_id role isActive');
      if (!user || !user.isActive) {
        return next(new Error('Unauthorized'));
      }

      socket.data.user = { id: String(user._id), role: user.role } satisfies SocketUserData;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    registerCoreHandlers(socket);
  });

  return io;
};

export const getIO = () => io;

export const emitToConversation = (conversationId: string, event: string, payload: unknown) => {
  if (!io) {
    return;
  }
  io.to(conversationRoom(conversationId)).emit(event, payload);
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  if (!io) {
    return;
  }
  io.to(userRoom(userId)).emit(event, payload);
};

export const socketRooms = {
  user: userRoom,
  conversation: conversationRoom
};
