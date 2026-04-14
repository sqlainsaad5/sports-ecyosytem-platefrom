import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnSm, playerField, playerLabel } from '../../components/player/playerClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerCoaches() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/players/recommendations');
      setList(data.data || []);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const requestTraining = async (id) => {
    setErr('');
    try {
      await api.post('/players/training-requests', { coachId: id, message: msg || 'I would like to train with you.' });
      setMsg('');
      alert('Request sent.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PlayerPageHeader
        title="Coach match"
        subtitle="Verified coaches matched to your sport, skill, and city."
      />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      <PlayerCard className="mb-6 max-w-xl">
        <label className={playerLabel}>Optional message (all requests)</label>
        <input
          className={`${playerField} mt-2`}
          placeholder="I would like to train with you."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
      </PlayerCard>
      <ul className="space-y-4">
        {list.map((row) => (
          <PlayerCard key={row.userId} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-white">{row.profile?.fullName}</p>
              <p className="mt-1 text-sm text-player-on-variant">
                {row.profile?.specialties?.join(', ')} · {row.profile?.city || '—'}
              </p>
              <p className="mt-2 text-xs text-player-on-variant/70">
                Match score: {row.matchScore?.toFixed?.(1) ?? row.matchScore}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-52">
              <button type="button" onClick={() => requestTraining(row.userId)} className={playerBtnSm}>
                Request training
              </button>
            </div>
          </PlayerCard>
        ))}
        {!list.length && !err ? (
          <p className="text-sm text-player-on-variant">No coaches yet — complete your profile or wait for verifications.</p>
        ) : null}
      </ul>
    </div>
  );
}
