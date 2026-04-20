import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const portals = [
  {
    title: 'Players',
    tag: 'Train & Compete',
    desc: 'Book grounds, find coaches, track performance, and shop gear — cricket & badminton in one flow.',
    icon: 'sports_martial_arts',
    accent: 'from-[#00FF87]/20 to-[#00B4D8]/10',
    border: 'border-player-green/30',
    text: 'text-player-green',
  },
  {
    title: 'Coaches',
    tag: 'Midnight Stadium',
    desc: 'Requests, sessions, plans, evaluations, and payments — a command center built for elite coaching.',
    icon: 'military_tech',
    accent: 'from-[#ff7524]/20 to-[#FF6B00]/10',
    border: 'border-[#ff7524]/30',
    text: 'text-[#ff7524]',
  },
  {
    title: 'Business',
    tag: 'Velocity Pro',
    desc: 'List products, fulfil orders, manage subscriptions, and partner with verified coaches.',
    icon: 'storefront',
    accent: 'from-[#A855F7]/25 to-[#9c48ea]/10',
    border: 'border-[#cc97ff]/30',
    text: 'text-[#cc97ff]',
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'player') return <Navigate to="/player" replace />;
  if (user?.role === 'coach') return <Navigate to="/coach" replace />;
  if (user?.role === 'business_owner') return <Navigate to="/business" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070e1d] text-[#dfe5fb]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-[#A855F7]/15 blur-[120px]" />
        <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-[#00FF87]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#00E5FF]/10 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:4px_4px]" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#070e1d]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-headline text-xl font-black uppercase tracking-tight text-[#A855F7] sm:text-2xl">
              Sports Ecosystem
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#360061] shadow-[0_0_24px_rgba(168,85,247,0.35)] transition hover:scale-[1.02] hover:brightness-110"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-[#9bffce] sm:text-sm">FYP26 · One platform · Three experiences</p>
            <h1 className="mt-6 font-headline text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              The kinetic arena for{' '}
              <span className="bg-gradient-to-r from-[#cc97ff] via-[#A855F7] to-[#00FF87] bg-clip-text text-transparent">
                modern sports
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
              Coaching, indoor ground booking, training and performance, and equipment commerce — unified for cricket and
              badminton. Built for players, coaches, businesses, and platform stewards.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-10 py-4 font-headline text-lg font-bold uppercase tracking-[0.12em] text-[#360061] shadow-[0_0_40px_rgba(168,85,247,0.35)] transition hover:scale-[1.02] sm:w-auto"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#414859]/50 bg-[#11192c]/80 px-10 py-4 font-headline text-lg font-bold uppercase tracking-[0.1em] text-white backdrop-blur transition hover:border-[#cc97ff]/40 hover:bg-[#1c253b] sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl gap-4 sm:grid-cols-3">
            {[
              { n: '3', l: 'Portals' },
              { n: '2', l: 'Sports focus' },
              { n: '1', l: 'Ecosystem' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/[0.06] bg-[#0b1324]/80 px-6 py-8 text-center backdrop-blur-sm"
              >
                <p className="font-orbitron text-4xl font-black text-white sm:text-5xl">{s.n}</p>
                <p className="mt-2 font-headline text-xs uppercase tracking-[0.2em] text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-t border-white/[0.06] bg-[#0b1324]/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                Three portals. One ecosystem.
              </h2>
              <p className="mt-3 text-slate-400">Each experience follows a dedicated design system — unified by purpose.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {portals.map((p) => (
                <div
                  key={p.title}
                  className={`group relative overflow-hidden rounded-2xl border ${p.border} bg-gradient-to-br ${p.accent} p-8 transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.35)]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-orbitron text-[10px] uppercase tracking-[0.25em] ${p.text}`}>{p.tag}</p>
                      <h3 className="mt-2 font-headline text-2xl font-bold text-white">{p.title}</h3>
                    </div>
                    <span className={`material-symbols-outlined text-4xl opacity-80 ${p.text}`}>{p.icon}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#cc97ff]/20 bg-gradient-to-br from-[#11192c] to-[#0b1324] p-10 text-center shadow-[0_0_60px_rgba(54,0,97,0.2)] sm:p-14">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
              Ready to enter the arena?
            </h2>
            <p className="mt-4 text-slate-400">Register as a player, coach, or business owner — your dashboard awaits.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex rounded-2xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-8 py-3.5 font-headline text-sm font-bold uppercase tracking-widest text-[#360061] shadow-lg transition hover:brightness-110"
              >
                Register now
              </Link>
              <Link to="/login" className="text-sm font-medium text-[#cc97ff] underline-offset-4 hover:underline">
                Already a member? Sign in
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-slate-500">
              © Sports Ecosystem Platform · FYP26-CS-G22
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-headline uppercase tracking-widest text-slate-500">
              <Link to="/register" className="transition hover:text-[#cc97ff]">
                Join as player
              </Link>
              <Link to="/register" className="transition hover:text-[#cc97ff]">
                Join as coach
              </Link>
              <Link to="/register" className="transition hover:text-[#cc97ff]">
                Business
              </Link>
              <span className="text-slate-600">Admin access is assigned</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
