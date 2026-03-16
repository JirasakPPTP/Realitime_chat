const TypingIndicator = ({ usernames }) => {
  if (!usernames.length) return null;

  return (
    <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-800 bg-slate-900/70">
      {usernames.join(', ')} typing...
    </p>
  );
};

export default TypingIndicator;
