import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileInput, AlertCircle, Copy, ChevronDown, ChevronUp, Users, Trash2, Home } from 'lucide-react';
import { Player, RankPlayer, RankLevel, ImportStatus } from '../../types';
import { fetchPlayer, sleep } from '../../services/api';
import { RankPlayerCard } from './RankPlayerCard';
import { SupportButton, SourceCodeButton } from './SupportButton';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { Header } from './common/Header';
import { Footer } from './common/Footer';

const RANK_CONFIG = [
  { id: 'R4' as RankLevel, name: 'Co-Leader', color: 'bg-grad-smoke-light text-white' }, // Set 2 #3 烟光
  { id: 'R3' as RankLevel, name: 'Rank 3', color: 'bg-grad-mountain-mist text-white' }, // Set 2 #4 岳霞
  { id: 'R2' as RankLevel, name: 'Rank 2', color: 'bg-grad-grey-moon text-white' }, // Set 1 #3 灰月
  { id: 'R1' as RankLevel, name: 'Rank 1', color: 'bg-grad-star-frost text-white/90' }, // Set 2 #5 星霜
];

export const RankManager: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [singleId, setSingleId] = useState('');
  const [batchText, setBatchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<RankPlayer[]>([]);
  const [collapsedRanks, setCollapsedRanks] = useState<Set<RankLevel>>(new Set());
  const [status, setStatus] = useState<ImportStatus>({
    total: 0,
    current: 0,
    success: 0,
    failed: 0,
    failedIds: [],
    isImporting: false,
  });

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wos-rank-players');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load players:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wos-rank-players', JSON.stringify(players));
  }, [players]);

  const handleSingleSearch = async () => {
    if (!singleId.trim()) return;
    setStatus({ ...status, isImporting: true });
    try {
      const player = await fetchPlayer(singleId.trim());
      const rankPlayer: RankPlayer = { ...player, rank: 'R1' }; // Default to R1
      setPlayers(prev => {
        const filtered = prev.filter(p => p.fid !== rankPlayer.fid);
        return [...filtered, rankPlayer];
      });
      setSingleId('');
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setStatus({ ...status, isImporting: false });
    }
  };

  const handleBatchImport = async () => {
    const ids = batchText.split(/[\n,]/).map(s => s.trim()).filter(s => s);
    if (ids.length === 0) return;

    const uniqueIds = Array.from(new Set(ids));

    setStatus({
      total: uniqueIds.length,
      current: 0,
      success: 0,
      failed: 0,
      failedIds: [],
      isImporting: true,
    });

    const newPlayers: RankPlayer[] = [];
    const failed: string[] = [];

    for (let i = 0; i < uniqueIds.length; i++) {
      const id = uniqueIds[i];
      try {
        const player = await fetchPlayer(id);
        newPlayers.push({ ...player, rank: 'R1' }); // Default to R1
        setStatus(prev => ({ ...prev, current: i + 1, success: prev.success + 1 }));
      } catch (e) {
        console.warn(`Failed to fetch ${id}`, e);
        failed.push(id);
        setStatus(prev => ({
          ...prev,
          current: i + 1,
          failed: prev.failed + 1,
          failedIds: [...prev.failedIds, id]
        }));
      }
      if (i < uniqueIds.length - 1) await sleep(250);
    }

    setPlayers(prev => {
      const existingIds = new Set(prev.map(p => p.fid));
      const uniqueNew = newPlayers.filter(p => !existingIds.has(p.fid));
      return [...prev, ...uniqueNew];
    });

    setStatus(prev => ({ ...prev, isImporting: false }));

    // Auto-close progress after 2 seconds
    setTimeout(() => {
      setStatus({
        total: 0,
        current: 0,
        success: 0,
        failed: 0,
        failedIds: [],
        isImporting: false,
      });
    }, 2000);
  };

  const handleRankChange = (fid: string, newRank: RankLevel) => {
    setPlayers(prev => prev.map(p =>
      p.fid === fid ? { ...p, rank: newRank } : p
    ));
  };

  const handleRemovePlayer = (fid: string) => {
    setPlayers(prev => prev.filter(p => p.fid !== fid));
  };

  const handleClearAll = () => {
    if (players.length === 0) return;
    if (confirm(`Are you sure you want to remove all ${players.length} players?`)) {
      setPlayers([]);
    }
  };

  const toggleRankCollapse = (rankId: RankLevel) => {
    setCollapsedRanks(prev => {
      const next = new Set(prev);
      if (next.has(rankId)) {
        next.delete(rankId);
      } else {
        next.add(rankId);
      }
      return next;
    });
  };

  const handleCopyRankIds = async (rankId: RankLevel) => {
    const rankPlayers = players.filter(p => p.rank === rankId);
    if (rankPlayers.length === 0) {
      alert('No players in this rank');
      return;
    }
    const ids = rankPlayers.map(p => p.fid).join(', ');
    try {
      await navigator.clipboard.writeText(ids);
      alert(`Copied ${rankPlayers.length} player IDs`);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Copy failed');
    }
  };

  // Filter players by search query
  const filteredPlayers = players.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return player.nickname?.toLowerCase().includes(query) ||
      String(player.fid).toLowerCase().includes(query);
  });

  // Group players by rank
  const playersByRank = RANK_CONFIG.map(rank => ({
    ...rank,
    players: filteredPlayers.filter(p => p.rank === rank.id)
  }));

  const totalOnline = players.length;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100">
      {/* Header */}
      <Header
        title="WOS Rank Manager"
        subtitle={
          <div className="flex items-center gap-2">
            <span>Alliance Rank Management System</span>
            <span className="text-pink-cyan text-xs bg-slate-900/40 px-2 py-0.5 rounded border border-pink-cyan/30">
              Members: {totalOnline}
            </span>
          </div>
        }
        icon={<Users size={24} />}
        actions={
          <>
            <LanguageSwitcher />

            {players.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 rounded-lg transition-colors text-sm whitespace-nowrap"
                title="Clear all players"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-600/50 text-sm whitespace-nowrap"
              title="Back to Home"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </a>
          </>
        }
      />

      <main className="flex-1 p-4 md:p-8 min-h-0">
        {/* ... (keep existing main content) ... */}
        {/* Search and Import Panel */}
        <div className="glass-panel rounded-xl p-4 mb-6 max-w-2xl mx-auto w-full">
          {/* ... content ... */}
          <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-lg">
            {/* ... content ... */}
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'single' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              Single Search
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'batch' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              Batch Import
            </button>
          </div>

          {mode === 'single' ? (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={singleId}
                onChange={(e) => setSingleId(e.target.value)}
                placeholder="Enter Player FID"
                className="flex-1 min-w-0 bg-black/30 border border-cloud/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-cyan transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleSingleSearch()}
              />
              <button
                onClick={handleSingleSearch}
                disabled={status.isImporting}
                className="w-10 h-10 shrink-0 flex items-center justify-center bg-smoke-light hover:bg-smoke-light/80 text-white rounded-lg transition-colors disabled:opacity-50"
                aria-label="Search Player"
              >
                {status.isImporting ? <Loader2 className="animate-spin size-5" /> : <Search size={20} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Paste IDs here (comma or newline separated)..."
                className="w-full h-24 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs font-mono resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {batchText ? batchText.split(/[\n,]/).filter(s => s.trim()).length : 0} IDs detected
                </span>
                <button
                  onClick={handleBatchImport}
                  disabled={status.isImporting || !batchText}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {status.isImporting ? <Loader2 className="animate-spin size-4" /> : <FileInput size={16} />}
                  Start Import
                </button>
              </div>
            </div>
          )}

          {/* Status Area */}
          {status.isImporting || status.total > 0 ? (
            <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs">
              <div className="flex justify-between mb-2 text-gray-300">
                <span>Progress: {status.current}/{status.total}</span>
                {status.isImporting && <Loader2 className="animate-spin size-3" />}
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${(status.current / (status.total || 1)) * 100}%` }}
                />
              </div>

              {!status.isImporting && status.failed > 0 && (
                <div className="mt-2 flex items-start gap-2 text-red-300">
                  <AlertCircle size={14} className="mt-0.5" />
                  <div className="flex-1">
                    <p>Failed: {status.failed}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(status.failedIds.join('\n'))}
                      className="underline hover:text-white flex items-center gap-1"
                    >
                      <Copy size={10} /> Copy Failed IDs
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Search Box */}
          {players.length > 0 && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Nickname or FID..."
                className="w-full bg-black/30 border border-cloud/20 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-pink-cyan transition-colors"
              />
              {searchQuery && (
                <div className="mt-1 text-xs text-gray-400">
                  Showing {filteredPlayers.length} / {players.length} players
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rank Sections */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {playersByRank.map(rank => (
            <div key={rank.id} className="glass-panel rounded-xl overflow-hidden">
              {/* Rank Header */}
              <div className={`px-4 py-3 ${rank.color} flex items-center justify-between`}>
                <button
                  onClick={() => toggleRankCollapse(rank.id)}
                  className="flex items-center gap-3 flex-1 hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold bg-black/30 px-2 py-1 rounded">{rank.id}</span>
                  <span className="font-semibold text-white">{rank.name}</span>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Users size={14} />
                    <span>{rank.players.length}</span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {/* Copy IDs Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyRankIds(rank.id);
                    }}
                    className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
                    title="Copy all IDs in this rank"
                    aria-label={`Copy all ${rank.name} IDs`}
                  >
                    <Copy size={16} />
                  </button>

                  {/* Collapse Toggle */}
                  <button
                    onClick={() => toggleRankCollapse(rank.id)}
                    className="text-white hover:text-white/80 transition-colors"
                    aria-label={collapsedRanks.has(rank.id) ? "Expand Rank" : "Collapse Rank"}
                  >
                    {collapsedRanks.has(rank.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronUp size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Players List */}
              {!collapsedRanks.has(rank.id) && (
                <div className="p-3 space-y-2 bg-black/10">
                  {rank.players.length === 0 ? (
                    <div className="text-center text-slate-400 py-8 text-sm">
                      No members in this rank
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rank.players.map(player => (
                        <RankPlayerCard
                          key={player.fid}
                          player={player}
                          onRemove={handleRemovePlayer}
                          onRankChange={handleRankChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center text-white/30 py-12 text-sm">
            No players added yet. Use search or import above to begin.
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
