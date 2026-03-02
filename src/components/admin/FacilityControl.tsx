import { useMemo, useState } from 'react';
import { Building2, Shield, Swords, Clock, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useAllianceConfig } from '../../hooks/useAllianceConfig';
import { Building } from '../../types/Building';
import { calculateFacilityStatus } from '../../utils/timeCalculations';
import { StatCard } from './StatCard';
import { FacilityCard } from './FacilityCard';

interface FacilityControlProps {
    buildings: Building[];
    onUpdateBuilding: (buildingId: string, updates: Partial<Building>) => void;
}

export function FacilityControl({ buildings, onUpdateBuilding }: FacilityControlProps) {
    const [sortBy, setSortBy] = useState<'time' | 'alliance' | 'id'>('time');
    const [isFortressCollapsed, setIsFortressCollapsed] = useState(false);
    const [isStationsCollapsed, setIsStationsCollapsed] = useState(false);

    // Calculate statistics
    const stats = useMemo(() => {
        let protectedCount = 0;
        let contestedCount = 0;
        let unassignedCount = 0;
        let expiringSoon = 0;
        const allianceCounts: Record<string, number> = {};

        buildings.forEach(building => {
            // Count by alliance
            if (building.alliance === 'unassigned') {
                unassignedCount++;
            } else {
                allianceCounts[building.alliance] = (allianceCounts[building.alliance] || 0) + 1;
            }

            // Count by status (engineering stations only)
            if (building.type === 'engineering_station' && building.protectionEndTime) {
                const status = calculateFacilityStatus(building.protectionEndTime);

                if (status.status === 'protected') {
                    protectedCount++;
                    // Check if expiring soon (< 6 hours)
                    if (status.remainingSeconds < 6 * 3600) {
                        expiringSoon++;
                    }
                } else if (status.status === 'contested') {
                    contestedCount++;
                }
            }
        });

        return {
            total: buildings.length,
            protected: protectedCount,
            contested: contestedCount,
            unassigned: unassignedCount,
            expiringSoon,
            allianceCounts
        };
    }, [buildings]);

    // Separate buildings by type
    const fortressStronghold = useMemo(
        () => buildings.filter(b => b.type === 'fortress' || b.type === 'stronghold'),
        [buildings]
    );

    const engineeringStations = useMemo(
        () => buildings.filter(b => b.type === 'engineering_station'),
        [buildings]
    );

    const { config: allianceConfig } = useAllianceConfig();

    // Sort function
    const sortBuildings = (buildingsList: Building[]) => {
        const sorted = [...buildingsList];

        switch (sortBy) {
            case 'time':
                return sorted.sort((a, b) => {
                    const aTime = a.protectionEndTime || a.fixedOpenTime || 0;
                    const bTime = b.protectionEndTime || b.fixedOpenTime || 0;
                    return aTime - bTime;
                });
            case 'alliance':
                return sorted.sort((a, b) => {
                    const nameA = allianceConfig[a.alliance]?.name || a.alliance;
                    const nameB = allianceConfig[b.alliance]?.name || b.alliance;
                    return nameA.localeCompare(nameB);
                });
            case 'id':
                return sorted.sort((a, b) => a.id.localeCompare(b.id));
            default:
                return sorted;
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Buildings"
                    value={stats.total}
                    icon={<Building2 size={20} />}
                    color="text-gray-300"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Protected"
                    value={stats.protected}
                    icon={<Shield size={20} />}
                    color="text-blue-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Contested"
                    value={stats.contested}
                    icon={<Swords size={20} />}
                    color="text-red-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Unassigned"
                    value={stats.unassigned}
                    icon={<Users size={20} />}
                    color="text-gray-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Fortresses & Strongholds"
                    value={fortressStronghold.length}
                    icon={<Building2 size={20} />}
                    color="text-purple-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Engineering Stations"
                    value={engineeringStations.length}
                    icon={<Building2 size={20} />}
                    color="text-blue-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Expiring Soon (<6h)"
                    value={stats.expiringSoon}
                    icon={<Clock size={20} />}
                    color="text-yellow-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
                <StatCard
                    title="Recently Updated"
                    value={0}
                    icon={<Clock size={20} />}
                    color="text-green-400"
                    bgColor="bg-slate-800/80 border border-slate-600"
                />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value="time">Time</option>
                    <option value="alliance">Alliance</option>
                    <option value="id">ID</option>
                </select>
            </div>

            {/* Fortresses & Strongholds Section */}
            <div className="glass-panel rounded-xl overflow-hidden border border-cloud/10">
                <button
                    onClick={() => setIsFortressCollapsed(!isFortressCollapsed)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-purple-400" />
                        <h3 className="font-semibold text-slate-200">
                            Fortresses & Strongholds ({fortressStronghold.length})
                        </h3>
                    </div>
                    {isFortressCollapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {!isFortressCollapsed && (
                    <div className="p-4 bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortBuildings(fortressStronghold).map(building => (
                                <FacilityCard
                                    key={building.id}
                                    building={building}
                                    allianceConfig={allianceConfig}
                                    onUpdate={onUpdateBuilding}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Engineering Stations Section */}
            <div className="glass-panel rounded-xl overflow-hidden border border-cloud/10">
                <button
                    onClick={() => setIsStationsCollapsed(!isStationsCollapsed)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-blue-400" />
                        <h3 className="font-semibold text-slate-200">
                            Engineering Stations ({engineeringStations.length})
                        </h3>
                    </div>
                    {isStationsCollapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {!isStationsCollapsed && (
                    <div className="p-4 bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortBuildings(engineeringStations).map(building => (
                                <FacilityCard
                                    key={building.id}
                                    building={building}
                                    allianceConfig={allianceConfig}
                                    onUpdate={onUpdateBuilding}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
