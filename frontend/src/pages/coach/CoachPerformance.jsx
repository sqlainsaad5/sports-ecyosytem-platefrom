import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachPerformance() {
  const [playerId, setPlayerId] = useState('');
  const [week, setWeek] = useState('');
  const [technique, setTechnique] = useState(70);
  const [fitness, setFitness] = useState(70);
  const [attitude, setAttitude] = useState(70);
  const [comments, setComments] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coaches/performance', {
        playerId,
        weekStartDate: new Date(week).toISOString(),
        technique,
        fitness,
        attitude,
        comments,
      });
      alert('Evaluation saved');
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Weekly performance points</h1>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Player user ID" value={playerId} onChange={(e) => setPlayerId(e.target.value)} required />
        <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm" value={week} onChange={(e) => setWeek(e.target.value)} required />
        <label className="text-xs text-slate-600">Technique {technique}</label>
        <input type="range" min={0} max={100} value={technique} onChange={(e) => setTechnique(+e.target.value)} className="w-full" />
        <label className="text-xs text-slate-600">Fitness {fitness}</label>
        <input type="range" min={0} max={100} value={fitness} onChange={(e) => setFitness(+e.target.value)} className="w-full" />
        <label className="text-xs text-slate-600">Attitude {attitude}</label>
        <input type="range" min={0} max={100} value={attitude} onChange={(e) => setAttitude(+e.target.value)} className="w-full" />
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />
        <button type="submit" className="w-full rounded-lg bg-brand-600 text-white py-2 text-sm">
          Submit evaluation
        </button>
      </form>
    </div>
  );
}
