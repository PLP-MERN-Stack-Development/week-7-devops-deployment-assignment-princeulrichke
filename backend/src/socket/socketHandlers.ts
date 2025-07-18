import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Message } from '../models/Message';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const handleSocketConnection = (io: SocketIOServer) => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('Server configuration error'));
      }

      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected`);

    try {
      // Update user online status
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: true,
          lastSeen: new Date()
        });

        // Join user to their groups
        const userGroups = await Group.find({ members: socket.userId });
        for (const group of userGroups) {
          socket.join(group._id.toString());
          
          // Notify group members that user is online
          socket.to(group._id.toString()).emit('user_online', {
            userId: socket.userId,
            username: (await User.findById(socket.userId))?.username
          });
        }
      }
    } catch (error) {
      logger.error('Error updating user status:', error);
    }

    // Handle joining a group
    socket.on('join_group', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;
        
        // Verify user is member of the group
        const group = await Group.findOne({
          _id: groupId,
          members: socket.userId
        });

        if (group) {
          socket.join(groupId);
          logger.info(`User ${socket.userId} joined group ${groupId}`);
        }
      } catch (error) {
        logger.error('Error joining group:', error);
      }
    });

    // Handle leaving a group
    socket.on('leave_group', (data: { groupId: string }) => {
      const { groupId } = data;
      socket.leave(groupId);
      logger.info(`User ${socket.userId} left group ${groupId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: {
      groupId: string;
      content: string;
      messageType?: string;
    }) => {
      try {
        const { groupId, content, messageType } = data;

        // Verify user is member of the group
        const group = await Group.findOne({
          _id: groupId,
          members: socket.userId
        });

        if (!group) {
          socket.emit('error', { message: 'Group not found or access denied' });
          return;
        }

        // Create and save message
        const message = new Message({
          content,
          sender: socket.userId,
          group: groupId,
          messageType: messageType || 'text'
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Update group's last activity
        group.updatedAt = new Date();
        await group.save();

        // Emit message to all group members
        io.to(groupId).emit('new_message', {
          message: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            group: message.group,
            messageType: message.messageType,
            isEdited: message.isEdited,
            createdAt: message.createdAt
          }
        });

        logger.info(`Message sent from ${socket.userId} to group ${groupId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { groupId: string }) => {
      socket.to(data.groupId).emit('user_typing', {
        userId: socket.userId,
        groupId: data.groupId
      });
    });

    socket.on('typing_stop', (data: { groupId: string }) => {
      socket.to(data.groupId).emit('user_stop_typing', {
        userId: socket.userId,
        groupId: data.groupId
      });
    });

    // Handle message editing
    socket.on('edit_message', async (data: {
      messageId: string;
      content: string;
    }) => {
      try {
        const { messageId, content } = data;

        const message = await Message.findOne({
          _id: messageId,
          sender: socket.userId,
          isDeleted: false
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        message.content = content;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        await message.populate('sender', 'username avatar');

        // Emit updated message to group
        io.to(message.group.toString()).emit('message_edited', {
          message: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            group: message.group,
            messageType: message.messageType,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            createdAt: message.createdAt
          }
        });
      } catch (error) {
        logger.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('delete_message', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        const message = await Message.findOne({
          _id: messageId,
          sender: socket.userId,
          isDeleted: false
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();

        // Emit message deletion to group
        io.to(message.group.toString()).emit('message_deleted', {
          messageId: message._id
        });
      } catch (error) {
        logger.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`User ${socket.userId} disconnected`);
      
      try {
        if (socket.userId) {
          // Update user offline status
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });

          // Notify groups that user is offline
          const userGroups = await Group.find({ members: socket.userId });
          for (const group of userGroups) {
            socket.to(group._id.toString()).emit('user_offline', {
              userId: socket.userId,
              username: (await User.findById(socket.userId))?.username
            });
          }
        }
      } catch (error) {
        logger.error('Error updating user offline status:', error);
      }
    });
  });
};
