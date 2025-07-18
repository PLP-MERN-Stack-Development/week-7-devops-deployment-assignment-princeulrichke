import { Response } from 'express';
import { Message } from '../models/Message';
import { Group } from '../models/Group';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: userId
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    const messages = await Message.find({ 
      group: groupId,
      isDeleted: false 
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ 
      group: groupId,
      isDeleted: false 
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { content, messageType } = req.body;
    const senderId = req.user!._id;

    // Verify user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: senderId
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    const message = new Message({
      content,
      sender: senderId,
      group: groupId,
      messageType: messageType || 'text'
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update group's last activity
    group.updatedAt = new Date();
    await group.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user!._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found or access denied' });
      return;
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'username avatar');

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    logger.error('Edit message error:', error);
    res.status(500).json({ error: 'Server error editing message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user!._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found or access denied' });
      return;
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error deleting message' });
  }
};
