import { useLocalStorage } from './useLocalStorage';
import { AllianceConfig, DEFAULT_ALLIANCE_CONFIG } from '../types/Alliance';

/**
 * Hook for managing alliance configuration
 */
export function useAllianceConfig() {
    const [config, setConfig] = useLocalStorage<AllianceConfig>(
        'alliance_config',
        DEFAULT_ALLIANCE_CONFIG
    );

    const updateAlliance = (
        allianceId: string,
        updates: Partial<AllianceConfig[string]>
    ) => {
        setConfig(prev => ({
            ...prev,
            [allianceId]: {
                ...prev[allianceId],
                ...updates
            }
        }));
    };

    const resetToDefaults = () => {
        setConfig(DEFAULT_ALLIANCE_CONFIG);
    };

    const exportConfig = () => {
        return JSON.stringify(config, null, 2);
    };

    const importConfig = (jsonString: string): boolean => {
        try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === 'object' && parsed !== null) {
                setConfig(parsed as AllianceConfig);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const addAlliance = () => {
        const id = `alliance_${Date.now()}`;
        const newAlliance = {
            id,
            name: 'New Alliance',
            abbr: 'NEW',
            color: '#94a3b8', // Slate-400 default
            notes: ''
        };

        setConfig(prev => ({
            ...prev,
            [id]: newAlliance
        }));

        return id;
    };

    const deleteAlliance = (id: string) => {
        if (id === 'unassigned') return; // Protect unassigned

        setConfig(prev => {
            const newConfig = { ...prev };
            delete newConfig[id];
            return newConfig;
        });
    };

    return {
        config,
        updateAlliance,
        addAlliance,
        deleteAlliance,
        resetToDefaults,
        exportConfig,
        importConfig
    };
}
