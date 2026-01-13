import { useRef, ChangeEvent } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { Building } from '../../types/Building';

interface DataPanelProps {
    buildings: Building[];
    onImport: (buildings: Building[]) => void;
    zoom?: number;
}

interface ExportData {
    version: string;
    exportedAt: number;
    buildings: Building[];
}

/**
 * Data Panel Component
 * Export/Import buildings data as JSON file
 */
export default function DataPanel({ buildings, onImport, zoom = 1 }: DataPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Export buildings to JSON file
    const handleExport = () => {
        const data: ExportData = {
            version: '1.0',
            exportedAt: Date.now(),
            buildings,
        };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `wos-buildings-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Import buildings from JSON file
    const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const data: ExportData = JSON.parse(content);

                if (data.buildings && Array.isArray(data.buildings)) {
                    onImport(data.buildings);
                    alert(`Successfully imported ${data.buildings.length} buildings!`);
                } else {
                    alert('Invalid file format. Expected buildings array.');
                }
            } catch (error) {
                alert('Failed to parse JSON file. Please check the file format.');
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <Database size={16 * zoom} className="text-blue-400" />
                <h3
                    className="font-semibold"
                    style={{ fontSize: `${0.85 * zoom}rem` }}
                >
                    Data
                </h3>
            </div>

            <div className="flex gap-2">
                {/* Export Button */}
                <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                    style={{ fontSize: `${0.75 * zoom}rem` }}
                    title="Export buildings data to JSON file"
                >
                    <Download size={14 * zoom} />
                    Export
                </button>

                {/* Import Button */}
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors cursor-pointer"
                    style={{ fontSize: `${0.75 * zoom}rem` }}
                    title="Import buildings data from JSON file"
                >
                    <Upload size={14 * zoom} />
                    Import
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </label>
            </div>

            <p
                className="mt-2 text-gray-500 text-center"
                style={{ fontSize: `${0.65 * zoom}rem` }}
            >
                {buildings.length} buildings
            </p>
        </div>
    );
}
