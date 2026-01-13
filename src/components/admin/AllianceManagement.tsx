import { useState } from 'react';
import { Shield, Save, RefreshCw, FileDown, FileUp } from 'lucide-react';
import { useAllianceConfig } from '../../hooks/useAllianceConfig';

export function AllianceManagement() {
    const { config, updateAlliance, resetToDefaults, exportConfig, importConfig } = useAllianceConfig();
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all alliances to default? This cannot be undone.')) {
            resetToDefaults();
            showNotification('Alliances reset to default configuration');
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportConfig());
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "wos_alliance_config.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification('Alliance configuration exported successfully');
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = importConfig(e.target?.result as string);
            if (success) {
                showNotification('Alliance configuration imported successfully');
            } else {
                showNotification('Failed to import configuration: Invalid JSON', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const alliances = Object.values(config);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield size={20} className="text-indigo-400" />
                    Alliance Configuration
                </h2>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-900/20 rounded border border-indigo-900/50 transition-colors cursor-pointer">
                        <FileUp size={12} />
                        Import JSON
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-900/20 rounded border border-indigo-900/50 transition-colors"
                    >
                        <FileDown size={12} />
                        Export JSON
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 rounded border border-red-900/50 transition-colors"
                    >
                        <RefreshCw size={12} />
                        Reset to Default
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {notification.type === 'success' ? <Save size={18} /> : <RefreshCw size={18} />}
                    {notification.message}
                </div>
            )}

            {/* Alliance Cards */}
            <div className="space-y-4">
                {alliances.map((alliance) => (
                    <div
                        key={alliance.id}
                        className="bg-slate-800 rounded-xl border border-slate-700 p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: alliance.color }}
                            />
                            {alliance.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={alliance.name}
                                    onChange={(e) => updateAlliance(alliance.id, { name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Abbreviation */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Abbreviation (shown on map)
                                </label>
                                <input
                                    type="text"
                                    value={alliance.abbr}
                                    onChange={(e) => updateAlliance(alliance.id, { abbr: e.target.value })}
                                    maxLength={5}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={alliance.color}
                                        onChange={(e) => updateAlliance(alliance.id, { color: e.target.value })}
                                        className="w-12 h-10 bg-slate-900 border border-slate-600 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={alliance.color}
                                        onChange={(e) => updateAlliance(alliance.id, { color: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={alliance.notes}
                                    onChange={(e) => updateAlliance(alliance.id, { notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Optional notes about this alliance..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
