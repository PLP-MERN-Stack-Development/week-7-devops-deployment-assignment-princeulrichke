import { IUser } from '../models/User';

// Transform MongoDB user document to frontend-compatible format
export const transformUser = (user: IUser) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen
});

// Transform array of users
export const transformUsers = (users: IUser[]) => users.map(transformUser);

// Transform populated user (could be plain object from populate)
export const transformPopulatedUser = (user: any) => ({
  id: user._id?.toString() || user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen
});

// Transform array of populated users
export const transformPopulatedUsers = (users: any[]) => users.map(transformPopulatedUser);
