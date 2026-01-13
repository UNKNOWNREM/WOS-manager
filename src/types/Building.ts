// Building Types and Interfaces for WOS Building Manager

// Alliance type - 6 possible values
export type Alliance = 'unassigned' | 'allianceA' | 'allianceB' | 'allianceC' | 'allianceD' | 'allianceE';

// Building status - calculated based on time
export type BuildingStatus = 'protected' | 'opening' | 'soon' | 'closing' | 'contested';

// Building types
// Building types
export type BuildingType = 'fortress' | 'stronghold' | 'engineering_station' | 'sun_city';

export const BUILDING_TYPES: BuildingType[] = ['fortress', 'stronghold', 'engineering_station', 'sun_city'];

// Engineering station sub-types (8 types)
export type StationSubType =
    | 'construction'  // 建設設施
    | 'gathering'     // 採集設施
    | 'production'    // 生產設施
    | 'tech'          // 科技設施
    | 'weapons'       // 武器設施
    | 'training'      // 訓練設施
    | 'defense'       // 防禦設施
    | 'expedition';   // 遠征設施

export const STATION_SUBTYPES: StationSubType[] = [
    'construction',
    'gathering',
    'production',
    'tech',
    'weapons',
    'training',
    'defense',
    'expedition'
];

// Station type name mappings (Chinese to English)
export const STATION_TYPE_MAP: Record<string, StationSubType> = {
    '建設設施': 'construction',
    '採集設施': 'gathering',
    '生產設施': 'production',
    '科技設施': 'tech',
    '武器設施': 'weapons',
    '訓練設施': 'training',
    '防禦設施': 'defense',
    '遠征設施': 'expedition',
};

// Station type English names for display
export const STATION_TYPE_NAMES: Record<StationSubType, string> = {
    construction: 'Construction Facility',
    gathering: 'Gathering Facility',
    production: 'Production Facility',
    tech: 'Tech Facility',
    weapons: 'Weapons Facility',
    training: 'Training Facility',
    defense: 'Defense Facility',
    expedition: 'Expedition Facility',
};

// Station type counts (from verified data)
export const STATION_TYPE_COUNTS: Record<StationSubType, number> = {
    construction: 5,
    gathering: 8,
    production: 12,
    tech: 12,
    weapons: 5,
    training: 16,
    defense: 6,
    expedition: 10,
};

// Reward information for fortresses and strongholds
export interface BuildingReward {
    type: string;       // reward type
    name: string;       // reward name
    quantity: number;   // quantity
    icon?: string;      // optional icon URL
}

// Coordinates on the map (0-1200 range)
export interface Coordinates {
    x: number;
    y: number;
}

// Facility-specific status for engineering stations
export type FacilityStatus =
    | 'protected'    // 3-day protection period (blue)
    | 'contested'    // 24-hour contested period (red)
    | 'unassigned';  // Not assigned to any alliance

// Building interface
export interface Building {
    id: string;                     // F01, C01, ES01, etc.
    name: string;                   // Display name
    type: BuildingType;             // fortress, stronghold, engineering_station, sun_city

    // Engineering Station specific
    stationSubType?: StationSubType;  // Only for engineering stations

    // Alliance information
    alliance: Alliance;             // Current alliance assignment
    allianceName?: string;          // Alliance abbreviation (e.g., "BaB")

    // Engineering Station time fields
    // REMOVED: captureTime?: number;
    protectionEndTime?: number;     // Unix timestamp - protection period ends
    openTime?: number;              // Kept for backward compatibility

    // Fortress/Stronghold time fields
    fixedOpenTime?: number;         // Unix timestamp - fixed game schedule

    // Fortress/Stronghold rewards
    reward?: BuildingReward;

    // Map position
    coordinates: Coordinates;       // 0-1200 range

    // Calculated status
    status: BuildingStatus;

    // User notes
    notes: string;
}

// Filter state for building list
export interface FilterState {
    buildingTypes: BuildingType[];
    stationSubTypes?: StationSubType[];
    alliances: Alliance[];
    statuses: BuildingStatus[];
    searchQuery?: string;
}

// Sort options
export type SortOption = 'openTime' | 'closeTime' | 'alliance' | 'name' | 'type';

// Alliance color map
export const ALLIANCE_COLORS: Record<Alliance, string> = {
    unassigned: '#6b7280',
    allianceA: '#ef4444',
    allianceB: '#3b82f6',
    allianceC: '#10b981',
    allianceD: '#fbbf24',
    allianceE: '#a855f7',
};

// Alliance display names
export const ALLIANCE_NAMES: Record<Alliance, string> = {
    unassigned: 'Unassigned',
    allianceA: 'Alliance A',
    allianceB: 'Alliance B',
    allianceC: 'Alliance C',
    allianceD: 'Alliance D',
    allianceE: 'Alliance E',
};

// Status color map
export const STATUS_COLORS: Record<BuildingStatus, string> = {
    protected: '#3b82f6',
    opening: '#10b981',
    soon: '#fbbf24',
    closing: '#6b7280',
    contested: '#ef4444',
};

// Status display names
export const STATUS_NAMES: Record<BuildingStatus, string> = {
    protected: 'Protected',
    opening: 'Open',
    soon: 'Opening Soon',
    closing: 'Closed',
    contested: 'Contested',
};

// Building type icons (shapes)
export const BUILDING_SHAPES: Record<BuildingType, string> = {
    fortress: 'square',
    stronghold: 'hexagon',
    engineering_station: 'circle',
    sun_city: 'star',
};

// Building type colors
export const BUILDING_COLORS: Record<BuildingType, string> = {
    fortress: '#ef4444',      // Red
    stronghold: '#a855f7',    // Purple
    engineering_station: '#3b82f6', // Blue
    sun_city: '#fbbf24',      // Gold
};

// Protection shield duration in seconds (3 days)
export const PROTECTION_DURATION = 3 * 24 * 60 * 60;

/**
 * Calculate building status based on current time
 */
export function calculateStatus(building: Building): BuildingStatus {
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 3600;

    // Sun City is always "opening"
    if (building.type === 'sun_city') {
        return 'opening';
    }

    // Engineering Station logic
    if (building.type === 'engineering_station') {
        // Check if under protection
        if (building.protectionEndTime && now < building.protectionEndTime) {
            return 'protected';
        }
        // Check if open
        if (building.openTime) {
            if (now >= building.openTime) {
                return 'opening';
            }
            if (building.openTime - now <= oneHour) {
                return 'soon';
            }
        }
        return 'closing';
    }

    // Fortress/Stronghold logic
    if (building.fixedOpenTime) {
        if (now >= building.fixedOpenTime) {
            return 'opening';
        }
        if (building.fixedOpenTime - now <= oneHour) {
            return 'soon';
        }
    }

    return 'closing';
}

/**
 * Calculate remaining protection time string
 */
export function calculateProtectionRemaining(protectionEndTime: number): string {
    const now = Math.floor(Date.now() / 1000);
    const remaining = protectionEndTime - now;

    if (remaining <= 0) {
        return 'Protection ended';
    }

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Format Unix timestamp to local time string
 */
export function formatLocalTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

/**
 * Format Unix timestamp to full local time string
 */
export function formatFullLocalTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short',
    }).format(date);
}
