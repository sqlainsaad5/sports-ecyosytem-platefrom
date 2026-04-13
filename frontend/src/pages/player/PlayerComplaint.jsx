import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerComplaint() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [againstUserId, setAgainstUserId] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      await api.post('/players/complaints', {
        subject,
        description,
        againstUserId: againstUserId || undefined,
      });
      setOk('Complaint filed. An administrator will review it.');
      setSubject('');
      setDescription('');
      setAgainstUserId('');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">File a complaint</h1>
      <p className="text-slate-600 mt-1">Disputes are handled by platform administrators.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{ok}</p>}
        <div>
          <label className="text-sm font-medium">Subject</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Against user ID (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={againstUserId}
            onChange={(e) => setAgainstUserId(e.target.value)}
            placeholder="Mongo ObjectId of user"
          />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
          Submit
        </button>
      </form>
    </div>
  );
}
