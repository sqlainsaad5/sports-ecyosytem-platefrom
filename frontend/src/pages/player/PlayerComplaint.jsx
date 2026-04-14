import { useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnPrimary, playerField, playerLabel } from '../../components/player/playerClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerComplaint() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [againstUserId, setAgainstUserId] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      await api.post('/players/complaints', {
        subject,
        description,
        againstUserId: againstUserId || undefined,
      });
      setOk('Complaint filed. An administrator will review it.');
      setSubject('');
      setDescription('');
      setAgainstUserId('');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="max-w-lg">
      <PlayerPageHeader title="Support" subtitle="Disputes are handled by platform administrators." />
      <PlayerCard>
        <form onSubmit={submit} className="space-y-4">
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          {ok ? (
            <p className="rounded-2xl bg-player-green/15 px-3 py-2 text-sm text-player-green">{ok}</p>
          ) : null}
          <div>
            <label className={playerLabel}>Subject</label>
            <input className={`${playerField} mt-2`} value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className={playerLabel}>Description</label>
            <textarea
              className={`${playerField} mt-2 min-h-[100px]`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={playerLabel}>Against user ID (optional)</label>
            <input
              className={`${playerField} mt-2`}
              value={againstUserId}
              onChange={(e) => setAgainstUserId(e.target.value)}
              placeholder="Mongo ObjectId of user"
            />
          </div>
          <button type="submit" className={playerBtnPrimary}>
            Submit
          </button>
        </form>
      </PlayerCard>
    </div>
  );
}
