import { useState, useRef, useEffect } from 'react';
import { X, Clock, Plus, Minus, Calendar } from 'lucide-react';

interface TimeEditorProps {
    value: number | undefined; // Unix timestamp
    onChange: (timestamp: number) => void;
    onClose: () => void;
    label: string;
}

/**
 * Time Editor Component
 * Modal popup for editing Unix timestamps with date/time picker and quick adjust buttons
 */
export default function TimeEditor({ value, onChange, onClose, label }: TimeEditorProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Initialize with current time when opened (User request: default to current user open time)
    useEffect(() => {
        const now = new Date();
        setDate(now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0'));
        setTime(String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0'));
    }, []); // Run once on mount

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Convert current date/time to timestamp and save
    const handleSave = () => {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hour, minute);
        onChange(newDate.getTime());
        onClose();
    };

    // Quick adjust buttons
    const adjustTime = (hours: number) => {
        const current = value || Date.now();
        const adjusted = current + hours * 60 * 60 * 1000;
        onChange(adjusted);

        // Update local state
        const d = new Date(adjusted);
        setDate(d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0'));
        setTime(String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0'));
    };

    // Set to now
    const setToNow = () => {
        const now = new Date();
        onChange(now.getTime());
        setDate(now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0'));
        setTime(String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0'));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="glass-panel !bg-slate-900/95 rounded-xl p-4 w-80 max-w-[90vw] shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" />
                        <h3 className="font-semibold">{label}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Date/Time inputs */}
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Date</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Time</label>
                        <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick adjust buttons */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Quick Adjust</label>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => adjustTime(-1)}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                        >
                            <Minus size={10} /> 1h
                        </button>
                        <button
                            onClick={() => adjustTime(1)}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                        >
                            <Plus size={10} /> 1h
                        </button>
                        <button
                            onClick={() => adjustTime(6)}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                        >
                            <Plus size={10} /> 6h
                        </button>
                        <button
                            onClick={() => adjustTime(24)}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
                        >
                            <Plus size={10} /> 1d
                        </button>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={setToNow}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                    >
                        Set to Now
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                    >
                        Save
                    </button>
                </div>

                {/* Current value display */}
                {value && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400 text-center">
                        Current: {new Date(value).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
}
