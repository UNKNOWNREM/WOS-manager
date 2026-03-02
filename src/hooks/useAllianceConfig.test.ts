// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react';
import { useAllianceConfig } from './useAllianceConfig';
import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_ALLIANCE_CONFIG, AllianceConfig } from '../types/Alliance';

describe('useAllianceConfig', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('returns default config initially', () => {
        const { result } = renderHook(() => useAllianceConfig());
        expect(result.current.config).toEqual(DEFAULT_ALLIANCE_CONFIG);
    });

    it('updates alliance', () => {
        const { result } = renderHook(() => useAllianceConfig());

        act(() => {
            result.current.updateAlliance('allianceA', { name: 'Alpha Team' });
        });

        // This expects the Logic to be implemented. Skeleton does nothing so this will fail.
        expect(result.current.config.allianceA.name).toBe('Alpha Team');
    });

    it('resets to defaults', () => {
        const { result } = renderHook(() => useAllianceConfig());

        act(() => {
            result.current.updateAlliance('allianceA', { name: 'Changed' });
        });

        // Assuming update worked, reset should bring it back
        // But skeleton doesn't update, so we need to rely on the sequence logic failing if it never changes
        // Or mock implementation in test? No, we test real implementation.

        act(() => {
            result.current.resetToDefaults();
        });

        expect(result.current.config).toEqual(DEFAULT_ALLIANCE_CONFIG);
    });

    it('exports config', () => {
        const { result } = renderHook(() => useAllianceConfig());
        const json = result.current.exportConfig();
        const parsed = JSON.parse(json);
        expect(parsed).toEqual(DEFAULT_ALLIANCE_CONFIG);
    });

    it('imports config', () => {
        const { result } = renderHook(() => useAllianceConfig());
        const newConfig: AllianceConfig = {
            ...DEFAULT_ALLIANCE_CONFIG,
            allianceA: { ...DEFAULT_ALLIANCE_CONFIG.allianceA, name: 'Imported' }
        };

        let success = false;
        act(() => {
            success = result.current.importConfig(JSON.stringify(newConfig));
        });

        expect(success).toBe(true);
        expect(result.current.config.allianceA.name).toBe('Imported');
    });
});
