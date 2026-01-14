import { forwardRef, useState, useMemo } from 'react';
import {
    Shield,
    Castle,
    Building2,
    Sun,
    Clock,
    MapPin,
    ChevronDown,
    Gift,
    MessageSquare
} from 'lucide-react';
import {
    Building,
    Alliance,
    ALLIANCE_COLORS,
    ALLIANCE_NAMES,
    STATUS_COLORS,
    STATUS_NAMES,
    STATION_TYPE_NAMES,
    formatLocalTime,
} from '../../types/Building';
import { TimeEditor } from '../common/TimeEditor';
import { CountdownTimer } from '../common/CountdownTimer';

import { AllianceConfig } from '../../types/Alliance';

interface BuildingCardProps {
    building: Building;
    allianceConfig?: AllianceConfig;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<Building>) => void;
    zoom: number;
}

/**
 * Building Card Component
 * Displays different info based on building type
 */
const BuildingCard = forwardRef<HTMLDivElement, BuildingCardProps>(
    ({ building, allianceConfig, isSelected, onSelect, onUpdate, zoom }, ref) => {
        const [showNotes, setShowNotes] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [showTimeEditor, setShowTimeEditor] = useState(false);

        // Utility to get alliance details
        const getAllianceDetails = (id: Alliance) => {
            if (allianceConfig && allianceConfig[id]) {
                const { name, color } = allianceConfig[id];
                // For generic ID fallback, we use name if available, otherwise ID
                return { name, color };
            }
            // Fallbacks for legacy/undefined
            return {
                name: ALLIANCE_NAMES[id as keyof typeof ALLIANCE_NAMES] || id,
                color: ALLIANCE_COLORS[id as keyof typeof ALLIANCE_COLORS] || '#64748b' // slate-500
            };
        };

        const { name: allianceName, color: allianceColor } = getAllianceDetails(building.alliance);

        const icon = useMemo(() => {
            switch (building.type) {
                case 'fortress':
                    return <Castle size={20 * zoom} className="text-red-400" />;
                case 'stronghold':
                    return <Shield size={20 * zoom} className="text-purple-400" />;
                case 'engineering_station':
                    return <Building2 size={20 * zoom} className="text-pink-cyan" />;
                case 'sun_city':
                    return <Sun size={20 * zoom} className="text-yellow-400" />;
                default:
                    return <Building2 size={20 * zoom} />;
            }
        }, [building.type, zoom]);

        const statusColor = STATUS_COLORS[building.status];
        const statusName = STATUS_NAMES[building.status];

        // Check if time is editable (only engineering stations)
        const isTimeEditable = building.type === 'engineering_station';

        // Prepare opening time display for NON-engineering stations
        const fixedTimeDisplay = useMemo(() => {
            if (building.type !== 'engineering_station') {
                if (building.fixedOpenTime) {
                    return {
                        label: 'Opens',
                        value: formatLocalTime(building.fixedOpenTime),
                        icon: <Clock size={14 * zoom} className="text-yellow-400" />
                    };
                }
            }
            // For engineering stations, we use CountdownTimer now
            return null;
        }, [building, zoom]);

        // Handle alliance change
        const handleAllianceChange = (newAlliance: Alliance) => {
            onUpdate({ alliance: newAlliance });
            setIsEditing(false);
        };

        // Handle time update from editor
        const handleTimeUpdate = (id: string, newTime: number) => {
            onUpdate({ protectionEndTime: newTime });
            setShowTimeEditor(false);
        };

        // Handle auto-update from countdown
        const handleProtectionUpdate = (id: string, newTime: number) => {
            onUpdate({ protectionEndTime: newTime });
        };

        return (
            <div
                ref={ref}
                className={`glass-panel rounded-lg p-3 cursor-pointer transition-all hover:bg-white/5 ${isSelected ? 'selected ring-1 ring-pink-cyan/50 bg-white/5' : ''
                    }`}
                style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: allianceColor,
                }}
                onClick={onSelect}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onSelect();
                    }
                }}
            >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {icon}
                        <div>
                            <h3
                                className="font-semibold leading-tight"
                                style={{ fontSize: `${0.9 * zoom}rem` }}
                            >
                                {building.name}
                            </h3>
                            <p
                                className="text-gray-400"
                                style={{ fontSize: `${0.75 * zoom}rem` }}
                            >
                                {building.id}
                                {building.stationSubType && (
                                    <span className="ml-1 text-pink-cyan">
                                        • {STATION_TYPE_NAMES[building.stationSubType]}
                                    </span>
                                )}
                                <span className="ml-2 text-slate-500">
                                    ({building.coordinates.x}, {building.coordinates.y})
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div
                        className="badge"
                        style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                            fontSize: `${0.7 * zoom}rem`,
                        }}
                    >
                        {statusName}
                    </div>
                </div>

                {/* Countdown Timer for Engineering Stations */}
                {building.type === 'engineering_station' && (
                    <div className="mb-2">
                        <CountdownTimer
                            building={building}
                            onProtectionUpdate={handleProtectionUpdate}
                            showIcon={true}
                            showLabel={false}
                        />
                    </div>
                )}

                {/* Fixed Time Display for other buildings */}
                {fixedTimeDisplay && (
                    <div
                        className="flex items-center gap-2 mb-2 text-gray-300"
                        style={{ fontSize: `${0.8 * zoom}rem` }}
                    >
                        {fixedTimeDisplay.icon}
                        <span className="text-gray-400">{fixedTimeDisplay.label}:</span>
                        <span className="font-medium">{fixedTimeDisplay.value}</span>
                    </div>
                )}

                {/* Time Editor Inline Panel */}
                {showTimeEditor && (
                    <div className="mb-3 p-2 bg-black/20 rounded border border-white/10">
                        <TimeEditor
                            buildingId={building.id}
                            currentProtectionEndTime={building.protectionEndTime}
                            onUpdate={handleTimeUpdate}
                        />
                    </div>
                )}

                {/* Reward Display (Fortress/Stronghold only) */}
                {building.reward && (
                    <div
                        className="flex items-center gap-2 mb-2 text-gray-300"
                        style={{ fontSize: `${0.8 * zoom}rem` }}
                    >
                        {building.reward.icon ? (
                            (building.reward.icon.startsWith('http') || building.reward.icon.startsWith('/')) ? (
                                <img
                                    src={building.reward.icon}
                                    alt={building.reward.name}
                                    className="object-contain"
                                    style={{ width: `${24 * zoom}px`, height: `${24 * zoom}px` }}
                                />
                            ) : (
                                <span style={{ fontSize: `${0.9 * zoom}rem` }}>{building.reward.icon}</span>
                            )
                        ) : (
                            <Gift size={14 * zoom} className="text-amber-400" />
                        )}
                        <span>{building.reward.name}</span>
                    </div>
                )}

                {/* Alliance Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <select
                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm max-w-[150px]"
                                value={building.alliance}
                                onChange={(e) => handleAllianceChange(e.target.value as Alliance)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                onBlur={() => setIsEditing(false)}
                                style={{ fontSize: `${0.8 * zoom}rem` }}
                            >
                                {allianceConfig
                                    ? Object.values(allianceConfig).map((alliance) => (
                                        <option key={alliance.id} value={alliance.id} className="bg-gray-800">
                                            {alliance.name}
                                        </option>
                                    ))
                                    : Object.entries(ALLIANCE_NAMES).map(([key, name]) => (
                                        <option key={key} value={key} className="bg-gray-800">
                                            {name}
                                        </option>
                                    ))
                                }
                            </select>
                        ) : (
                            <button
                                className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                style={{ fontSize: `${0.75 * zoom}rem` }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: allianceColor }}
                                />
                                <span>{allianceName}</span>
                                <ChevronDown size={12} />
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        {/* Time Edit Button - only for engineering stations */}
                        {isTimeEditable && (
                            <button
                                className={`p-1.5 rounded hover:bg-white/10 transition-colors ${showTimeEditor ? 'text-pink-cyan bg-white/10' : 'text-slate-400'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTimeEditor(!showTimeEditor);
                                }}
                                title="Edit protection time"
                                aria-label="Edit protection time"
                            >
                                <Clock size={14 * zoom} />
                            </button>
                        )}
                        <button
                            className="p-1.5 rounded hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotes(!showNotes);
                            }}
                            title="Notes"
                            aria-label="Toggle notes"
                        >
                            <MessageSquare size={14 * zoom} className={building.notes ? 'text-pink-cyan' : 'text-slate-400'} />
                        </button>
                        <button
                            className="p-1.5 rounded hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect();
                            }}
                            title="Locate on map"
                            aria-label="Locate on map"
                        >
                            <MapPin size={14 * zoom} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Notes Section (expandable) */}
                {showNotes && (
                    <div className="mt-2 pt-2 border-t border-cloud/10">
                        <textarea
                            className="w-full bg-black/20 border border-cloud/10 rounded p-2 text-sm resize-none focus:outline-none focus:border-pink-cyan/50 text-slate-200 placeholder-slate-500"
                            placeholder="Add notes..."
                            value={building.notes}
                            onChange={(e) => onUpdate({ notes: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            rows={2}
                            style={{ fontSize: `${0.8 * zoom}rem` }}
                            aria-label="Notes"
                        />
                    </div>
                )}
            </div>
        );
    }
);

BuildingCard.displayName = 'BuildingCard';

export default BuildingCard;
