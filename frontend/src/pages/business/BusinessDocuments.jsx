import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessDocuments() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/business/documents')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/business/documents', fd);
      e.target.reset();
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Verification documents</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <form onSubmit={upload} className="mt-4 max-w-md space-y-2 rounded-xl border bg-white p-4">
        <input type="file" name="file" required className="text-sm" />
        <input name="docType" placeholder="Document type" className="w-full border rounded px-2 py-1 text-sm" />
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
          Upload
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {list.map((d) => (
          <li key={d._id} className="text-sm border rounded p-2 bg-white">
            {d.originalName} — {d.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
