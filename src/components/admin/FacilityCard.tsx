import { Building } from '../../types/Building';
import { CountdownTimer } from '../common/CountdownTimer';
import { TimeEditor } from '../common/TimeEditor';

interface FacilityCardProps {
    building: Building;
    onUpdate: (buildingId: string, updates: Partial<Building>) => void;
    onClick?: () => void;
}

export function FacilityCard({ building, onUpdate, onClick }: FacilityCardProps) {
    const handleAllianceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(building.id, { alliance: e.target.value as any });
    };

    const handleProtectionUpdate = (buildingId: string, newProtectionEndTime: number) => {
        onUpdate(buildingId, { protectionEndTime: newProtectionEndTime });
    };

    const isEngineeringStation = building.type === 'engineering_station';

    return (
        <div
            className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors cursor-pointer"
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-white">{building.id}</h3>
                    <p className="text-sm text-gray-400">{building.name}</p>
                </div>
                {isEngineeringStation && (
                    <CountdownTimer
                        building={building}
                        onProtectionUpdate={handleProtectionUpdate}
                        showIcon={true}
                    />
                )}
            </div>

            {/* Alliance Selector */}
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                <label className="block text-xs text-gray-400 mb-1">Alliance</label>
                <select
                    value={building.alliance}
                    onChange={handleAllianceChange}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value="unassigned">Unassigned</option>
                    <option value="allianceA">Alliance A</option>
                    <option value="allianceB">Alliance B</option>
                    <option value="allianceC">Alliance C</option>
                    <option value="allianceD">Alliance D</option>
                    <option value="allianceE">Alliance E</option>
                </select>
            </div>

            {/* Time Editor for Engineering Stations */}
            {isEngineeringStation && (
                <div onClick={(e) => e.stopPropagation()}>
                    <TimeEditor
                        buildingId={building.id}
                        currentProtectionEndTime={building.protectionEndTime}
                        onUpdate={handleProtectionUpdate}
                    />
                </div>
            )}

            {/* Fixed Time for Fortress/Stronghold */}
            {!isEngineeringStation && (
                <div className="text-xs text-gray-400">
                    <span className="block mb-1">Type: {building.type}</span>
                    {building.fixedOpenTime && (
                        <span className="block">
                            Opens: {new Date(building.fixedOpenTime * 1000).toLocaleString()}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
