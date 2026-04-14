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
      <h1 className="font-display text-5xl tracking-[0.08em] text-white">PLAYER FEEDBACK</h1>
      <p className="font-headline text-xs uppercase tracking-[0.3em] text-[#ff7524]">SRS UC-C11 — ratings &amp; replies</p>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {list.map((f) => (
          <li key={f._id} className="midnight-asymmetric border-l-4 border-transparent bg-player-container p-5 transition hover:border-[#ff7524] hover:bg-player-surface">
            <p className="font-display text-3xl text-white">{f.playerDisplay || f.player?.email || 'Player'}</p>
            <p className="mt-1 inline-flex rounded-sm bg-player-green/10 px-2 py-0.5 text-[10px] font-orbitron uppercase tracking-wider text-player-green">
              Rating {f.rating}/5
            </p>
            <p className="mt-4 text-sm italic text-slate-300">"{f.comment}"</p>
            {f.coachReply && <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Reply: {f.coachReply}</p>}
            <button type="button" className="mt-4 bg-[#ff7524] px-4 py-2 font-display text-lg tracking-[0.12em] text-black" onClick={() => reply(f._id)}>
              SEND REPLY
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
