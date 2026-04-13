import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'player') return <Navigate to="/player" replace />;
  if (user?.role === 'coach') return <Navigate to="/coach" replace />;
  if (user?.role === 'business_owner') return <Navigate to="/business" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-center">Sports Ecosystem Platform</h1>
      <p className="mt-3 text-slate-300 text-center max-w-xl">
        Coaching, indoor ground booking, training & performance, and equipment — one web hub for cricket
        and badminton (FYP26-CS-G22).
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/login"
          className="rounded-xl bg-white text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-100"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="rounded-xl border border-slate-500 px-6 py-3 text-sm font-semibold hover:bg-white/10"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
