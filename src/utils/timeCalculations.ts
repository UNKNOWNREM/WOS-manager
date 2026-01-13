/**
 * Time calculation utilities for facility control tracking
 */

const THREE_DAYS_SECONDS = 3 * 24 * 60 * 60;  // 259200 seconds
const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;  // 86400 seconds

export interface FacilityTimeStatus {
    status: 'protected' | 'contested';
    remainingSeconds: number;
    endTime: number;
    color: string;
    icon: 'Shield' | 'Swords';
    label: string;
}

/**
 * Calculate facility time status and handle automatic cycling
 */
export function calculateFacilityStatus(
    protectionEndTime: number | undefined,
    onUpdate?: (newProtectionEndTime: number) => void
): FacilityTimeStatus {
    const now = Math.floor(Date.now() / 1000);

    // If no protection time set, default to current time + 3 days
    if (!protectionEndTime) {
        const newEnd = now + THREE_DAYS_SECONDS;
        onUpdate?.(newEnd);
        return {
            status: 'protected',
            remainingSeconds: THREE_DAYS_SECONDS,
            endTime: newEnd,
            color: '#3b82f6',
            icon: 'Shield',
            label: 'Protected'
        };
    }

    if (now < protectionEndTime) {
        // Currently in protection period
        return {
            status: 'protected',
            remainingSeconds: protectionEndTime - now,
            endTime: protectionEndTime,
            color: '#3b82f6',
            icon: 'Shield',
            label: 'Protected'
        };
    }

    // Protection ended, check if in contested period
    const contestedEndTime = protectionEndTime + TWENTY_FOUR_HOURS_SECONDS;

    if (now < contestedEndTime) {
        // Currently in contested period
        return {
            status: 'contested',
            remainingSeconds: contestedEndTime - now,
            endTime: contestedEndTime,
            color: '#ef4444',
            icon: 'Swords',
            label: 'Contested'
        };
    }

    // Contested period ended, reset to new 3-day protection
    const newProtectionEnd = now + THREE_DAYS_SECONDS;
    onUpdate?.(newProtectionEnd);

    return {
        status: 'protected',
        remainingSeconds: THREE_DAYS_SECONDS,
        endTime: newProtectionEnd,
        color: '#3b82f6',
        icon: 'Shield',
        label: 'Protected'
    };
}

/**
 * Parse time input in dd:hh:mm:ss format
 * Examples: "2d:15:30:00", "15:30:00", "2d:15:30:00"
 */
export function parseTimeInput(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(':');

    try {
        if (parts.length === 4) {
            // dd:hh:mm:ss format
            const days = parseInt(parts[0].replace('d', ''));
            const hours = parseInt(parts[1]);
            const minutes = parseInt(parts[2]);
            const seconds = parseInt(parts[3]);

            if (isNaN(days) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                return null;
            }

            return days * 86400 + hours * 3600 + minutes * 60 + seconds;
        } else if (parts.length === 3) {
            // hh:mm:ss format
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            const seconds = parseInt(parts[2]);

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                return null;
            }

            return hours * 3600 + minutes * 60 + seconds;
        }
    } catch (e) {
        return null;
    }

    return null;
}

/**
 * Format seconds into dd:hh:mm:ss countdown string
 * Examples: "2d:15:30:45", "23:30:15"
 */
export function formatCountdown(seconds: number): string {
    if (seconds < 0) seconds = 0;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (days > 0) {
        return `${days}d:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    } else {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
}

/**
 * Set protection time from time input string
 * Returns new protectionEndTime timestamp
 */
export function setProtectionTimeFromInput(input: string): number | null {
    const seconds = parseTimeInput(input);
    if (seconds === null) return null;

    return Math.floor(Date.now() / 1000) + seconds;
}
