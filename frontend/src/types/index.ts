export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  admin: User;
  avatar?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  group: string;
  messageType: 'text' | 'image' | 'file';
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationMeta;
}

export interface SocketEvents {
  // Outgoing events
  join_group: { groupId: string };
  leave_group: { groupId: string };
  send_message: { groupId: string; content: string; messageType?: string };
  typing_start: { groupId: string };
  typing_stop: { groupId: string };
  edit_message: { messageId: string; content: string };
  delete_message: { messageId: string };

  // Incoming events
  new_message: { message: Message };
  message_edited: { message: Message };
  message_deleted: { messageId: string };
  user_online: { userId: string; username: string };
  user_offline: { userId: string; username: string };
  user_typing: { userId: string; groupId: string };
  user_stop_typing: { userId: string; groupId: string };
  error: { message: string };
}
