import { useState, useRef } from 'react';
import { api } from '../api/client';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file.' });
      return;
    }
    if (file.name && !file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Only CSV files are allowed.' });
      return;
    }
    setLoading(true);
    setResult(null);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await api.bulkGenerate(formData);
      setResult(data);
      setMessage({
        type: 'success',
        text: `Processed ${data.total} participants. ${data.succeeded} succeeded, ${data.failed} failed.`,
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.data?.message || err.message || 'Bulk generate failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white overflow-hidden">
     
      <div className="p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Bulk Certificate Upload</h2>
        <p className="text-slate-600 text-sm mb-6">
          Upload a CSV with columns: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">name</code>,{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">email</code>. Certificates will be generated and emailed for each row.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">CSV File</label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-teal-50 file:px-4 file:py-2.5 file:text-teal-700 file:font-medium file:shadow-sm"
            />
            {file && <p className="mt-1 text-xs text-slate-500">{file.name}</p>}
          </div>
          {message.text && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-red-50 text-red-800 border border-red-200/80'
              }`}
            >
              {message.text}
            </div>
          )}
          {result && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
              <p className="font-medium text-slate-800 mb-2">Summary</p>
              <ul className="space-y-1 text-slate-600">
                <li>Total: {result.total}</li>
                <li className="text-emerald-600">Succeeded: {result.succeeded}</li>
                {result.failed > 0 && (
                  <li className="text-red-600">Failed: {result.failed}</li>
                )}
              </ul>
              {result.results?.failure?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="font-medium text-slate-700 mb-1">Failed entries</p>
                  <ul className="text-xs text-red-700 space-y-0.5">
                    {result.results.failure.map((f, i) => (
                      <li key={i}>
                        {f.email} – {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Processing…' : 'Generate & Email Certificates'}
          </button>
        </form>
      </div>
    </section>
  );
}
