import { Building, ALLIANCE_NAMES } from '../../types/Building';
import { AllianceConfig } from '../../types/Alliance';
import { CountdownTimer } from '../common/CountdownTimer';
import { TimeEditor } from '../common/TimeEditor';

interface FacilityCardProps {
    building: Building;
    allianceConfig?: AllianceConfig;
    onUpdate: (buildingId: string, updates: Partial<Building>) => void;
    onClick?: () => void;
}

export function FacilityCard({ building, allianceConfig, onUpdate, onClick }: FacilityCardProps) {
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
                    {allianceConfig
                        ? Object.values(allianceConfig).map((alliance) => (
                            <option key={alliance.id} value={alliance.id}>
                                {alliance.name}
                            </option>
                        ))
                        : Object.entries(ALLIANCE_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>
                                {name}
                            </option>
                        ))
                    }
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
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Type: {building.type}</span>
                        <span>Open Time:</span>
                    </div>
                    <input
                        type="datetime-local"
                        value={(() => {
                            if (!building.fixedOpenTime) return '';
                            const d = new Date(building.fixedOpenTime * 1000);
                            const pad = (n: number) => n.toString().padStart(2, '0');
                            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        })()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                                // Maybe handle clear? For now assuming always set if using this.
                                return;
                            }
                            const newTime = Math.floor(new Date(val).getTime() / 1000);
                            onUpdate(building.id, { fixedOpenTime: newTime });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            )}
        </div>
    );
}
