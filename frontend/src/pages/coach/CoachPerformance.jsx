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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl tracking-[0.08em] text-white">PERFORMANCE EVALUATION</h1>
        <p className="font-headline text-xs uppercase tracking-[0.28em] text-[#ff7524]">Data-driven assessment</p>
      </div>
      <form onSubmit={submit} className="midnight-asymmetric max-w-3xl space-y-4 bg-player-container p-6 shadow-player-card">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="w-full border-b-2 border-player-inner bg-player-bg px-3 py-2 text-sm text-white outline-none focus:border-[#ff7524]" placeholder="Player user ID" value={playerId} onChange={(e) => setPlayerId(e.target.value)} required />
          <input type="date" className="w-full border-b-2 border-player-inner bg-player-bg px-3 py-2 text-sm text-white outline-none focus:border-[#ff7524]" value={week} onChange={(e) => setWeek(e.target.value)} required />
        </div>
        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Technique {technique}</label>
        <input type="range" min={0} max={100} value={technique} onChange={(e) => setTechnique(+e.target.value)} className="w-full accent-[#ff7524]" />
        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Fitness {fitness}</label>
        <input type="range" min={0} max={100} value={fitness} onChange={(e) => setFitness(+e.target.value)} className="w-full accent-[#ff7524]" />
        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Attitude {attitude}</label>
        <input type="range" min={0} max={100} value={attitude} onChange={(e) => setAttitude(+e.target.value)} className="w-full accent-[#ff7524]" />
        <textarea className="h-28 w-full border-b-2 border-player-inner bg-player-bg px-3 py-2 text-sm text-white outline-none focus:border-[#ff7524]" placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />
        <button type="submit" className="bg-[#ff7524] px-8 py-3 font-display text-2xl tracking-[0.14em] text-black">
          SUBMIT EVALUATION
        </button>
      </form>
    </div>
  );
}
