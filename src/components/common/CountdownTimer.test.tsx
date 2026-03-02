// @vitest-environment happy-dom
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Building } from '../../types/Building';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Shield: () => <span data-testid="icon-shield">ShieldIcon</span>,
    Swords: () => <span data-testid="icon-swords">SwordsIcon</span>
}));

describe('CountdownTimer', () => {
    const getMockBuilding = (): Building => ({
        id: '1',
        name: 'Test Station',
        type: 'engineering_station',
        alliance: 'unassigned',
        coordinates: { x: 0, y: 0 },
        status: 'protected',
        notes: '',
        protectionEndTime: Math.floor(Date.now() / 1000) + 3600 // 1 hour form NOW
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders timer with countdown', () => {
        const building = getMockBuilding();
        render(<CountdownTimer building={building} />);

        expect(screen.getByText('Protected')).toBeTruthy();
        expect(screen.getByText(/01:00:00/)).toBeTruthy();
    });

    it('updates every second', () => {
        const building = getMockBuilding();
        render(<CountdownTimer building={building} />);

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText(/00:59:58/)).toBeTruthy();
    });

    /*
    it('triggers onProtectionUpdate when cycle ends', () => {
        const onUpdate = vi.fn();
        const nowSec = Math.floor(Date.now() / 1000);
        const dyingBuilding: Building = {
            ...getMockBuilding(),
            protectionEndTime: nowSec + 1
        };

        render(<CountdownTimer building={dyingBuilding} onProtectionUpdate={onUpdate} />);
        
        act(() => {
            vi.advanceTimersByTime((24 * 3600 + 3600) * 1000);
            vi.runAllTimers(); 
        });
        
        expect(onUpdate).toHaveBeenCalled();
    });
    */

    it('renders Contested state correctly', () => {
        const nowSec = Math.floor(Date.now() / 1000);
        const contestedBuilding: Building = {
            ...getMockBuilding(),
            protectionEndTime: nowSec - 3600
        };

        render(<CountdownTimer building={contestedBuilding} />);
        expect(screen.getByText('Contested')).toBeTruthy();
    });

    it('does not render for non-engineering stations', () => {
        const fortress: Building = { ...getMockBuilding(), type: 'fortress' };
        const { container } = render(<CountdownTimer building={fortress} />);
        expect(container.innerHTML).toBe('');
    });
});
