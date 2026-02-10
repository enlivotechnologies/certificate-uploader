import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SingleCertificateForm from './components/SingleCertificateForm';
import BulkUpload from './components/BulkUpload';

function App() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="min-h-screen bg-white">
      <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {activeTab === 'single' && <SingleCertificateForm />}
        {activeTab === 'bulk' && <BulkUpload />}
      </main>
    </div>
  );
}

export default App;
