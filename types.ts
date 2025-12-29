export interface Player {
  fid: string;
  nickname: string;
  kid: number;
  stove_lv: number;
  stove_lv_content: string;
  avatar_image: string;
  lastUpdated?: number;
}

export interface PlayerColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
}

export interface GroupPlayer extends Player {
  customData: Record<string, string>;
}

export interface PlayerGroup {
  id: string;
  name: string;
  columns: PlayerColumn[];
  players: GroupPlayer[];
}

export interface ImportStatus {
  total: number;
  current: number;
  success: number;
  failed: number;
  failedIds: string[];
  isImporting: boolean;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// Rank system types
export type RankLevel = 'R4' | 'R3' | 'R2' | 'R1';

export interface RankPlayer extends Player {
  rank: RankLevel;
}

export interface Rank {
  id: RankLevel;
  name: string;
  maxPlayers?: number;
  players: RankPlayer[];
}
