import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    // Initialize state with value from localStorage or fallback to initialValue
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

/**
 * Custom hook for left panel zoom level (75% - 125%)
 */
export function useLeftPanelZoom() {
    const [zoom, setZoom] = useLocalStorage<number>('leftPanelZoom', 1);

    const increaseZoom = useCallback(() => {
        setZoom(prev => Math.min(1.25, prev + 0.05));
    }, [setZoom]);

    const decreaseZoom = useCallback(() => {
        setZoom(prev => Math.max(0.75, prev - 0.05));
    }, [setZoom]);

    const resetZoom = useCallback(() => {
        setZoom(1);
    }, [setZoom]);

    return {
        zoom,
        increaseZoom,
        decreaseZoom,
        resetZoom,
        setZoom,
    };
}

/**
 * Custom hook for map view state (zoom & pan)
 */
export function useMapViewState() {
    const [zoom, setZoom] = useLocalStorage<number>('mapZoom', 1);
    const [pan, setPan] = useLocalStorage<{ x: number; y: number }>('mapPan', { x: 0, y: 0 });

    const resetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [setZoom, setPan]);

    return {
        zoom,
        setZoom,
        pan,
        setPan,
        resetView,
    };
}
