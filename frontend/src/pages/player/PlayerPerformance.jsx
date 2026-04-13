import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerPerformance() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/players/performance')
      .then((r) => setRows(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Performance & progress</h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2">Week</th>
              <th className="px-4 py-2">Technique</th>
              <th className="px-4 py-2">Fitness</th>
              <th className="px-4 py-2">Attitude</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{new Date(r.weekStartDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.technique}</td>
                <td className="px-4 py-2">{r.fitness}</td>
                <td className="px-4 py-2">{r.attitude}</td>
                <td className="px-4 py-2 text-slate-600">{r.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && !err && (
          <p className="p-4 text-slate-500">No evaluations recorded yet.</p>
        )}
      </div>
    </div>
  );
}
