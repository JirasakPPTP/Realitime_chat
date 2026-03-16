import { useMemo, useState } from 'react';

const Sidebar = ({
  user,
  rooms,
  users,
  activeTarget,
  onSelectRoom,
  onSelectUser,
  onCreateRoom,
  onLogout,
  badges,
}) => {
  const [roomName, setRoomName] = useState('');

  const onlineUsers = useMemo(() => users.filter((item) => item.isOnline), [users]);

  const submitRoom = (e) => {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) return;

    onCreateRoom(name);
    setRoomName('');
  };

  return (
    <aside className="w-full md:w-80 border-r border-slate-800 bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://placehold.co/40x40?text=U'}
            alt="avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button onClick={onLogout} className="ml-auto text-xs px-2 py-1 bg-slate-800 rounded hover:bg-slate-700">
            Logout
          </button>
        </div>

        <form onSubmit={submitRoom} className="mt-4 flex gap-2">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Create room"
            className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm outline-none"
          />
          <button className="bg-brand-600 hover:bg-brand-500 text-white px-3 rounded-md text-sm">Add</button>
        </form>
      </div>

      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Rooms</h3>
        <div className="space-y-1 max-h-44 overflow-auto">
          {rooms.map((room) => {
            const selected = activeTarget?.type === 'room' && activeTarget.id === room._id;
            const count = badges[`room:${room._id}`] || 0;
            return (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`w-full text-left px-3 py-2 rounded-md flex justify-between ${selected ? 'bg-brand-600' : 'hover:bg-slate-800'}`}
              >
                <span className="truncate"># {room.name}</span>
                {count > 0 && <span className="ml-2 text-xs bg-red-600 px-2 rounded-full">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Users ({onlineUsers.length} online)</h3>
        <div className="space-y-1">
          {users
            .filter((u) => u._id !== user?._id)
            .map((item) => {
              const selected = activeTarget?.type === 'direct' && activeTarget.id === item._id;
              const count = badges[`direct:${item._id}`] || 0;

              return (
                <button
                  key={item._id}
                  onClick={() => onSelectUser(item)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${selected ? 'bg-brand-600' : 'hover:bg-slate-800'}`}
                >
                  <span className={`h-2 w-2 rounded-full ${item.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span className="truncate flex-1">{item.username}</span>
                  {count > 0 && <span className="ml-2 text-xs bg-red-600 px-2 rounded-full">{count}</span>}
                </button>
              );
            })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
