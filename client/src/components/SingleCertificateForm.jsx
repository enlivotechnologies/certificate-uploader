import { useState } from 'react';
import { api } from '../api/client';

export default function SingleCertificateForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.email?.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.generateCertificate({
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setMessage({ type: 'success', text: 'Certificate generated and emailed successfully.' });
      setForm({ name: '', email: '' });
    } catch (err) {
      const text = [err?.data?.message, err?.message, 'Failed to generate certificate.'].find(Boolean);
      setMessage({ type: 'error', text: String(text || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-xl overflow-hidden">
      
      <div className="p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Generate Single Certificate</h2>
        <p className="text-slate-600 text-sm mb-6">
          Enter participant name and email. The certificate will be generated and sent automatically.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Participant Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-colors"
              placeholder="Enter participant name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-colors"
              placeholder="Enter email address"
            />
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Generating & Sending…' : 'Generate & Email Certificate'}
          </button>
        </form>
      </div>
    </section>
  );
}
