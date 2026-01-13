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

    return {
        config,
        updateAlliance,
        resetToDefaults,
        exportConfig,
        importConfig
    };
}
