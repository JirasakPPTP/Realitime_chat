import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getRooms = async (_req, res) => {
  try {
    const rooms = await Room.find().populate('members', 'username avatar isOnline').sort({ createdAt: -1 });
    return res.json({ rooms });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const exists = await Room.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      name,
      members: [req.user._id],
      createdBy: req.user._id,
    });

    return res.status(201).json({ room });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: req.user._id } },
      { new: true }
    ).populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json({ room });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { members: req.user._id } },
      { new: true }
    ).populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json({ room });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(500);

    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const participants = [req.user._id, userId].map((id) => id.toString()).sort();

    let conversation = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });

    if (!conversation) {
      conversation = await Conversation.create({ participants, lastMessage: '' });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(500);

    return res.json({ conversation, messages });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar isOnline')
      .sort({ updatedAt: -1 });

    return res.json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
