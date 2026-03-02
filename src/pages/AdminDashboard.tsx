import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    Save,
    RefreshCw,
    Building2,
    Castle,
    Shield,
    Image as ImageIcon,
    FileDown,
    FileUp,
    Upload,
    Clock,
    Users,
    Database,
    Trash2
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_REWARDS, RewardConfig, RewardCycle, REWARD_CYCLES, getReward } from '../data/rewards';

import { BuildingReward, BuildingType } from '../types/Building';
import { REWARD_ICONS } from '../data/assets';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { FacilityControl } from '../components/admin/FacilityControl';
import { AllianceManagement } from '../components/admin/AllianceManagement';
import { Building } from '../types/Building';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'rewards' | 'facility' | 'alliance' | 'settings'>('rewards');
    const [currentCycle, setCurrentCycle] = useLocalStorage<RewardCycle>('currentCycle', 1);
    const [rewards, setRewards] = useLocalStorage<RewardConfig>('rewards_config', INITIAL_REWARDS);
    const [buildings, setBuildings] = useLocalStorage<Building[]>('buildings', []);

    // Notifications state
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleResetRewards = () => {
        if (confirm('Are you sure you want to reset all rewards to default? This cannot be undone.')) {
            setRewards(INITIAL_REWARDS);
            showNotification('Rewards reset to default configuration');
        }
    };

    const handleExportConfig = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rewards, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "wos_rewards_config.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification('Configuration exported successfully');
    };

    const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Basic validation: check if it has keys matching our ID pattern or just trust it
                if (typeof json === 'object' && json !== null) {
                    setRewards(json as RewardConfig);
                    showNotification('Configuration imported successfully');
                } else {
                    throw new Error('Invalid JSON format');
                }
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Failed to import configuration: Invalid JSON', 'error');
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    // Helper to update a specific reward

    const updateRewardFull = (buildingId: string, cycleIndex: number, newReward: BuildingReward) => {
        const newRewards = { ...rewards };
        if (!newRewards[buildingId]) return;

        // Create a copy of the cycle array
        const cycleRewards = [...newRewards[buildingId]];

        // Update the specific reward item
        cycleRewards[cycleIndex] = newReward;

        newRewards[buildingId] = cycleRewards;
        setRewards(newRewards);
    };

    const handleUpdateBuilding = (buildingId: string, updates: Partial<Building>) => {
        setBuildings(prev => prev.map(b =>
            b.id === buildingId ? { ...b, ...updates } : b
        ));
    };

    const handleClearData = (key: string, label: string) => {
        if (confirm(`Are you sure you want to clear all ${label} data? This cannot be undone.`)) {
            localStorage.removeItem(key);
            showNotification(`${label} data cleared. Please refresh the page.`);
            // Force reload to reset state properly
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const handleClearAllData = () => {
        if (confirm('WARNING: THIS WILL WIPE ALL DATA INCLUDING CUSTOM BUILDINGS, SETTINGS, AND ALLIANCES.\n\nAre you sure you want to proceed?')) {
            if (confirm('Double check: This action is irreversible. Do you really want to reset the entire application?')) {
                localStorage.clear();
                showNotification('All data wiped. Application will reload.');
                setTimeout(() => window.location.reload(), 1500);
            }
        }
    };

    return (
        <div className="min-h-screen text-slate-100 font-sans">
            {/* Header */}
            <Header
                title="WOS Manager Admin"
                subtitle="Map Configuration Dashboard"
                icon={<Settings size={24} className="text-pink-cyan" />}
                actions={
                    <>
                        <LanguageSwitcher />
                        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
                            <span className="text-sm text-slate-300 whitespace-nowrap">Global Map Cycle:</span>
                            <select
                                value={currentCycle}
                                onChange={(e) => {
                                    setCurrentCycle(Number(e.target.value) as RewardCycle);
                                    showNotification(`Global cycle updated to Week ${e.target.value}`);
                                }}
                                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                                aria-label="Select Global Cycle"
                            >
                                {REWARD_CYCLES.map(c => (
                                    <option key={c} value={c} className="bg-slate-900">Week {c}</option>
                                ))}
                            </select>
                        </div>

                        <a
                            href="/map.html"
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 bg-grad-smoke-light hover:brightness-110 rounded-lg transition-all shadow-lg hover:shadow-smoke-light/50 text-sm whitespace-nowrap text-white"
                            aria-label="Open Map in new tab"
                        >
                            <Building2 size={16} />
                            Open Map
                        </a>
                    </>
                }
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 md:p-6">

                {/* Navigation Tabs */}
                <div className="flex items-center gap-4 border-b border-slate-700 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rewards'
                            ? 'border-pink-cyan text-pink-cyan'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        aria-label="Switch to Reward Management"
                    >
                        <LayoutDashboard size={18} />
                        Reward Management
                    </button>
                    <button
                        onClick={() => setActiveTab('facility')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'facility'
                            ? 'border-pink-cyan text-pink-cyan'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        aria-label="Switch to Facility Control"
                    >
                        <Clock size={18} />
                        Facility Control
                    </button>
                    <button
                        onClick={() => setActiveTab('alliance')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'alliance'
                            ? 'border-pink-cyan text-pink-cyan'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        aria-label="Switch to Alliance Management"
                    >
                        <Users size={18} />
                        Alliance Management
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings'
                            ? 'border-pink-cyan text-pink-cyan'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        aria-label="Switch to System Settings"
                    >
                        <Settings size={18} />
                        System Settings
                    </button>
                    {/* Placeholder for future tab
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                            activeTab === 'schedule' 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Calendar size={18} />
                        Schedule
                    </button>
                    */}
                </div>

                {/* Notifications */}
                {notification && (
                    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {notification.type === 'success' ? <Save size={18} /> : <Settings size={18} />}
                        {notification.message}
                    </div>
                )}

                {/* Rewards Editor */}
                {activeTab === 'rewards' && (
                    <div className="space-y-8">

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-pink-cyan">
                                <ImageIcon size={20} />
                                Reward Configuration
                            </h2>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 px-3 py-1.5 text-xs text-pink-cyan hover:bg-pink-cyan/10 rounded border border-pink-cyan/30 transition-colors cursor-pointer">
                                    <FileUp size={12} />
                                    Import JSON
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImportConfig}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={handleExportConfig}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-pink-cyan hover:bg-pink-cyan/10 rounded border border-pink-cyan/30 transition-colors"
                                >
                                    <FileDown size={12} />
                                    Export JSON
                                </button>
                                <button
                                    onClick={handleResetRewards}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/20 rounded border border-red-900/50 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Reset to Default
                                </button>
                            </div>
                        </div>

                        {/* Strongholds Section */}
                        <div className="glass-panel rounded-xl overflow-hidden border border-cloud/10">
                            <div className="p-4 bg-slate-900/40 border-b border-cloud/10 flex items-center gap-2">
                                <Shield size={18} className="text-purple-gauze" />
                                <h3 className="font-semibold text-purple-gauze">Strongholds</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 sticky left-0 bg-slate-900 z-10 w-24 border-r border-slate-800">ID</th>
                                            {REWARD_CYCLES.map(c => (
                                                <th key={c} className={`px-4 py-3 min-w-[220px] ${currentCycle === c ? 'bg-indigo-900/40 text-pink-cyan border-b-2 border-pink-cyan' : ''}`}>
                                                    Week {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {['S01', 'S02', 'S03', 'S04'].map(id => (
                                            <tr key={id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-200 sticky left-0 bg-slate-800 z-10 border-r border-slate-700">
                                                    {id}
                                                </td>
                                                {rewards[id]?.map((reward, idx) => (
                                                    <td key={idx} className={`px-4 py-3 ${currentCycle === idx + 1 ? 'bg-indigo-900/10' : ''}`}>
                                                        <RewardEditor
                                                            reward={reward}
                                                            onUpdate={(newReward) => updateRewardFull(id, idx, newReward)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Fortresses Section */}
                        <div className="glass-panel rounded-xl overflow-hidden border border-cloud/10">
                            <div className="p-4 bg-slate-900/40 border-b border-cloud/10 flex items-center gap-2">
                                <Castle size={18} className="text-red-400" />
                                <h3 className="font-semibold text-red-300">Fortresses</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 sticky left-0 bg-slate-900 z-10 w-24 border-r border-slate-800">ID</th>
                                            {REWARD_CYCLES.map(c => (
                                                <th key={c} className={`px-4 py-3 min-w-[220px] ${currentCycle === c ? 'bg-indigo-900/40 text-pink-cyan border-b-2 border-pink-cyan' : ''}`}>
                                                    Week {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {Array.from({ length: 12 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`).map(id => (
                                            <tr key={id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-200 sticky left-0 bg-slate-800 z-10 border-r border-slate-700">
                                                    {id}
                                                </td>
                                                {rewards[id]?.map((reward, idx) => (
                                                    <td key={idx} className={`px-4 py-3 ${currentCycle === idx + 1 ? 'bg-indigo-900/10' : ''}`}>
                                                        <RewardEditor
                                                            reward={reward}
                                                            onUpdate={(newReward) => updateRewardFull(id, idx, newReward)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* Facility Control Tab */}
                {activeTab === 'facility' && (
                    <FacilityControl
                        buildings={buildings}
                        onUpdateBuilding={handleUpdateBuilding}
                    />
                )}

                {/* Alliance Management Tab */}
                {activeTab === 'alliance' && (
                    <AllianceManagement />
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-pink-cyan">
                                <Database size={20} />
                                System Settings & Data Management
                            </h2>
                        </div>

                        {/* Danger Zone */}
                        <div className="glass-panel border-red-900/30 rounded-xl overflow-hidden">
                            <div className="p-4 bg-red-950/20 border-b border-red-900/20 flex items-center gap-2">
                                <Trash2 size={18} className="text-red-400" />
                                <h3 className="font-semibold text-red-300">Danger Zone</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div>
                                        <h4 className="font-medium text-slate-200">Clear All Data</h4>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Completely wipe all local storage data, including custom buildings, rewards, alliances, and settings.
                                            The application will be reset to its initial state.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClearAllData}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Reset Application
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-slate-200">Reset Buildings</h4>
                                            <p className="text-xs text-slate-400 mt-1">Reverts all buildings to default.</p>
                                        </div>
                                        <button
                                            onClick={() => handleClearData('buildings', 'Buildings')}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-red-900/50 text-slate-200 hover:text-red-200 border border-slate-600 hover:border-red-800 rounded transition-all text-sm"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-slate-200">Reset Rewards</h4>
                                            <p className="text-xs text-slate-400 mt-1">Reverts reward config to default.</p>
                                        </div>
                                        <button
                                            onClick={() => handleClearData('rewards_config', 'Rewards')}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-red-900/50 text-slate-200 hover:text-red-200 border border-slate-600 hover:border-red-800 rounded transition-all text-sm"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-slate-200">Reset Alliances</h4>
                                            <p className="text-xs text-slate-400 mt-1">Clears all custom alliances.</p>
                                        </div>
                                        <button
                                            onClick={() => handleClearData('alliance_config', 'Alliance')}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-red-900/50 text-slate-200 hover:text-red-200 border border-slate-600 hover:border-red-800 rounded transition-all text-sm"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-slate-200">Reset Preferences</h4>
                                            <p className="text-xs text-slate-400 mt-1">Clears UI settings (zoom, sort, etc).</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('leftPanelCollapsed');
                                                localStorage.removeItem('leftPanelZoom');
                                                localStorage.removeItem('autoSort');
                                                localStorage.removeItem('currentCycle');
                                                showNotification('UI Preferences reset.');
                                                setTimeout(() => window.location.reload(), 1000);
                                            }}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-red-900/50 text-slate-200 hover:text-red-200 border border-slate-600 hover:border-red-800 rounded transition-all text-sm"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

// Sub-component for editing a single reward cell
function RewardEditor({
    reward,
    onUpdate
}: {
    reward: BuildingReward,
    onUpdate: (reward: BuildingReward) => void
}) {
    const [localReward, setLocalReward] = useState(reward);

    // Sync from parent only when reward object reference changes (e.g. cycle switch)
    useEffect(() => {
        setLocalReward(reward);
    }, [reward]);

    // Use a ref to hold the debounce timeout
    const timeoutRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];

    const handleChange = (field: keyof BuildingReward, value: any) => {
        const newReward = { ...localReward, [field]: value };

        // Auto-match name to icon locally
        if (field === 'name' && typeof value === 'string' && value.length > 2) {
            const lowerValue = value.toLowerCase();
            const tokens = lowerValue.split(/\s+/).filter(t => t.length > 0);

            const match = REWARD_ICONS.find(icon => {
                const lowerIcon = icon.toLowerCase();
                // Check if all tokens are present in the icon name
                return tokens.every(token => lowerIcon.includes(token));
            });

            if (match) {
                newReward.icon = `/reward/${match}`;
            }
        }

        // Update local state immediately
        setLocalReward(newReward);

        // Debounce update to parent
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onUpdate(newReward);
        }, 500); // 500ms debounce
    };

    const flushUpdate = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onUpdate(localReward);
    };

    const handleBlur = () => {
        flushUpdate();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            flushUpdate();
            (e.target as HTMLElement).blur();
        } else if (e.key === 'Tab') {
            // Autocomplete logic
            const value = localReward.name;
            if (typeof value === 'string' && value.length > 1) {
                const lowerValue = value.toLowerCase();
                const tokens = lowerValue.split(/\s+/).filter(t => t.length > 0);

                const match = REWARD_ICONS.find(icon => {
                    const lowerIcon = icon.toLowerCase();
                    return tokens.every(token => lowerIcon.includes(token));
                });

                if (match) {
                    e.preventDefault(); // Stop tab from moving focus
                    const newName = match.replace(/\.[^/.]+$/, ""); // Remove extension
                    const newIcon = `/reward/${match}`;

                    const newReward = { ...localReward, name: newName, icon: newIcon };
                    setLocalReward(newReward);
                    // Optionally flush immediately or let debounce handle it?
                    // Let's flush immediately so user sees it "locked in"
                    // Actually, just updating state is enough, user can hit Enter to confirm.
                }
            }
        }
    };

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1.5">
                <div className="relative">
                    {(localReward.icon?.startsWith('http') || localReward.icon?.startsWith('/')) ? (
                        <div className="relative group">
                            <img
                                src={localReward.icon}
                                className="w-8 h-8 object-contain bg-slate-800 rounded border border-slate-600 cursor-pointer"
                                alt="icon"
                            />
                            <input
                                type="text"
                                value={localReward.icon || ''}
                                onChange={(e) => handleChange('icon', e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 focus:opacity-100 bg-slate-900 text-xs text-center border border-slate-600 rounded"
                                title="Click to edit path"
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={localReward.icon || ''}
                            onChange={(e) => handleChange('icon', e.target.value)}
                            placeholder="Icon"
                            className="w-8 h-8 text-center bg-slate-900 border border-slate-600 rounded text-xs py-1"
                            title="Icon path or emoji"
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                        />
                    )}
                </div>
            </div>
            <input
                type="text"
                value={localReward.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Item Name"
                className="w-full bg-slate-900 border border-slate-600 rounded text-xs py-1 px-1.5"
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}
