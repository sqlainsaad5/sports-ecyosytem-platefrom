import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessCoaches() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/business/coaches')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const partner = async (id) => {
    const message = prompt('Partnership / sponsorship message');
    if (!message) return;
    try {
      await api.post(`/business/coaches/${id}/partnership`, { message });
      alert('Request sent');
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">Coach Directory</h1>
      <p className="text-sm text-slate-400 mt-1">UC-B14 - partnership requests to verified coaches.</p>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <li key={c._id} className="rounded-xl bg-[#11192c] p-4 text-sm">
            <p className="font-rajdhani text-2xl font-bold text-white">{c.coachProfile?.fullName || c.email}</p>
            <button type="button" className="mt-4 rounded-lg border border-[#cc97ff] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#cc97ff] hover:bg-[#cc97ff] hover:text-[#360061]" onClick={() => partner(c._id)}>
              Propose partnership
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
