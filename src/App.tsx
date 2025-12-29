import React, { useState } from 'react';
import { ImportPanel } from './components/ImportPanel';
import { GroupManager } from './components/GroupManager';
import { Player } from '../types';
import { Snowflake } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { SupportButton } from './components/SupportButton';

const App: React.FC = () => {
  const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);

  return (
    <ToastProvider>
      <div className="min-h-screen p-4 md:p-8 flex flex-col font-sans">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3 px-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <Snowflake className="text-white" size={24} />
          </div>
          <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">WOS Manager</h1>
              <p className="text-blue-200 text-sm">Alliance Organization Tool</p>
          </div>
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

            {/* Support Button */}
            <div className="flex justify-center">
                <SupportButton variant="inline" />
            </div>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;