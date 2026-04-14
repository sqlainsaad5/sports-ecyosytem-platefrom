import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerNotifications() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/players/notifications')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const mark = async (id) => {
    await api.patch(`/players/notifications/${id}/read`);
    load();
  };

  return (
    <div>
      <PlayerPageHeader title="Alerts" subtitle="Platform and training updates." />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      <PlayerCard elevate={false} className="divide-y divide-white/5 p-0">
        {list.map((n) => (
          <div
            key={n._id}
            className={`flex flex-col gap-3 p-5 transition-colors sm:flex-row sm:items-start sm:justify-between ${
              n.read ? '' : 'border-l-4 border-l-player-green bg-player-green/[0.04]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-white">{n.title}</p>
                {!n.read ? (
                  <span className="rounded-full bg-player-green/20 px-2 py-0.5 font-headline text-[8px] font-black uppercase text-player-green">
                    New
                  </span>
                ) : null}
              </div>
              {n.body ? <p className="mt-2 text-sm text-player-on-variant">{n.body}</p> : null}
              {!n.read ? (
                <button
                  type="button"
                  className="mt-3 rounded-full bg-player-highest px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-player-green hover:text-player-on-accent"
                  onClick={() => mark(n._id)}
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {!list.length && !err ? <p className="p-6 text-sm text-player-on-variant">No notifications.</p> : null}
      </PlayerCard>
    </div>
  );
}
