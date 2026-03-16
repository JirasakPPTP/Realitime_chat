import { useEffect, useMemo, useState } from 'react';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { api } from '../services/api';

const getTargetKey = (target) => (target ? `${target.type}:${target.id}` : null);

const Chat = () => {
  const { user, token, logout } = useAuth();
  const socket = useSocket(token);

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [messagesByTarget, setMessagesByTarget] = useState({});
  const [typingUsersByTarget, setTypingUsersByTarget] = useState({});
  const [badges, setBadges] = useState({});

  const targetKey = useMemo(() => getTargetKey(activeTarget), [activeTarget]);
  const messages = messagesByTarget[targetKey] || [];
  const typingUsers = Object.values(typingUsersByTarget[targetKey] || {});

  const fetchInitialData = async () => {
    const [roomsRes, usersRes] = await Promise.all([api.get('/rooms'), api.get('/messages/users')]);
    setRooms(roomsRes.data.rooms);
    setUsers(usersRes.data.users);

    if (!activeTarget && roomsRes.data.rooms.length) {
      const firstRoom = roomsRes.data.rooms[0];
      selectRoom(firstRoom);
    }
  };

  useEffect(() => {
    fetchInitialData().catch((error) => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    if (!socket || !activeTarget) return;

    if (activeTarget.type === 'room') {
      socket.emit('join_room', { roomId: activeTarget.id });
      return () => socket.emit('leave_room', { roomId: activeTarget.id });
    }
  }, [socket, activeTarget]);

  useEffect(() => {
    if (!socket) return;

    const onReceive = ({ roomId, toUserId, message }) => {
      let key = null;

      if (roomId) {
        key = `room:${roomId}`;
      } else if (toUserId) {
        const otherUserId = message.senderId._id === user._id ? toUserId : message.senderId._id;
        key = `direct:${otherUserId}`;
      }

      if (!key) return;

      setMessagesByTarget((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), message],
      }));

      if (key !== targetKey) {
        setBadges((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }
    };

    const onTyping = ({ userId, username }) => {
      if (!targetKey || userId === user._id) return;

      setTypingUsersByTarget((prev) => ({
        ...prev,
        [targetKey]: {
          ...(prev[targetKey] || {}),
          [userId]: username,
        },
      }));
    };

    const onStopTyping = ({ userId }) => {
      if (!targetKey) return;

      setTypingUsersByTarget((prev) => {
        const current = { ...(prev[targetKey] || {}) };
        delete current[userId];
        return { ...prev, [targetKey]: current };
      });
    };

    const onUserStatus = ({ userId, isOnline }) => {
      setUsers((prev) => prev.map((item) => (item._id === userId ? { ...item, isOnline } : item)));
    };

    socket.on('receive_message', onReceive);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);
    socket.on('user_status', onUserStatus);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
      socket.off('user_status', onUserStatus);
    };
  }, [socket, targetKey, user?._id]);

  const selectRoom = async (room) => {
    const key = `room:${room._id}`;
    setActiveTarget({ type: 'room', id: room._id, label: `# ${room.name}` });
    setBadges((prev) => ({ ...prev, [key]: 0 }));

    if (messagesByTarget[key]) return;

    const { data } = await api.get(`/messages/rooms/${room._id}`);
    setMessagesByTarget((prev) => ({ ...prev, [key]: data.messages }));
  };

  const selectUser = async (selectedUser) => {
    const key = `direct:${selectedUser._id}`;
    setActiveTarget({ type: 'direct', id: selectedUser._id, label: selectedUser.username });
    setBadges((prev) => ({ ...prev, [key]: 0 }));

    if (messagesByTarget[key]) return;

    const { data } = await api.get(`/messages/direct/${selectedUser._id}`);
    setMessagesByTarget((prev) => ({ ...prev, [key]: data.messages }));
  };

  const sendMessage = (messageText) => {
    if (!socket || !activeTarget) return;

    if (activeTarget.type === 'room') {
      socket.emit('send_message', { roomId: activeTarget.id, message: messageText });
      return;
    }

    socket.emit('send_message', { toUserId: activeTarget.id, message: messageText });
  };

  const emitTyping = () => {
    if (!socket || !activeTarget) return;

    if (activeTarget.type === 'room') {
      socket.emit('typing', { roomId: activeTarget.id });
      return;
    }

    socket.emit('typing', { toUserId: activeTarget.id });
  };

  const emitStopTyping = () => {
    if (!socket || !activeTarget) return;

    if (activeTarget.type === 'room') {
      socket.emit('stop_typing', { roomId: activeTarget.id });
      return;
    }

    socket.emit('stop_typing', { toUserId: activeTarget.id });
  };

  const createRoom = async (name) => {
    const { data } = await api.post('/rooms', { name });
    setRooms((prev) => [data.room, ...prev]);
    await selectRoom(data.room);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <Sidebar
        user={user}
        rooms={rooms}
        users={users}
        activeTarget={activeTarget}
        onSelectRoom={selectRoom}
        onSelectUser={selectUser}
        onCreateRoom={createRoom}
        onLogout={logout}
        badges={badges}
      />

      <ChatBox
        activeTarget={activeTarget}
        messages={messages}
        user={user}
        onSend={sendMessage}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        typingUsers={typingUsers}
      />
    </div>
  );
};

export default Chat;
