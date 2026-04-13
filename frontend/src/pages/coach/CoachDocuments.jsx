import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachDocuments() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/coaches/documents')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/coaches/documents', fd);
      e.target.reset();
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Certification documents</h1>
      <p className="text-sm text-slate-600 mt-1">Upload PDFs or images for admin verification.</p>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <form onSubmit={upload} className="mt-4 max-w-md space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <input type="file" name="file" required className="text-sm" />
        <input name="docType" placeholder="Document type" className="w-full rounded border px-2 py-1 text-sm" />
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
          Upload
        </button>
      </form>
      <ul className="mt-6 space-y-2">
        {list.map((d) => (
          <li key={d._id} className="text-sm border rounded-lg p-2 bg-white">
            {d.originalName} — {d.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
