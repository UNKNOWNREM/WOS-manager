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
    MessageSquare,
    Edit2
} from 'lucide-react';
import {
    Building,
    Alliance,
    ALLIANCE_COLORS,
    ALLIANCE_NAMES,
    STATUS_COLORS,
    STATUS_NAMES,
    STATION_TYPE_NAMES,
    calculateProtectionRemaining,
    formatLocalTime,
} from '../../types/Building';
import TimeEditor from './TimeEditor';

interface BuildingCardProps {
    building: Building;
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
    ({ building, isSelected, onSelect, onUpdate, zoom }, ref) => {
        const [showNotes, setShowNotes] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [showTimeEditor, setShowTimeEditor] = useState(false);

        const icon = useMemo(() => {
            switch (building.type) {
                case 'fortress':
                    return <Castle size={20 * zoom} className="text-red-400" />;
                case 'stronghold':
                    return <Shield size={20 * zoom} className="text-purple-400" />;
                case 'engineering_station':
                    return <Building2 size={20 * zoom} className="text-blue-400" />;
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

        // Get time display based on building type
        const timeDisplay = useMemo(() => {
            if (building.type === 'engineering_station') {
                if (building.status === 'protected' && building.protectionEndTime) {
                    return {
                        label: 'Protection',
                        value: calculateProtectionRemaining(building.protectionEndTime),
                        icon: <Shield size={14 * zoom} className="text-blue-400" />,
                        editable: true,
                    };
                }
                if (building.openTime) {
                    return {
                        label: 'Opens',
                        value: formatLocalTime(building.openTime),
                        icon: <Clock size={14 * zoom} className="text-green-400" />,
                        editable: true,
                    };
                }
            } else if (building.fixedOpenTime) {
                return {
                    label: 'Opens',
                    value: formatLocalTime(building.fixedOpenTime),
                    icon: <Clock size={14 * zoom} className="text-yellow-400" />,
                    editable: false, // Fortress/Stronghold times are fixed
                };
            }
            return null;
        }, [building, zoom]);

        // Handle alliance change
        const handleAllianceChange = (newAlliance: Alliance) => {
            onUpdate({ alliance: newAlliance });
            setIsEditing(false);
        };

        // Handle time change from editor
        const handleTimeChange = (newTimestamp: number) => {
            if (building.type === 'engineering_station') {
                // Update capture time, which will recalculate protection/open times
                onUpdate({ captureTime: newTimestamp });
            }
        };

        return (
            <>
                <div
                    ref={ref}
                    className={`glass-card rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'selected' : ''
                        }`}
                    style={{
                        borderLeftWidth: '3px',
                        borderLeftColor: ALLIANCE_COLORS[building.alliance],
                    }}
                    onClick={onSelect}
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
                                        <span className="ml-1 text-blue-400">
                                            • {STATION_TYPE_NAMES[building.stationSubType]}
                                        </span>
                                    )}
                                    <span className="ml-2 text-gray-500">
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

                    {/* Time Display - Clickable for engineering stations */}
                    {timeDisplay && (
                        <div
                            className={`flex items-center gap-2 mb-2 text-gray-300 ${timeDisplay.editable ? 'cursor-pointer hover:bg-white/5 -mx-1 px-1 py-0.5 rounded transition-colors group' : ''
                                }`}
                            style={{ fontSize: `${0.8 * zoom}rem` }}
                            onClick={(e) => {
                                if (timeDisplay.editable) {
                                    e.stopPropagation();
                                    setShowTimeEditor(true);
                                }
                            }}
                        >
                            {timeDisplay.icon}
                            <span className="text-gray-400">{timeDisplay.label}:</span>
                            <span className="font-medium">{timeDisplay.value}</span>
                            {timeDisplay.editable && (
                                <Edit2 size={12 * zoom} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            )}
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
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                                    value={building.alliance}
                                    onChange={(e) => handleAllianceChange(e.target.value as Alliance)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    onBlur={() => setIsEditing(false)}
                                    style={{ fontSize: `${0.8 * zoom}rem` }}
                                >
                                    {Object.entries(ALLIANCE_NAMES).map(([key, name]) => (
                                        <option key={key} value={key} className="bg-gray-800">
                                            {name}
                                        </option>
                                    ))}
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
                                        style={{ backgroundColor: ALLIANCE_COLORS[building.alliance] }}
                                    />
                                    <span>{ALLIANCE_NAMES[building.alliance]}</span>
                                    <ChevronDown size={12} />
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            {/* Time Edit Button - only for engineering stations */}
                            {isTimeEditable && (
                                <button
                                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowTimeEditor(true);
                                    }}
                                    title="Edit time"
                                >
                                    <Clock size={14 * zoom} className="text-gray-400" />
                                </button>
                            )}
                            <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotes(!showNotes);
                                }}
                                title="Notes"
                            >
                                <MessageSquare size={14 * zoom} className={building.notes ? 'text-blue-400' : 'text-gray-400'} />
                            </button>
                            <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect();
                                }}
                                title="Locate on map"
                            >
                                <MapPin size={14 * zoom} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notes Section (expandable) */}
                    {showNotes && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm resize-none focus:outline-none focus:border-blue-500/50"
                                placeholder="Add notes..."
                                value={building.notes}
                                onChange={(e) => onUpdate({ notes: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                rows={2}
                                style={{ fontSize: `${0.8 * zoom}rem` }}
                            />
                        </div>
                    )}
                </div>

                {/* Time Editor Modal */}
                {showTimeEditor && (
                    <TimeEditor
                        value={building.captureTime}
                        onChange={handleTimeChange}
                        onClose={() => setShowTimeEditor(false)}
                        label={`Edit Time - ${building.name}`}
                    />
                )}
            </>
        );
    }
);

BuildingCard.displayName = 'BuildingCard';

export default BuildingCard;
