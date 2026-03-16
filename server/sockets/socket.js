import jwt from 'jsonwebtoken';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const typingUsers = new Map();

const getUserFromSocket = async (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

export const initializeSocket = (io) => {
  io.on('connect', async (socket) => {
    const user = await getUserFromSocket(socket);

    if (!user) {
      socket.disconnect(true);
      return;
    }

    socket.data.user = user;
    socket.join(`user:${user._id}`);
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    io.emit('user_status', { userId: user._id, isOnline: true });

    socket.on('join_room', ({ roomId }) => {
      if (roomId) {
        socket.join(`room:${roomId}`);
      }
    });

    socket.on('leave_room', ({ roomId }) => {
      if (roomId) {
        socket.leave(`room:${roomId}`);
      }
    });

    socket.on('typing', ({ roomId, toUserId }) => {
      const payload = {
        userId: socket.data.user._id,
        username: socket.data.user.username,
      };

      if (roomId) {
        typingUsers.set(`${roomId}:${socket.data.user._id}`, true);
        socket.to(`room:${roomId}`).emit('typing', payload);
      }

      if (toUserId) {
        socket.to(`user:${toUserId}`).emit('typing', payload);
      }
    });

    socket.on('stop_typing', ({ roomId, toUserId }) => {
      const payload = {
        userId: socket.data.user._id,
      };

      if (roomId) {
        typingUsers.delete(`${roomId}:${socket.data.user._id}`);
        socket.to(`room:${roomId}`).emit('stop_typing', payload);
      }

      if (toUserId) {
        socket.to(`user:${toUserId}`).emit('stop_typing', payload);
      }
    });

    socket.on('send_message', async ({ roomId, toUserId, message }) => {
      if (!message || !message.trim()) return;

      try {
        let conversationId = null;

        if (toUserId) {
          const participantIds = [socket.data.user._id.toString(), toUserId].sort();
          let conversation = await Conversation.findOne({ participants: { $all: participantIds, $size: 2 } });

          if (!conversation) {
            conversation = await Conversation.create({ participants: participantIds, lastMessage: message.trim() });
          } else {
            conversation.lastMessage = message.trim();
            await conversation.save();
          }

          conversationId = conversation._id;
        }

        const savedMessage = await Message.create({
          senderId: socket.data.user._id,
          roomId: roomId || null,
          conversationId,
          message: message.trim(),
        });

        const populatedMessage = await savedMessage.populate('senderId', 'username avatar');

        if (roomId) {
          io.to(`room:${roomId}`).emit('receive_message', { roomId, message: populatedMessage });
        }

        if (toUserId) {
          io.to(`user:${toUserId}`).emit('receive_message', { toUserId, message: populatedMessage });
          io.to(`user:${socket.data.user._id}`).emit('receive_message', { toUserId, message: populatedMessage });
        }
      } catch (error) {
        socket.emit('socket_error', { message: error.message || 'Message send failed' });
      }
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.data.user?._id, { isOnline: false });
      io.emit('user_status', { userId: socket.data.user?._id, isOnline: false });
    });
  });
};
