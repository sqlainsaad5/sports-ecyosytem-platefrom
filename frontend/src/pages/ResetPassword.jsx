import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api';

const strongPasswordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/password-reset-confirm', { email, token, newPassword });
      setOk(data.message || 'Password updated successfully.');
      setTimeout(() => navigate('/login', { replace: true, state: { emailPrefill: email } }), 1200);
    } catch (error) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070e1d] text-[#dfe5fb]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#11192c]/90 p-8">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight text-white">Reset password</h1>
          <p className="mt-2 text-sm text-slate-400">Set a new strong password for your account.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {err && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
            {ok && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{ok}</p>
            )}
            <input
              className="w-full rounded-xl border border-[#414859]/40 bg-black/35 px-3 py-2.5 text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full rounded-xl border border-[#414859]/40 bg-black/35 px-3 py-2.5 text-sm"
              type="text"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              className="w-full rounded-xl border border-[#414859]/40 bg-black/35 px-3 py-2.5 text-sm"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              pattern={strongPasswordPattern}
              title="Use at least 8 characters including uppercase, lowercase, number, and special character."
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] py-3.5 font-headline text-sm font-bold uppercase tracking-[0.12em] text-[#360061] disabled:opacity-50"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-400">
            <Link to="/login" className="font-semibold text-[#cc97ff] hover:text-[#e9d5ff]">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
