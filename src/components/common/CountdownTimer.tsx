import { useEffect, useState } from 'react';
import { Shield, Swords } from 'lucide-react';
import { calculateFacilityStatus, formatCountdown } from '../../utils/timeCalculations';
import { Building } from '../../types/Building';

interface CountdownTimerProps {
    building: Building;
    onProtectionUpdate?: (buildingId: string, newProtectionEndTime: number) => void;
    compact?: boolean;
    showIcon?: boolean;
    showLabel?: boolean;
}

/**
 * Countdown timer component for facility control tracking
 * Displays protection/contested status with auto-update every second
 */
export function CountdownTimer({
    building,
    onProtectionUpdate,
    compact = false,
    showIcon = true,
    showLabel = true
}: CountdownTimerProps) {
    const [, setTick] = useState(0);

    // Update every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Don't show timer for fortress/stronghold or sun_city
    if (building.type !== 'engineering_station') {
        return null;
    }

    const timeStatus = calculateFacilityStatus(
        building.protectionEndTime,
        (newTime) => {
            // Auto-update protection time when cycle completes
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
                onProtectionUpdate?.(building.id, newTime);
            }, 0);
        }
    );

    const Icon = timeStatus.icon === 'Shield' ? Shield : Swords;
    const formattedTime = formatCountdown(timeStatus.remainingSeconds);

    if (compact) {
        // Compact version for map display
        return (
            <span
                className="text-xs font-mono"
                style={{ color: timeStatus.color }}
            >
                {formattedTime}
            </span>
        );
    }

    return (
        <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: timeStatus.color }}
        >
            {showIcon && <Icon size={14} />}
            {showLabel && <span className="font-semibold">{timeStatus.label}</span>}
            <span className="font-mono">{formattedTime}</span>
        </div>
    );
}
