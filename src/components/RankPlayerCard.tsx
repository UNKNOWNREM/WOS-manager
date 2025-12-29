import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RankPlayer, RankLevel } from '../../types';
import { Copy, Check, User, Hash, ArrowUpDown, X } from 'lucide-react';

interface RankPlayerCardProps {
  player: RankPlayer;
  onRemove?: (fid: string) => void;
  onRankChange?: (fid: string, newRank: RankLevel) => void;
}

export const RankPlayerCard: React.FC<RankPlayerCardProps> = ({ player, onRankChange, onRemove }) => {
  const [iconError, setIconError] = useState(false);
  const [copiedField, setCopiedField] = useState<'id' | 'name' | 'both' | null>(null);
  const [showRankDialog, setShowRankDialog] = useState(false);

  const RANKS: { id: RankLevel; name: string }[] = [
    { id: 'R4', name: 'Co-Leader' },
    { id: 'R3', name: 'Rank 3' },
    { id: 'R2', name: 'Rank 2' },
    { id: 'R1', name: 'Rank 1' },
  ];

  const handleCopy = async (type: 'id' | 'name' | 'both') => {
    let textToCopy = '';

    switch (type) {
      case 'id':
        textToCopy = String(player.fid);
        break;
      case 'name':
        textToCopy = player.nickname;
        break;
      case 'both':
        textToCopy = `${player.nickname} (${player.fid})`;
        break;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Parse stove_lv_content to get the fire crystal level
  const getFurnaceDisplay = (stoveLevel: number, stoveLvContent: string) => {
    if (!stoveLvContent || typeof stoveLvContent !== 'string') {
      return { type: 'text', value: stoveLevel };
    }

    const urlMatch = stoveLvContent.match(/stove_lv_(\d+)\.png/i);

    if (urlMatch) {
      const fireLevel = parseInt(urlMatch[1], 10);
      if (fireLevel >= 1 && fireLevel <= 10) {
        return {
          type: 'image',
          fireLevel,
          url: `/assets/furnace/stove_lv_${fireLevel}.png`
        };
      }
    }

    return { type: 'text', value: stoveLevel };
  };

  const furnaceDisplay = getFurnaceDisplay(player.stove_lv, player.stove_lv_content);

  const handleRankSelect = (newRank: RankLevel) => {
    if (onRankChange) {
      onRankChange(player.fid, newRank);
    }
    setShowRankDialog(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on copy buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowRankDialog(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(player.fid);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="
          group relative flex items-center gap-3 p-3 rounded-xl
          backdrop-blur-md bg-white/10 border border-white/15 shadow-lg
          hover:bg-white/15 hover:border-teal-600/40
          transition-all duration-300 cursor-pointer
        "
      >
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="
          absolute left-2 top-2
          p-1.5 rounded-full bg-red-600/80 hover:bg-red-500 active:bg-red-700
          text-white shadow-lg hover:shadow-red-600/50
          lg:opacity-0 lg:group-hover:opacity-100
          transition-all duration-200 hover:scale-110 active:scale-95
          z-10
        "
        title="Remove player"
      >
        <X size={14} />
      </button>

      {/* Avatar */}
      <img
        src={player.avatar_image}
        alt={player.nickname}
        className="
          w-[60px] h-[60px] rounded-full object-cover
          border-2 border-teal-600/30 shadow-md bg-black/20 shrink-0
          group-hover:border-teal-500/50 transition-colors
        "
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.nickname}&background=random`;
        }}
      />

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-center min-w-0 gap-1">
        {/* Nickname with copy button */}
        <div className="flex items-center gap-2">
          <h3
            className="text-lg font-semibold text-[#f7fafc] truncate leading-tight"
            title={player.nickname}
          >
            {player.nickname}
          </h3>
          <button
            onClick={() => handleCopy('name')}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Copy Name"
          >
            {copiedField === 'name' ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <User size={14} className="text-gray-400" />
            )}
          </button>
        </div>

        {/* FID with copy button */}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="opacity-70">ID: {player.fid}</span>
          <button
            onClick={() => handleCopy('id')}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Copy ID"
          >
            {copiedField === 'id' ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Hash size={12} className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Furnace Level */}
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <span className="opacity-80 text-xs uppercase tracking-wide">Furnace:</span>
          {furnaceDisplay.type === 'text' ? (
            <span className="font-bold text-teal-400 text-sm bg-teal-900/30 px-2 py-0.5 rounded border border-teal-700/50">
              Lv.{furnaceDisplay.value}
            </span>
          ) : !iconError ? (
            <img
              src={furnaceDisplay.url}
              alt={`Fire Crystal ${furnaceDisplay.fireLevel}`}
              className="h-7 w-auto drop-shadow-sm filter contrast-125"
              onError={() => setIconError(true)}
            />
          ) : (
            <span className="font-bold text-orange-400 text-xs bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-700/50">
              Fire Crystal {furnaceDisplay.fireLevel}
            </span>
          )}
        </div>
      </div>

      {/* Copy Both Button */}
      <button
        onClick={() => handleCopy('both')}
        className="
          p-2 rounded-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700
          text-white shadow-lg hover:shadow-teal-600/50
          transition-all duration-200 hover:scale-110 active:scale-95
        "
        title="Copy Name and ID"
      >
        {copiedField === 'both' ? (
          <Check size={16} />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>

      {/* Rank Selection Dialog - Rendered via Portal */}
      {showRankDialog && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowRankDialog(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">Select Rank</h3>
            <div className="space-y-2">
              {RANKS.map(rank => (
                <button
                  key={rank.id}
                  onClick={() => handleRankSelect(rank.id)}
                  className={`
                    w-full px-4 py-3 rounded-lg text-left transition-all
                    ${player.rank === rank.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{rank.id}</div>
                      <div className="text-sm opacity-70">{rank.name}</div>
                    </div>
                    {player.rank === rank.id && (
                      <Check size={20} className="text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRankDialog(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
