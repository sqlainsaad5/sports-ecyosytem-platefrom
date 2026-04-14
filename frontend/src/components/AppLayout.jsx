import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkCls = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

const nav = {
  coach: [
    { to: '/coach', end: true, label: 'Dashboard' },
    { to: '/coach/requests', label: 'Requests' },
    { to: '/coach/sessions', label: 'Sessions' },
    { to: '/coach/plans', label: 'Weekly plans' },
    { to: '/coach/performance', label: 'Evaluations' },
    { to: '/coach/feedback', label: 'Feedback' },
    { to: '/coach/payments', label: 'Payments' },
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

  const home = () => {
    if (user?.role === 'coach') return '/coach';
    if (user?.role === 'business_owner') return '/business';
    return '/';
  };

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
