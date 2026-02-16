/**
 * Header with tab navigation for Certificate Automation Platform.
 */
export default function Dashboard({ activeTab, onTabChange }) {
  return (
    <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Certificate & Automation Platform
        </h1>
        <nav className="flex gap-1 mt-5 rounded-lg bg-slate-800/60 p-1 w-fit">
          <button
            type="button"
            onClick={() => onTabChange('single')}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'single'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
            }`}
          >
            Single Certificate
          </button>
          <button
            type="button"
            onClick={() => onTabChange('bulk')}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'bulk'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
            }`}
          >
            Bulk Upload (CSV)
          </button>
        </nav>
      </div>
    </header>
  );
}
