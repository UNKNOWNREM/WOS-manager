import React, { useState, useEffect } from 'react';
import { ImportPanel } from './components/ImportPanel';
import { GroupManager } from './components/GroupManager';
import { Player } from '../types';
import { Snowflake, Map, Trophy, Settings } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { SupportButton, SourceCodeButton } from './components/SupportButton';
import { Header } from './components/common/Header';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { Footer } from './components/common/Footer';
import { migrateStorage } from './utils/storageMigration';

const App: React.FC = () => {
  const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);

  useEffect(() => {
    migrateStorage();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen text-slate-100 flex flex-col font-sans">
        {/* Header */}
        <Header
          title="WOS Manager"
          subtitle="Alliance Organization Tool"
          icon={<Snowflake size={24} className="text-pink-cyan" />}
          actions={
            <>
              <LanguageSwitcher />
              <a href="/map.html" className="flex items-center gap-2 px-3 py-2 bg-grad-smoke-light hover:brightness-110 rounded-lg transition-all shadow-lg hover:shadow-smoke-light/50 text-sm text-white" aria-label="Open Map">
                <Map size={16} /> Map
              </a>
              <a href="/ranks.html" className="flex items-center gap-2 px-3 py-2 bg-grad-smoke-light hover:brightness-110 rounded-lg transition-all shadow-lg hover:shadow-smoke-light/50 text-sm text-white" aria-label="Open Ranks">
                <Trophy size={16} /> Ranks
              </a>
              <a href="/admin.html" className="flex items-center gap-2 px-3 py-2 bg-grad-smoke-light hover:brightness-110 rounded-lg transition-all shadow-lg hover:shadow-smoke-light/50 text-sm text-white" aria-label="Open Admin">
                <Settings size={16} /> Admin
              </a>
            </>
          }
        />

        {/* Main Content Grid - Added px-6 for better margins */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[700px] h-auto px-6">
          {/* Left Panel: Import & Search (3 cols) */}
          <section className="lg:col-span-3 h-full min-h-[400px]">
            <ImportPanel foundPlayers={foundPlayers} setFoundPlayers={setFoundPlayers} />
          </section>

          {/* Right Panel: Workspace (9 cols) */}
          <section className="lg:col-span-9 h-full min-h-[400px]">
            <GroupManager />
          </section>
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;