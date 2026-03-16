import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const ChatBox = ({
  activeTarget,
  messages,
  user,
  onSend,
  onTyping,
  onStopTyping,
  typingUsers,
}) => {
  if (!activeTarget) {
    return (
      <div className="flex-1 bg-slate-900 text-slate-400 grid place-items-center">
        Select a room or user to start chatting.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <header className="h-16 border-b border-slate-800 px-5 flex items-center justify-between bg-slate-900">
        <div>
          <h2 className="text-white text-lg font-semibold">{activeTarget.label}</h2>
          <p className="text-xs text-slate-400">{activeTarget.type === 'room' ? 'Public room' : 'Direct message'}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} mine={msg.senderId?._id === user?._id} />
        ))}
      </div>

      <TypingIndicator usernames={typingUsers} />

      <ChatInput onSend={onSend} onTyping={onTyping} onStopTyping={onStopTyping} />
    </div>
  );
};

export default ChatBox;
