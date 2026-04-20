import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api';

export default function VerifyEmail() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const didRequestRef = useRef(false);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying your email...');
  const [resendMsg, setResendMsg] = useState('');
  const [resendBusy, setResendBusy] = useState(false);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  useEffect(() => {
    if (didRequestRef.current) return;
    didRequestRef.current = true;
    if (!email || !token) {
      setStatus('error');
      setMessage('Missing verification token or email.');
      return;
    }
    api
      .get('/auth/verify-email', { params: { email, token } })
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully.');
      })
      .catch((err) => {
        const raw = String(err?.response?.data?.message || '');
        const normalized =
          raw.includes('Invalid or expired verification link')
            ? 'Verification link is invalid or expired. Request a new verification email and try again.'
            : getErrorMessage(err);
        setStatus('error');
        setMessage(normalized);
      });
  }, [email, token]);

  const resendVerification = async () => {
    if (!email) {
      setResendMsg('Email is missing from this link.');
      return;
    }
    setResendBusy(true);
    setResendMsg('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setResendMsg(data?.message || 'If an account exists, a verification email has been sent.');
    } catch (err) {
      setResendMsg(getErrorMessage(err));
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070e1d] text-[#dfe5fb]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#11192c]/90 p-8 text-center">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight text-white">Email verification</h1>
          <p
            className={`mt-4 rounded-xl px-3 py-2 text-sm ${
              status === 'success'
                ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                : status === 'error'
                  ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border border-slate-500/30 bg-slate-500/10 text-slate-200'
            }`}
          >
            {message}
          </p>
          {status === 'error' ? (
            <button
              type="button"
              onClick={resendVerification}
              disabled={resendBusy}
              className="mt-4 w-full rounded-xl border border-[#cc97ff]/35 bg-[#cc97ff]/10 px-3 py-2 text-sm font-semibold text-[#e9d5ff] hover:bg-[#cc97ff]/20 disabled:opacity-60"
            >
              {resendBusy ? 'Sending…' : 'Resend verification email'}
            </button>
          ) : null}
          {resendMsg ? (
            <p className="mt-3 rounded-xl border border-slate-400/20 bg-slate-500/10 px-3 py-2 text-xs text-slate-200">
              {resendMsg}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-slate-400">
            <Link to="/login" className="font-semibold text-[#cc97ff] hover:text-[#e9d5ff]">
              Continue to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
