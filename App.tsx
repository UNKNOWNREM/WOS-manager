import React, { useState } from 'react';
import { ImportPanel } from './src/components/ImportPanel';
import { GroupManager } from './src/components/GroupManager';
import { Player } from './types';
import { Snowflake, Award } from 'lucide-react';
import { ToastProvider } from './src/components/ui/Toast';
import { SupportButton, SourceCodeButton } from './src/components/SupportButton';

const App: React.FC = () => {
  const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);

  return (
    <ToastProvider>
      <div className="min-h-screen p-4 md:p-8 flex flex-col font-sans">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <Snowflake className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">WOS Manager</h1>
                <p className="text-blue-200 text-sm">Alliance Organization Tool</p>
            </div>
          </div>
          <a
            href="/ranks.html"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg hover:shadow-purple-600/50"
            title="Go to Rank Manager"
          >
            <Award size={20} />
            <span className="hidden sm:inline">Rank Manager</span>
          </a>
        </header>

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
