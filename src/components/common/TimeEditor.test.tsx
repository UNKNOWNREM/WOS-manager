// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeEditor } from './TimeEditor';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Clock: () => <span data-testid="icon-clock">ClockIcon</span>
}));

// Use real utils instead of mocking
// vi.mock('../../utils/timeCalculations'); 

describe('TimeEditor', () => {
    const mockOnUpdate = vi.fn();

    beforeEach(() => {
        mockOnUpdate.mockClear();
    });

    it('renders input and button', () => {
        render(<TimeEditor buildingId="1" onUpdate={mockOnUpdate} />);
        expect(screen.getByRole('textbox')).toBeTruthy();
        expect(screen.getByRole('button', { name: /set/i })).toBeTruthy();
    });

    it('validates input and updates time', () => {
        render(<TimeEditor buildingId="1" onUpdate={mockOnUpdate} />);
        const input = screen.getByRole('textbox');
        const button = screen.getByRole('button', { name: /set/i });

        // Use valid format: 10:00:00
        fireEvent.change(input, { target: { value: '10:00:00' } });
        fireEvent.click(button);

        expect(mockOnUpdate).toHaveBeenCalled();
        const callArg = mockOnUpdate.mock.calls[0][1];
        expect(typeof callArg).toBe('number');
    });

    it('shows error on invalid input', () => {
        render(<TimeEditor buildingId="1" onUpdate={mockOnUpdate} />);
        const input = screen.getByRole('textbox');
        const button = screen.getByRole('button', { name: /set/i });

        fireEvent.change(input, { target: { value: 'invalid_text' } });
        fireEvent.click(button);

        expect(screen.getByText(/Invalid format/i)).toBeTruthy();
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });
});
