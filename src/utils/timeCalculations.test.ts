import { describe, it, expect, vi } from 'vitest';
import { calculateFacilityStatus, parseTimeInput, formatCountdown } from './timeCalculations';

describe('timeCalculations', () => {
    describe('formatCountdown', () => {
        it('formats seconds into dd:hh:mm:ss', () => {
            expect(formatCountdown(228645)).toBe('2d:15:30:45');
        });

        it('formats seconds without days if < 24h', () => {
            expect(formatCountdown(84615)).toBe('23:30:15');
        });

        it('handles zero', () => {
            expect(formatCountdown(0)).toBe('00:00:00');
        });
    });

    describe('parseTimeInput', () => {
        it('parses dd:hh:mm:ss', () => {
            expect(parseTimeInput('2d:15:30:00')).toBe(228600);
        });
        it('parses hh:mm:ss', () => {
            expect(parseTimeInput('15:30:00')).toBe(55800);
        });
        it('returns null for invalid format', () => {
            expect(parseTimeInput('invalid')).toBeNull();
        });
    });

    describe('calculateFacilityStatus', () => {
        it('defaults to protected 3 days from now if no time set', () => {
            const onUpdate = vi.fn();
            // Use fake timers to stabilize "now"
            // But verify roughly
            const result = calculateFacilityStatus(undefined, onUpdate);
            expect(result.status).toBe('protected');
            expect(result.remainingSeconds).toBeCloseTo(3 * 24 * 60 * 60, -1);
            expect(onUpdate).toHaveBeenCalled();
        });

        it('returns protected status when within/before protection time', () => {
            const now = Math.floor(Date.now() / 1000);
            const future = now + 3600; // 1 hr later
            const result = calculateFacilityStatus(future);
            expect(result.status).toBe('protected');
            expect(result.remainingSeconds).toBeCloseTo(3600, -1);
            expect(result.label).toBe('Protected');
        });

        it('returns contested status when protection expired but < 24h passed', () => {
            const now = Math.floor(Date.now() / 1000);
            const past = now - 3600; // 1 hr ago
            const result = calculateFacilityStatus(past);
            expect(result.status).toBe('contested');
            // Contested lasts 24h (86400s) after protection ends.
            // If protection ended 3600s ago, remaining contested is 82800s
            expect(result.remainingSeconds).toBeCloseTo(82800, -1);
            expect(result.label).toBe('Contested');
        });
    });
});
