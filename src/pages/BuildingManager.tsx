import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    List as ListIcon,
    Shield,
    Castle,
    Building2,
    Sun,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Search,
    Map as MapIcon
} from 'lucide-react';
import {
    Building,
    BuildingType,
    StationSubType,
    STATION_TYPE_NAMES,
    STATION_TYPE_COUNTS,
    BUILDING_TYPES,
    STATION_SUBTYPES,
    calculateStatus,
} from '../types/Building';
import { useLocalStorage, useLeftPanelZoom } from '../hooks/useLocalStorage';
import {
    generateInitialBuildings,
    sortByOpenTime,
    filterByType,
    filterByStationSubType,
    searchBuildings
} from '../utils/dataGenerator';
import BuildingList from '../components/building/BuildingList';
import DataPanel from '../components/building/DataPanel';

import MapView3D from '../components/building/MapView3D';
import { INITIAL_REWARDS, getReward, RewardCycle, REWARD_CYCLES } from '../data/rewards';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { Header } from '../components/common/Header';

/**
 * Main Building Manager Page Component
 * Reference layout style from App.tsx: padding, header, grid layout
 */
export default function BuildingManager() {
    // Buildings data
    // Changed key to 'buildings_v3' to ensure fresh start with valid 91 items
    // Initialize synchronously with default data if empty
    const [buildings, setBuildings] = useLocalStorage<Building[]>('buildings_v4', []);

    // Reward cycle state
    const [currentCycle, setCurrentCycle] = useLocalStorage<RewardCycle>('currentCycle', 1);

    // Initialize buildings if empty
    useEffect(() => {
        if (!buildings || buildings.length === 0) {
            setBuildings(generateInitialBuildings());
        }
    }, [buildings, setBuildings]);

    // UI state
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useLocalStorage('leftPanelCollapsed', false);
    const { zoom: leftPanelZoom, increaseZoom, decreaseZoom, resetZoom } = useLeftPanelZoom();

    // Filter state
    const [activeTab, setActiveTab] = useState<'all' | BuildingType | StationSubType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoSort, setAutoSort] = useLocalStorage('autoSort', true);

    // Memoized filtered and sorted buildings
    const filteredBuildings = useMemo(() => {
        let filtered = buildings;

        // Apply type filter
        if (activeTab !== 'all') {
            if (BUILDING_TYPES.includes(activeTab as BuildingType)) {
                filtered = filterByType(filtered, [activeTab as BuildingType]);
            } else if (STATION_SUBTYPES.includes(activeTab as StationSubType)) {
                filtered = filterByStationSubType(filtered, [activeTab as StationSubType]);
            }
        }

        // Apply search query
        if (searchQuery) {
            filtered = searchBuildings(filtered, searchQuery);
        }

        // Apply sorting
        if (autoSort) {
            filtered = sortByOpenTime(filtered);
        }

        return filtered;
    }, [buildings, activeTab, searchQuery, autoSort, currentCycle]);

    // Calculate counts for tabs
    const buildingCounts = useMemo(() => {
        const counts: { [key: string]: number } = { all: buildings.length };
        BUILDING_TYPES.forEach(type => {
            counts[type] = filterByType(buildings, [type]).length;
        });
        STATION_SUBTYPES.forEach(subType => {
            counts[subType] = filterByStationSubType(buildings, [subType]).length;
        });
        return counts;
    }, [buildings]);

    const resetMapView = useCallback(() => {
        // No parent state to reset for 3D view
    }, []);

    // Handlers
    const handleSelectFromList = useCallback((buildingId: string) => {
        setSelectedBuilding(buildingId);
    }, []);

    const handleSelectFromMap = useCallback((buildingId: string) => {
        setSelectedBuilding(buildingId);
    }, []);

    const handleUpdateBuilding = useCallback((buildingId: string, updates: Partial<Building>) => {
        setBuildings(prev => prev.map(b =>
            b.id === buildingId ? { ...b, ...updates, status: calculateStatus({ ...b, ...updates }) } : b
        ));
    }, [setBuildings]);

    // Ensure buildings is safe to render
    const safeBuildings = Array.isArray(buildings) ? buildings : [];

    return (
        <div className="min-h-screen h-auto flex flex-col font-sans bg-slate-900 text-slate-100">
            {/* Header */}
            <Header
                title="Building Manager"
                subtitle="Interactive Map & Building Tracker"
                icon={<MapIcon size={24} />}
                actions={
                    <>
                        <LanguageSwitcher />
                        {/* Cycle Selector */}
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1.5 border border-white/10">
                            <span className="text-xs text-slate-400 px-2 whitespace-nowrap">Cycle:</span>
                            <select
                                value={currentCycle}
                                onChange={(e) => setCurrentCycle(Number(e.target.value) as RewardCycle)}
                                className="bg-slate-900 text-white text-sm rounded px-2 py-1 border border-white/20 focus:outline-none focus:border-blue-500"
                            >
                                {REWARD_CYCLES.map(c => (
                                    <option key={c} value={c}>Week {c}</option>
                                ))}
                            </select>
                        </div>

                        <a
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-lg hover:shadow-teal-600/50 text-sm whitespace-nowrap"
                            title="Back to Manager"
                        >
                            <Building2 size={16} />
                            <span className="hidden sm:inline">WOS Manager</span>
                        </a>
                    </>
                }
            />

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 p-4 md:p-6">
                {/* Left Panel: Building List */}
                <section className={`transition-all duration-300 ${leftPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'
                    } flex flex-col overflow-hidden`}>
                    <div className="glass-panel rounded-xl flex flex-col overflow-hidden h-full">
                        {/* Panel Header with Toggle */}
                        <div className={`flex-shrink-0 p-4 ${!leftPanelCollapsed ? 'border-b border-white/10' : ''}`}>
                            <div className={`flex items-center justify-between ${!leftPanelCollapsed ? 'mb-3' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                        title={leftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
                                    >
                                        {leftPanelCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                    </button>
                                    {!leftPanelCollapsed && (
                                        <h2 className="text-lg font-semibold">Buildings</h2>
                                    )}
                                </div>

                                {/* Zoom Controls (visible when not collapsed) */}
                                {!leftPanelCollapsed && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={decreaseZoom}
                                            className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                            title="Decrease size"
                                        >
                                            <ZoomOut size={14} />
                                        </button>
                                        <span className="text-xs text-gray-400 w-8 text-center">
                                            {Math.round(leftPanelZoom * 100)}%
                                        </span>
                                        <button
                                            onClick={increaseZoom}
                                            className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                            title="Increase size"
                                        >
                                            <ZoomIn size={14} />
                                        </button>
                                        <button
                                            onClick={resetZoom}
                                            className="p-1 rounded hover:bg-white/10 transition-colors"
                                            title="Reset size"
                                        >
                                            <RotateCcw size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Search and Filters (hidden when collapsed) */}
                            {!leftPanelCollapsed && (
                                <>
                                    {/* Search */}
                                    <div className="relative mb-3">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search buildings..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>

                                    {/* Tab Navigation */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <TabButton
                                            active={activeTab === 'all'}
                                            onClick={() => setActiveTab('all')}
                                            icon={<ListIcon size={12} />}
                                            label="All"
                                            count={buildingCounts.all}
                                        />
                                        <TabButton
                                            active={activeTab === 'fortress'}
                                            onClick={() => setActiveTab('fortress')}
                                            icon={<Castle size={12} />}
                                            label="Fortress"
                                            count={buildingCounts.fortress}
                                            color="text-red-400"
                                        />
                                        <TabButton
                                            active={activeTab === 'stronghold'}
                                            onClick={() => setActiveTab('stronghold')}
                                            icon={<Shield size={12} />}
                                            label="Stronghold"
                                            count={buildingCounts.stronghold}
                                            color="text-purple-400"
                                        />
                                        <TabButton
                                            active={activeTab === 'engineering_station'}
                                            onClick={() => setActiveTab('engineering_station')}
                                            icon={<Building2 size={12} />}
                                            label="Stations"
                                            count={buildingCounts.engineering_station}
                                            color="text-blue-400"
                                        />
                                    </div>

                                    {/* Station Sub-type Filter */}
                                    {(activeTab === 'engineering_station' || Object.keys(STATION_TYPE_NAMES).includes(activeTab)) && (
                                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/5">
                                            {Object.entries(STATION_TYPE_NAMES).map(([key, name]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setActiveTab(key as StationSubType)}
                                                    className={`px-2 py-0.5 text-xs rounded transition-colors ${activeTab === key
                                                        ? 'bg-blue-500/30 text-blue-300'
                                                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                                        }`}
                                                >
                                                    {name.replace(' Facility', '')} ({STATION_TYPE_COUNTS[key as StationSubType]})
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sort Toggle & Count */}
                                    <div className="flex items-center justify-between mt-2 text-xs">
                                        <span className="text-gray-400">
                                            {filteredBuildings.length} buildings
                                        </span>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <span className="text-gray-400">Sort by time</span>
                                            <input
                                                type="checkbox"
                                                checked={autoSort}
                                                onChange={(e) => setAutoSort(e.target.checked)}
                                                className="rounded border-gray-600 bg-white/10 text-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                                            />
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* BuildingList */}
                        {!leftPanelCollapsed && (
                            <div className="flex-1 overflow-y-auto min-h-0 max-h-[70vh]">
                                <BuildingList
                                    buildings={filteredBuildings}
                                    selectedId={selectedBuilding}
                                    onSelect={handleSelectFromList}
                                    onUpdate={handleUpdateBuilding}
                                    zoom={leftPanelZoom}
                                />
                            </div>
                        )}

                        {/* Data Panel - Import/Export */}
                        {!leftPanelCollapsed && (
                            <div className="flex-shrink-0 border-t border-white/10 bg-black/20">
                                <DataPanel
                                    buildings={buildings}
                                    onImport={setBuildings}
                                    zoom={leftPanelZoom}
                                />
                            </div>
                        )}

                        {/* Collapsed state - vertical icons */}
                        {leftPanelCollapsed && (
                            <div className="flex-1 flex flex-col items-center py-4 gap-3">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                                    title="All buildings"
                                >
                                    <ListIcon size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('fortress')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'fortress' ? 'bg-white/15 text-red-400' : 'hover:bg-white/10'}`}
                                    title="Fortresses"
                                >
                                    <Castle size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('stronghold')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'stronghold' ? 'bg-white/15 text-purple-400' : 'hover:bg-white/10'}`}
                                    title="Strongholds"
                                >
                                    <Shield size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('engineering_station')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'engineering_station' ? 'bg-white/15 text-blue-400' : 'hover:bg-white/10'}`}
                                    title="Engineering Stations"
                                >
                                    <Building2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Panel: Map View */}
                <section className={`transition-all duration-300 ${leftPanelCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'
                    } flex flex-col overflow-hidden min-h-[500px] lg:h-full relative`}>

                    <MapView3D
                        buildings={buildings}
                        selectedId={selectedBuilding}
                        onSelectMarker={handleSelectFromMap}
                        onResetView={resetMapView}
                    />
                </section>
            </main >

            {/* Footer */}
            <footer className="flex-shrink-0 mt-4 text-center">
                <div className="text-white/20 text-xs">
                    Data stored locally in browser. Click buildings on map or list to interact.
                </div>
            </footer>
        </div >
    );
}

// Tab Button Component
function TabButton({
    active,
    onClick,
    icon,
    label,
    count,
    color = 'text-gray-300'
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count: number;
    color?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${active
                ? 'bg-white/15 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
        >
            <span className={active ? color : ''}>{icon}</span>
            <span>{label}</span>
            <span className="opacity-60">({count})</span>
        </button>
    );
}
