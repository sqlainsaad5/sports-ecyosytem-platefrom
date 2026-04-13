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
      <h1 className="text-2xl font-semibold">Coach directory</h1>
      <p className="text-sm text-slate-600 mt-1">UC-B14 — partnership requests to verified coaches.</p>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-2">
        {list.map((c) => (
          <li key={c._id} className="rounded-xl border bg-white p-3 text-sm flex justify-between items-center">
            <span>{c.coachProfile?.fullName || c.email}</span>
            <button type="button" className="text-brand-700 text-xs" onClick={() => partner(c._id)}>
              Propose partnership
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
