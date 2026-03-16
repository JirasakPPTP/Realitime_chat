import { useEffect, useRef, useState } from 'react';

const ChatInput = ({ onSend, onTyping, onStopTyping }) => {
  const [text, setText] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTyping = (value) => {
    setText(value);
    onTyping();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1200);
  };

  const submit = (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message) return;

    onSend(message);
    setText('');
    onStopTyping();
  };

  return (
    <form onSubmit={submit} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-3">
      <input
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        placeholder="Type your message"
        className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button className="rounded-md bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 font-medium">Send</button>
    </form>
  );
};

export default ChatInput;
