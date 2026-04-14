import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

/**
 * Header bell linking to role notifications; shows unread count from GET list.
 */
export default function HeaderNotificationBell({
  to,
  listPath,
  iconClassName = 'material-symbols-outlined text-slate-400',
  badgeClassName = 'bg-[#FF6B00] text-black',
}) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    api
      .get(listPath)
      .then((r) => {
        const list = r.data.data || [];
        setUnread(list.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, [listPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refresh]);

  return (
    <Link
      to={to}
      className="relative inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
      aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
    >
      <span className={iconClassName}>notifications</span>
      {unread > 0 ? (
        <span
          className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 font-orbitron text-[10px] font-bold leading-none ${badgeClassName}`}
        >
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
