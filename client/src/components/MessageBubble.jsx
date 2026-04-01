import { useState } from 'react';

const MessageBubble = ({ message, mine, onDelete }) => {
  const [hover, setHover] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    if (!window.confirm('ลบข้อความนี้ใช่ไหม?')) return;
    await onDelete?.(message._id);
  };

  return (
    <div
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative max-w-[75%]">
        {mine && hover && (
          <button
            onClick={handleDelete}
            className="absolute right-2 top-2 rounded bg-black/20 px-2 py-0.5 text-[10px] text-red-200 hover:bg-red-500/20 hover:text-red-100"
            aria-label="Delete message"
          >
            ลบ
          </button>
        )}

        <div
          className={`rounded-xl px-4 py-2 pr-12 ${
            mine
              ? 'bg-brand-600 text-white'
              : 'bg-slate-800 text-slate-100'
          }`}
        >
          <p className="text-xs font-medium opacity-80">
            {message.senderId?.username || 'Unknown'}
          </p>

          <p className="mt-1 break-words">{message.message}</p>

          <p className="mt-1 text-[10px] opacity-70 text-right">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
