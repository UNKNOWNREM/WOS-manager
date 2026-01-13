import {
    Building,
    BuildingType,
    StationSubType,
    STATION_TYPE_MAP,
    STATION_TYPE_NAMES,
    PROTECTION_DURATION,
    calculateStatus
} from '../types/Building';

import mapData from '../data/map_data.json';

// Type for raw JSON data from corrected_map_data.json
interface RawMapData {
    map_info: {
        size: number;
        center: [number, number];
        coordinate_system: string;
        ruins_area: {
            min_x: number;
            max_x: number;
            min_y: number;
            max_y: number;
        };
    };
    sun_city?: {
        id: number;
        x: number;
        y: number;
        type: string;
        name: string;
    };
    fortresses: Array<{
        id: number;
        x: number;
        y: number;
        type: string;
    }>;
    strongholds: Array<{
        id: number;
        x: number;
        y: number;
        type: string;
    }>;
    engineering_stations: Array<{
        id: number;
        x: number;
        y: number;
        type: string;
        name: string;
    }>;
    statistics: {
        total_buildings: number;
        sun_city_count: number;
        fortresses_count: number;
        strongholds_count: number;
        engineering_stations_count: number;
        engineering_stations_by_type: Record<string, number>;
    };
}

/**
 * Load and parse world data from JSON file
 * Now synchronous using static import to avoid network/extension issues
 */
export function loadWorldData(): RawMapData {
    return mapData as unknown as RawMapData;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get next fortress open time based on game rules
 * Example: Every Mon, Wed, Fri at 20:00 local time
 */
function getNextFortressOpenTime(index: number): number {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6 (Sun-Sat)
    const targetDays = [1, 3, 5]; // Mon, Wed, Fri
    const targetHour = 20;

    // Distribute fortresses across different day cycles
    const targetDayIndex = index % targetDays.length;
    let targetDay = targetDays[targetDayIndex];

    // Calculate days to add
    let daysToAdd = targetDay - dayOfWeek;
    if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= targetHour)) {
        daysToAdd += 7;
    }

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    nextDate.setHours(targetHour, 0, 0, 0);

    return Math.floor(nextDate.getTime() / 1000);
}

/**
 * Get next stronghold open time based on game rules
 * Example: Every Tue, Thu, Sat at 21:00 local time
 */
function getNextStrongholdOpenTime(index: number): number {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const targetDays = [2, 4, 6]; // Tue, Thu, Sat
    const targetHour = 21;

    const targetDayIndex = index % targetDays.length;
    let targetDay = targetDays[targetDayIndex];

    let daysToAdd = targetDay - dayOfWeek;
    if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= targetHour)) {
        daysToAdd += 7;
    }

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    nextDate.setHours(targetHour, 0, 0, 0);

    return Math.floor(nextDate.getTime() / 1000);
}

/**
 * Generate initial buildings from world data
 */
export function generateInitialBuildings(): Building[] {
    const worldData = loadWorldData();
    const buildings: Building[] = [];
    const now = Math.floor(Date.now() / 1000);

    // Sample fortress rewards
    const fortressRewards = [
        { type: 'resource', name: 'Rare Resource Box', quantity: 2 },
        { type: 'material', name: 'Building Materials', quantity: 3 },
        { type: 'speedup', name: 'Speed Up 1h', quantity: 5 },
    ];

    // Sample stronghold rewards
    const strongholdRewards = [
        { type: 'equipment', name: 'Epic Equipment Shard', quantity: 5 },
        { type: 'hero', name: 'Hero EXP Book', quantity: 10 },
        { type: 'gem', name: 'Gem Box', quantity: 3 },
    ];

    // Add Sun City (at map center if not specified)
    const sunCity = worldData.sun_city || {
        x: worldData.map_info.center[0],
        y: worldData.map_info.center[1]
    };
    buildings.push({
        id: 'SC01',
        name: 'Sun City',
        type: 'sun_city',
        alliance: 'unassigned',
        coordinates: { x: sunCity.x, y: sunCity.y },
        status: 'opening',
        notes: '',
    });

    // Add Fortresses (12)
    worldData.fortresses.forEach((f, i) => {
        const building: Building = {
            id: `F${String(i + 1).padStart(2, '0')}`,
            name: `Fortress ${String(i + 1).padStart(2, '0')}`,
            type: 'fortress',
            alliance: 'unassigned',
            fixedOpenTime: getNextFortressOpenTime(i),
            reward: fortressRewards[i % fortressRewards.length],
            coordinates: { x: f.x, y: f.y },
            status: 'closing',
            notes: '',
        };
        building.status = calculateStatus(building);
        buildings.push(building);
    });

    // Add Strongholds (4)
    worldData.strongholds.forEach((c, i) => {
        const building: Building = {
            id: `S${String(i + 1).padStart(2, '0')}`,
            name: `Stronghold ${String(i + 1).padStart(2, '0')}`,
            type: 'stronghold',
            alliance: 'unassigned',
            fixedOpenTime: getNextStrongholdOpenTime(i),
            reward: strongholdRewards[i % strongholdRewards.length],
            coordinates: { x: c.x, y: c.y },
            status: 'closing',
            notes: '',
        };
        building.status = calculateStatus(building);
        buildings.push(building);
    });

    // Add Engineering Stations (74)
    worldData.engineering_stations.forEach((e, i) => {
        // Random capture time within the last 0-2 days
        const captureTime = now - randomInt(0, 2 * 24 * 3600);
        const protectionEndTime = captureTime + PROTECTION_DURATION;

        // Map Chinese name to English subtype
        const stationSubType: StationSubType = STATION_TYPE_MAP[e.name] || 'production';
        const stationTypeName = STATION_TYPE_NAMES[stationSubType];

        const building: Building = {
            id: `ES${String(e.id).padStart(2, '0')}`,
            name: `${stationTypeName} ${String(e.id).padStart(2, '0')}`,
            type: 'engineering_station',
            stationSubType,
            alliance: 'unassigned',
            captureTime,
            protectionEndTime,
            openTime: protectionEndTime, // Opens when protection ends
            coordinates: { x: e.x, y: e.y },
            status: 'protected',
            notes: '',
        };
        building.status = calculateStatus(building);

        buildings.push(building);
    });

    return buildings;
}

/**
 * Sort buildings by open time (ascending - soonest first)
 */
export function sortByOpenTime(buildings: Building[]): Building[] {
    return [...buildings].sort((a, b) => {
        const timeA = a.openTime || a.fixedOpenTime || Infinity;
        const timeB = b.openTime || b.fixedOpenTime || Infinity;
        return timeA - timeB;
    });
}

/**
 * Filter buildings by type
 */
export function filterByType(buildings: Building[], types: BuildingType[]): Building[] {
    if (types.length === 0) return buildings;
    return buildings.filter(b => types.includes(b.type));
}

/**
 * Filter engineering stations by sub-type
 */
export function filterByStationSubType(buildings: Building[], subTypes: StationSubType[]): Building[] {
    if (subTypes.length === 0) return buildings;
    return buildings.filter(b =>
        b.type !== 'engineering_station' ||
        (b.stationSubType && subTypes.includes(b.stationSubType))
    );
}

/**
 * Search buildings by name or ID
 */
export function searchBuildings(buildings: Building[], query: string): Building[] {
    if (!query.trim()) return buildings;
    const lowerQuery = query.toLowerCase();
    return buildings.filter(b =>
        b.id.toLowerCase().includes(lowerQuery) ||
        b.name.toLowerCase().includes(lowerQuery)
    );
}
