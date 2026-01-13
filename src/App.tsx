import React, { useState } from 'react';
import { ImportPanel } from './components/ImportPanel';
import { GroupManager } from './components/GroupManager';
import { Player } from '../types';
import { Snowflake, Map, Trophy, Settings } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { SupportButton, SourceCodeButton } from './components/SupportButton';
import { Header } from './components/common/Header';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';

const App: React.FC = () => {
  const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        {/* Header */}
        <Header
          title="WOS Manager"
          subtitle="Alliance Organization Tool"
          icon={<Snowflake size={24} />}
          actions={
            <>
              <LanguageSwitcher />
              <a href="/map.html" className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm text-slate-200">
                <Map size={16} /> Map
              </a>
              <a href="/ranks.html" className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm text-slate-200">
                <Trophy size={16} /> Ranks
              </a>
              <a href="/admin.html" className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm text-slate-200">
                <Settings size={16} /> Admin
              </a>
            </>
          }
        />

        {/* Main Content Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Left Panel: Import & Search (3 cols) */}
          <section className="lg:col-span-3 h-full min-h-[400px]">
            <ImportPanel foundPlayers={foundPlayers} setFoundPlayers={setFoundPlayers} />
          </section>

          {/* Right Panel: Workspace (9 cols) */}
          <section className="lg:col-span-9 h-full min-h-[400px]">
            <GroupManager />
          </section>
        </main>

        <footer className="mt-4 text-center">
          <div className="text-white/20 text-xs mb-4">
            Data stored locally in browser. Drag and drop players to organize.
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <SourceCodeButton variant="inline" />
            <SupportButton variant="inline" />
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;