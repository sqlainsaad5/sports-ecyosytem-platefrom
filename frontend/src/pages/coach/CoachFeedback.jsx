import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachFeedback() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/coaches/feedback')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const reply = async (id) => {
    const text = prompt('Your reply');
    if (!text) return;
    try {
      await api.post(`/coaches/feedback/${id}/reply`, { reply: text });
      const { data } = await api.get('/coaches/feedback');
      setList(data.data || []);
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Player feedback</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-3">
        {list.map((f) => (
          <li key={f._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-medium">Rating {f.rating}/5</p>
            <p className="text-xs text-slate-500">{f.playerDisplay || f.player?.email || 'Player'}</p>
            <p className="text-slate-600">{f.comment}</p>
            {f.coachReply && <p className="mt-2 text-xs text-slate-500">Reply: {f.coachReply}</p>}
            <button type="button" className="mt-2 text-xs text-brand-700" onClick={() => reply(f._id)}>
              Reply
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
