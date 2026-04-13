import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachPlans() {
  const [list, setList] = useState([]);
  const [player, setPlayer] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [title, setTitle] = useState('');
  const [goals, setGoals] = useState('');
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/coaches/training-plans')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coaches/training-plans', {
        player,
        weekStartDate: new Date(weekStart).toISOString(),
        title,
        goals,
      });
      setTitle('');
      setGoals('');
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Weekly training plans</h1>
        {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      </div>
      <form onSubmit={create} className="max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">Create plan</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Player user ID"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          required
        />
        <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Goals / exercises" value={goals} onChange={(e) => setGoals(e.target.value)} />
        <button type="submit" className="w-full rounded-lg bg-brand-600 text-white py-2 text-sm">
          Publish plan
        </button>
      </form>
      <ul className="space-y-2">
        {list.map((p) => (
          <li key={p._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <span className="font-medium">{p.title}</span> — player {p.player}
            <pre className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{p.goals}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
