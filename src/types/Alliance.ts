export interface AllianceInfo {
    id: string;
    name: string;        // Full name: "Alliance Alpha"
    abbr: string;        // Abbreviation: "AAA" (shown on map)
    color: string;       // Hex color: "#ef4444"
    notes: string;       // Optional notes
}

export type AllianceConfig = Record<string, AllianceInfo>;

// Default alliance configuration
export const DEFAULT_ALLIANCE_CONFIG: AllianceConfig = {
    allianceA: {
        id: 'allianceA',
        name: 'Alliance A',
        abbr: 'A',
        color: '#ef4444',
        notes: ''
    },
    allianceB: {
        id: 'allianceB',
        name: 'Alliance B',
        abbr: 'B',
        color: '#3b82f6',
        notes: ''
    },
    allianceC: {
        id: 'allianceC',
        name: 'Alliance C',
        abbr: 'C',
        color: '#10b981',
        notes: ''
    },
    allianceD: {
        id: 'allianceD',
        name: 'Alliance D',
        abbr: 'D',
        color: '#fbbf24',
        notes: ''
    },
    allianceE: {
        id: 'allianceE',
        name: 'Alliance E',
        abbr: 'E',
        color: '#a855f7',
        notes: ''
    }
};
