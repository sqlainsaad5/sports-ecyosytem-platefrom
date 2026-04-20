import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api';

const inputClass =
  'mt-1 w-full rounded-xl border border-[#414859]/40 bg-black/35 px-3 py-2.5 text-sm text-[#dfe5fb] placeholder:text-slate-600 focus:border-[#cc97ff]/50 focus:outline-none focus:ring-1 focus:ring-[#cc97ff]/40';
const labelClass = 'block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setBusy(true);
    try {
      const body = { email };
      if (role) body.role = role;
      const { data } = await api.post('/auth/password-reset-request', body);
      setOk(data.message || 'If an account exists, reset instructions have been sent.');
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
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your email to receive a reset link.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {err && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
            {ok && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{ok}</p>
            )}
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Role (optional)</label>
              <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Any</option>
                <option value="player">Player</option>
                <option value="coach">Coach</option>
                <option value="business_owner">Business owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] py-3.5 font-headline text-sm font-bold uppercase tracking-[0.12em] text-[#360061] disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send reset link'}
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
