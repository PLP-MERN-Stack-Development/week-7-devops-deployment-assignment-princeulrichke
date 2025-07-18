import { Response } from 'express';
import { Group } from '../models/Group';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { transformPopulatedUsers } from '../utils/transformers';

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, isPrivate } = req.body;
    const adminId = req.user!._id;

    // Check if group name already exists for this user
    const existingGroup = await Group.findOne({ 
      name, 
      members: adminId 
    });

    if (existingGroup) {
      res.status(400).json({ error: 'Group name already exists' });
      return;
    }

    const group = new Group({
      name,
      description,
      admin: adminId,
      members: [adminId],
      isPrivate: isPrivate || false
    });

    await group.save();
    await group.populate('members admin', 'username email avatar isOnline');

    // Transform user data to match frontend expectations
    const transformedGroup = {
      ...group.toObject(),
      members: transformPopulatedUsers(group.members),
      admin: transformPopulatedUsers([group.admin])[0]
    };

    res.status(201).json({
      message: 'Group created successfully',
      group: transformedGroup
    });
  } catch (error) {
    logger.error('Create group error:', error);
    res.status(500).json({ error: 'Server error creating group' });
  }
};

export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const groups = await Group.find({ members: userId })
      .populate('members admin', 'username email avatar isOnline')
      .sort({ updatedAt: -1 });

    // Transform user data to match frontend expectations
    const transformedGroups = groups.map(group => ({
      ...group.toObject(),
      members: transformPopulatedUsers(group.members),
      admin: transformPopulatedUsers([group.admin])[0]
    }));

    res.json({ groups: transformedGroups });
  } catch (error) {
    logger.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error fetching groups' });
  }
};

export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user!._id;

    const group = await Group.findOne({
      _id: groupId,
      members: userId
    }).populate('members admin', 'username email avatar isOnline');

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    res.json({ group });
  } catch (error) {
    logger.error('Get group error:', error);
    res.status(500).json({ error: 'Server error fetching group' });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (group.isPrivate) {
      res.status(403).json({ error: 'Cannot join private group' });
      return;
    }

    if (group.members.includes(userId)) {
      res.status(400).json({ error: 'Already a member of this group' });
      return;
    }

    group.members.push(userId);
    await group.save();
    await group.populate('members admin', 'username email avatar isOnline');

    res.json({
      message: 'Joined group successfully',
      group
    });
  } catch (error) {
    logger.error('Join group error:', error);
    res.status(500).json({ error: 'Server error joining group' });
  }
};

export const leaveGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (group.admin.toString() === userId.toString()) {
      res.status(400).json({ error: 'Admin cannot leave group. Transfer admin rights first.' });
      return;
    }

    group.members = group.members.filter(
      member => member.toString() !== userId.toString()
    );
    
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    logger.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error leaving group' });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (group.admin.toString() !== userId.toString()) {
      res.status(403).json({ error: 'Only admin can delete group' });
      return;
    }

    // Delete all messages in the group
    await Message.deleteMany({ group: groupId });
    
    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    logger.error('Delete group error:', error);
    res.status(500).json({ error: 'Server error deleting group' });
  }
};

export const discoverGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { search, page = 1, limit = 20 } = req.query;

    let query: any = {
      isPrivate: false, // Only show public groups
      members: { $ne: userId } // Exclude groups user is already a member of
    };

    // Add search functionality if search term provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const groups = await Group.find(query)
      .populate('admin', 'username email avatar')
      .populate('members', 'username email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Group.countDocuments(query);

    // Transform user data to match frontend expectations
    const transformedGroups = groups.map(group => ({
      ...group.toObject(),
      members: transformPopulatedUsers(group.members),
      admin: transformPopulatedUsers([group.admin])[0],
      memberCount: group.members.length
    }));

    res.json({ 
      groups: transformedGroups,
      pagination: {
        current: Number(page),
        pages: Math.ceil(totalCount / Number(limit)),
        total: totalCount
      }
    });
  } catch (error) {
    logger.error('Discover groups error:', error);
    res.status(500).json({ error: 'Server error discovering groups' });
  }
};
