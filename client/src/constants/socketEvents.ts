export const SOCKET_EVENTS = {
  POST_CREATED: 'post:created',
  CONVERSATION_NEW_MESSAGE: 'conversation:new-message',
  CONVERSATION_UPDATED: 'conversation:updated',
  UNREAD_SUMMARY: 'unread:summary'
} as const;

export type SocketEventKey = keyof typeof SOCKET_EVENTS;
