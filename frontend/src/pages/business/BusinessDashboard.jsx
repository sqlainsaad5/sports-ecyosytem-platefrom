import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessDashboard() {
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/business/me/profile')
      .then((r) => setP(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-semibold">Business dashboard</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      {p && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-1">
          <p>
            <span className="text-slate-500">Store:</span> {p.storeName}
          </p>
          <p>
            <span className="text-slate-500">Package:</span> {p.subscriptionPackage}
          </p>
          <p>
            <span className="text-slate-500">Listing slots left:</span> {p.listingSlotsRemaining}
          </p>
          <Link to="/business/subscription" className="text-brand-700 inline-block mt-2">
            Manage subscription
          </Link>
        </div>
      )}
    </div>
  );
}
