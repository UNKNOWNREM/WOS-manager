import { PlayerGroup, Player } from '../types';

const KEYS = {
  GROUPS: 'wos_manager_groups',
  CACHED_PLAYERS: 'wos_manager_cached_players',
  LAST_IMPORT_IDS: 'wos_manager_last_import_ids',
};

export const StorageService = {
  saveGroups: (groups: PlayerGroup[]) => {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  },

  loadGroups: (): PlayerGroup[] => {
    const data = localStorage.getItem(KEYS.GROUPS);
    return data ? JSON.parse(data) : [];
  },

  saveCachedPlayers: (players: Player[]) => {
    localStorage.setItem(KEYS.CACHED_PLAYERS, JSON.stringify(players));
  },

  loadCachedPlayers: (): Player[] => {
    const data = localStorage.getItem(KEYS.CACHED_PLAYERS);
    return data ? JSON.parse(data) : [];
  },

  saveLastImportIds: (ids: string) => {
    localStorage.setItem(KEYS.LAST_IMPORT_IDS, ids);
  },

  loadLastImportIds: (): string => {
    return localStorage.getItem(KEYS.LAST_IMPORT_IDS) || '';
  },
};
