import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerIcon from '../../components/player/PlayerIcon';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { statusBadge } from '../../components/player/playerClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerTraining() {
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get('/players/training-requests'),
        api.get('/players/training-sessions'),
        api.get('/players/training-plans'),
      ]);
      setRequests(a.data.data || []);
      setSessions(b.data.data || []);
      setPlans(c.data.data || []);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-10">
      <PlayerPageHeader
        title="Schedule"
        subtitle="Training requests, confirmed sessions, and weekly plans from your coach."
      />
      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <section>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide text-player-green">Requests</h2>
        <ul className="mt-4 space-y-3">
          {requests.map((r) => (
            <PlayerCard
              key={r._id}
              className="flex flex-col gap-3 py-5 text-sm transition-colors hover:bg-player-inner sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-player-highest">
                  <PlayerIcon name="person" className="text-player-green" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {r.coach?.coachProfile?.fullName || r.coach?.email || String(r.coach?._id || r.coach || '')}
                  </p>
                  <p className="mt-1 text-xs text-player-on-variant">
                    {r.preferredStart ? new Date(r.preferredStart).toLocaleString() : 'Preferred start TBD'}
                  </p>
                </div>
              </div>
              <span className={statusBadge(r.status)}>{r.status}</span>
            </PlayerCard>
          ))}
          {!requests.length ? <p className="text-sm text-player-on-variant">No requests yet.</p> : null}
        </ul>
      </section>

      <section>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide text-player-green">Sessions</h2>
        <ul className="mt-4 space-y-3">
          {sessions.map((s) => {
            const when = new Date(s.scheduledAt);
            const dateStr = when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            return (
              <PlayerCard
                key={s._id}
                className="flex flex-col gap-3 py-5 text-sm text-player-on-surface transition-colors hover:bg-player-inner sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-white">{s.coach?.coachProfile?.fullName || s.coach?.email || 'Coach'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-medium text-player-on-variant">
                    <span className="inline-flex items-center gap-1">
                      <PlayerIcon name="calendar_today" className="text-xs" />
                      {dateStr}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PlayerIcon name="schedule" className="text-xs" />
                      {timeStr}
                    </span>
                    {s.location ? (
                      <span className="inline-flex items-center gap-1">
                        <PlayerIcon name="location_on" className="text-xs" />
                        {s.location}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className={statusBadge(s.status)}>{s.status}</span>
              </PlayerCard>
            );
          })}
          {!sessions.length ? <p className="text-sm text-player-on-variant">No sessions scheduled.</p> : null}
        </ul>
      </section>

      <section>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide text-player-green">Weekly plans</h2>
        <ul className="mt-4 space-y-3">
          {plans.map((p) => (
            <PlayerCard key={p._id} className="py-4 text-sm">
              <span className="font-bold text-white">{p.title || 'Plan'}</span>
              <span className="text-player-on-variant"> — week of {new Date(p.weekStartDate).toLocaleDateString()}</span>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-player-on-variant">{p.goals || p.exercises}</pre>
            </PlayerCard>
          ))}
          {!plans.length ? <p className="text-sm text-player-on-variant">No plans published yet.</p> : null}
        </ul>
      </section>
    </div>
  );
}
