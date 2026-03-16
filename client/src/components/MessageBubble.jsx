const MessageBubble = ({ message, mine }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-xl px-4 py-2 ${mine ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
        <p className="text-sm font-medium opacity-80">{message.senderId?.username || 'Unknown'}</p>
        <p className="mt-1 break-words">{message.message}</p>
        <p className="mt-1 text-[10px] opacity-70 text-right">{time}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
