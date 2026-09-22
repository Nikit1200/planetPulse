import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import History from './pages/History';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf8] text-[#17211b] selection:bg-forest-200 selection:text-forest-950 font-sans">
      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Content Viewport with subtle entrance animation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<LogActivity />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Modernized Climate-Tech Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white/70 backdrop-blur-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p className="font-semibold text-gray-700">
            PlanetPulse © 2026 • Real-World AI Products (Climate Tech)
          </p>
          <p className="text-gray-400 font-medium">
            Authoritative Monday–Sunday cycle • IPCC & EPA conversion factors
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
