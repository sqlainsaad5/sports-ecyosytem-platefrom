import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeaderNotificationBell from './HeaderNotificationBell';

const linkCls = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

const nav = {
  coach: [
    { to: '/coach', end: true, label: 'Dashboard' },
    { to: '/coach/requests', label: 'Requests' },
    { to: '/coach/sessions', label: 'Sessions' },
    { to: '/coach/plans', label: 'Weekly plans' },
    { to: '/coach/performance', label: 'Evaluations' },
    { to: '/coach/matches', label: 'Matches' },
    { to: '/coach/feedback', label: 'Feedback' },
    { to: '/coach/payments', label: 'Payments' },
    { to: '/coach/notifications', label: 'Notifications' },
    { to: '/coach/documents', label: 'Documents' },
  ],
  business_owner: [
    { to: '/business', end: true, label: 'Dashboard' },
    { to: '/business/products', label: 'Products' },
    { to: '/business/orders', label: 'Orders' },
    { to: '/business/subscription', label: 'Subscription' },
    { to: '/business/coaches', label: 'Coach partners' },
    { to: '/business/notifications', label: 'Notifications' },
    { to: '/business/documents', label: 'Documents' },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = nav[user?.role] || [];
  const isCoach = user?.role === 'coach';
  const isBusiness = user?.role === 'business_owner';

  const home = () => {
    if (user?.role === 'coach') return '/coach';
    if (user?.role === 'business_owner') return '/business';
    return '/';
  };

  if (isCoach) {
    return (
      <div className="player-app relative min-h-screen bg-player-bg pb-16 md:pb-0">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#FF6B00]/20 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.02] [background-image:radial-gradient(#fff_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
        </div>
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-[#080D1A] shadow-player-sidebar md:flex">
          <div className="px-6 pb-8 pt-8">
            <p className="font-display text-3xl tracking-[0.12em] text-[#FF6B00]">COACH PORTAL</p>
            <p className="font-headline text-[11px] uppercase tracking-[0.25em] text-slate-500">Elite Performance</p>
          </div>
          <nav className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-4 text-sm font-headline font-bold uppercase tracking-[0.16em] transition-all ${
                    isActive
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00] border-r-4 border-[#FF6B00]'
                      : 'text-slate-500 hover:bg-player-inner hover:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {item.label === 'Dashboard'
                    ? 'dashboard'
                    : item.label === 'Requests'
                      ? 'pending_actions'
                      : item.label === 'Sessions'
                        ? 'calendar_month'
                        : item.label === 'Weekly plans'
                          ? 'fitness_center'
                          : item.label === 'Evaluations'
                            ? 'analytics'
                            : item.label === 'Feedback'
                              ? 'strategy'
                              : item.label === 'Payments'
                                ? 'payments'
                                : 'verified'}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex w-full items-center justify-center gap-2 bg-[#FF6B00] py-3 font-display text-xl tracking-[0.18em] text-black transition hover:brightness-110"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              LOG OUT
            </button>
          </div>
        </aside>

        <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-player-inner/60 bg-[#080D1A]/85 px-4 backdrop-blur-xl md:left-64 md:px-8">
          <div className="flex h-full items-center justify-between">
            <p className="font-display text-3xl tracking-[0.1em] text-[#FF6B00]">MIDNIGHT STADIUM</p>
            <div className="flex items-center gap-4">
              <HeaderNotificationBell to="/coach/notifications" listPath="/coaches/notifications" />
              <div className="hidden text-right md:block">
                <p className="text-xs font-headline uppercase tracking-[0.15em] text-slate-300">{user?.email}</p>
                <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-[#FF6B00]">Coach Access</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-24 md:ml-64">
          <div className="mx-auto w-full max-w-[1300px] px-4 pb-10 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  if (isBusiness) {
    return (
      <div className="relative min-h-screen bg-[#070e1d] text-[#dfe5fb]">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-16 right-0 h-80 w-80 rounded-full bg-[#A855F7]/20 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#fff_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
        </div>
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[240px] flex-col bg-[#0b1324] md:flex">
          <div className="px-6 py-8">
            <p className="font-headline text-3xl font-black uppercase tracking-tight text-[#A855F7]">Sports Ecosystem</p>
            <p className="mt-1 font-body text-[10px] uppercase tracking-[0.2em] text-slate-500">Elite Management</p>
          </div>
          <nav className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    isActive ? 'border-l-4 border-[#A855F7] bg-[#11192c] text-[#A855F7]' : 'text-slate-400 hover:bg-[#1c253b] hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {item.label === 'Dashboard'
                    ? 'dashboard'
                    : item.label === 'Products'
                      ? 'inventory_2'
                      : item.label === 'Orders'
                        ? 'payments'
                        : item.label === 'Subscription'
                          ? 'subscriptions'
                          : item.label === 'Coach partners'
                            ? 'hub'
                            : item.label === 'Notifications'
                              ? 'notifications'
                              : 'settings'}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto p-4">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full rounded-lg bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.16em] text-[#360061]"
            >
              Log Out
            </button>
          </div>
        </aside>
        <header className="fixed left-0 right-0 top-0 z-40 bg-[#070e1d]/80 px-8 py-4 shadow-[0_4px_24px_rgba(54,0,97,0.08)] backdrop-blur-xl md:left-[240px]">
          <div className="flex items-center justify-between">
            <div className="relative hidden w-full max-w-md lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input className="w-full rounded-xl border-none bg-black/40 py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]" placeholder="Search Ecosystem..." />
            </div>
            <div className="ml-auto flex items-center gap-4 text-slate-400">
              <HeaderNotificationBell
                to="/business/notifications"
                listPath="/business/notifications"
                badgeClassName="bg-[#A855F7] text-white"
              />
              <span className="material-symbols-outlined">help</span>
            </div>
          </div>
        </header>
        <main className="relative z-10 min-h-screen px-6 pb-10 pt-24 md:ml-[240px] md:px-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100">
          <Link to={home()} className="text-lg font-semibold text-brand-700">
            Sports Ecosystem
          </Link>
          <p className="text-xs text-slate-500 mt-1 truncate">{user?.email}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role?.replace('_', ' ')}</p>
        </div>
        <nav className="p-2 flex flex-row flex-wrap md:flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
