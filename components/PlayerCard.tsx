import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const [iconError, setIconError] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(player));
    e.dataTransfer.effectAllowed = 'copy';
    // Visual drag feedback handled by CSS class 'active:cursor-grabbing'
    // but we can add temporary style class to the source if needed
    e.currentTarget.classList.add('opacity-50', 'rotate-2');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'rotate-2');
  };

  // Official icon URL pattern
  const stoveIconUrl = `https://gof-formal-avatar.akamaized.net/img/icon/stove_lv_${player.stove_lv}.png`;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="
        group relative flex items-center gap-4 p-4 mb-3 rounded-xl
        backdrop-blur-md bg-white/10 border border-white/15 shadow-lg
        hover:-translate-y-0.5 hover:shadow-teal-900/30 hover:bg-white/15 hover:border-teal-600/40
        transition-all duration-300 cursor-grab active:cursor-grabbing
      "
    >
      {/* Avatar Section */}
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
        {/* Nickname */}
        <h3 
          className="text-[1.125rem] font-semibold text-[#f7fafc] truncate leading-tight" 
          title={player.nickname}
        >
          {player.nickname}
        </h3>

        {/* Furnace Level */}
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <span className="opacity-80 text-xs uppercase tracking-wide">Furnace:</span>
          {!iconError ? (
            <img
              src={stoveIconUrl}
              alt={`Lv.${player.stove_lv}`}
              className="h-6 w-auto drop-shadow-sm filter contrast-125"
              onError={() => setIconError(true)}
            />
          ) : (
            <span className="font-bold text-teal-400 text-xs bg-teal-900/30 px-1.5 py-0.5 rounded border border-teal-700/50">
              Lv.{player.stove_lv}
            </span>
          )}
        </div>
      </div>
      
      {/* Drag Handle Hint (Visual only, whole card is draggable) */}
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-20 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
};