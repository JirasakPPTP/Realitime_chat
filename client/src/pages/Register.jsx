import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', avatar: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(
    () => !form.username || !form.email || !form.password || submitting,
    [form, submitting]
  );

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form.username, form.email, form.password, form.avatar);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white">Register</h1>
        <p className="text-slate-400 mt-2">Create your chat account.</p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            className="w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="url"
            name="avatar"
            value={form.avatar}
            onChange={onChange}
            placeholder="Avatar URL (optional)"
            className="w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <button disabled={disabled} className="mt-6 w-full rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-2 font-medium">
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="mt-4 text-slate-300 text-sm">
          Already have an account? <a href="/login" className="text-brand-400">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
