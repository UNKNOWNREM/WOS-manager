import { useState } from 'react';
import { Clock } from 'lucide-react';
import { setProtectionTimeFromInput, formatCountdown } from '../../utils/timeCalculations';

interface TimeEditorProps {
    buildingId: string;
    currentProtectionEndTime?: number;
    onUpdate: (buildingId: string, newProtectionEndTime: number) => void;
}

/**
 * Time editor component for manual protection time adjustment
 * Accepts dd:hh:mm:ss format input
 */
export function TimeEditor({
    buildingId,
    currentProtectionEndTime,
    onUpdate
}: TimeEditorProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleSet = () => {
        const newTime = setProtectionTimeFromInput(input);

        if (newTime === null) {
            setError('Invalid format. Use dd:hh:mm:ss or hh:mm:ss');
            return;
        }

        onUpdate(buildingId, newTime);
        setInput('');
        setError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSet();
        }
    };

    // Calculate current remaining time
    const now = Math.floor(Date.now() / 1000);
    const remaining = currentProtectionEndTime ? currentProtectionEndTime - now : 0;
    const currentFormatted = remaining > 0 ? formatCountdown(remaining) : '00:00:00';

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">
                    Current: <span className="font-mono">{currentFormatted}</span>
                </span>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="2d:15:30:00"
                    className="flex-1 px-2 py-1 text-sm bg-slate-900 border border-slate-600 rounded focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                    onClick={handleSet}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                    Set
                </button>
            </div>

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}

            <p className="text-xs text-gray-500">
                Format: dd:hh:mm:ss (e.g., 2d:15:30:00)
            </p>
        </div>
    );
}
