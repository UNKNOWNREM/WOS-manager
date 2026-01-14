import { useRef, useEffect, useCallback, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Info } from 'lucide-react';
import { Building, BUILDING_COLORS, STATUS_COLORS } from '../../types/Building';
import { initScene, SceneManager } from '../../three/scene';
import { useAllianceConfig } from '../../hooks/useAllianceConfig';

interface MapView3DProps {
    buildings: Building[];
    selectedId: string | null;
    onSelectMarker: (id: string) => void;
    onResetView: () => void;
}

/**
 * 3D Map View Component
 * Uses Three.js with reference project approach:
 * - Fixed camera z, FOV-based zoom
 * - Pan-only controls (no rotation)
 * - Buildings as rotated planes with isometric effect
 */
export default function MapView3D({
    buildings,
    selectedId,
    onSelectMarker,
    onResetView,
}: MapView3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const [showLegend, setShowLegend] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Get alliance config for dynamic colors
    const { config: allianceConfig } = useAllianceConfig();

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        let resizeObserver: ResizeObserver | null = null;
        // ... (rest of init same)

        try {
            const manager = initScene(containerRef.current, onSelectMarker);
            sceneManagerRef.current = manager;
            setIsLoading(false);

            // Watch for container size changes
            resizeObserver = new ResizeObserver(() => {
                if (sceneManagerRef.current) {
                    // Small delay to ensure DOM has updated
                    setTimeout(() => {
                        sceneManagerRef.current?.handleResize();
                    }, 100);
                }
            });
            resizeObserver.observe(containerRef.current);
        } catch (err) {
            console.error('Failed to initialize 3D scene:', err);
            setIsLoading(false);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (sceneManagerRef.current) {
                sceneManagerRef.current.dispose();
                sceneManagerRef.current = null;
            }
        };
    }, []);

    // Render buildings when data or alliance config changes
    useEffect(() => {
        if (!sceneManagerRef.current || buildings.length === 0) return;
        sceneManagerRef.current.renderBuildings(buildings, allianceConfig);
    }, [buildings, allianceConfig]);

    // Handle selection changes
    useEffect(() => {
        if (!sceneManagerRef.current) return;
        sceneManagerRef.current.setSelectedBuilding(selectedId);

        if (selectedId) {
            sceneManagerRef.current.focusOnBuilding(selectedId);
        }
    }, [selectedId]);



    // Zoom controls
    const handleZoomIn = useCallback(() => {
        sceneManagerRef.current?.zoomIn();
    }, []);

    const handleZoomOut = useCallback(() => {
        sceneManagerRef.current?.zoomOut();
    }, []);

    const handleResetView = useCallback(() => {
        sceneManagerRef.current?.resetView();
        onResetView();
    }, [onResetView]);

    return (
        <div className="relative h-full glass-panel rounded-xl overflow-hidden">
            {/* 3D Canvas Container */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"

            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-cyan mx-auto mb-2"></div>
                        <p className="text-sm text-slate-400">Loading 3D Map...</p>
                    </div>
                </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={handleZoomIn}
                    className="glass-panel p-2.5 rounded-lg hover:bg-white/15 transition-colors"
                    title="Zoom in (scroll up)"
                    aria-label="Zoom in"
                >
                    <ZoomIn size={18} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="glass-panel p-2.5 rounded-lg hover:bg-white/15 transition-colors"
                    title="Zoom out (scroll down)"
                    aria-label="Zoom out"
                >
                    <ZoomOut size={18} />
                </button>
                <div className="h-px bg-cloud/20 my-1" />
                <button
                    onClick={handleResetView}
                    className="glass-panel p-2.5 rounded-lg hover:bg-white/15 transition-colors"
                    title="Reset view"
                    aria-label="Reset view"
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    onClick={() => {
                        // Center on Sun City
                        if (buildings.length > 0) {
                            const sunCity = buildings.find(b => b.type === 'sun_city');
                            if (sunCity) onSelectMarker(sunCity.id);
                        }
                    }}
                    className="glass-panel p-2.5 rounded-lg hover:bg-white/15 transition-colors"
                    title="Go to Sun City"
                    aria-label="Center on Sun City"
                >
                    <Crosshair size={18} />
                </button>
            </div>

            {/* Legend Toggle */}
            <button
                onClick={() => setShowLegend(!showLegend)}
                className={`absolute bottom-4 right-4 glass-panel p-2.5 rounded-lg hover:bg-white/15 transition-colors ${showLegend ? 'text-pink-cyan' : ''}`}
                title="Toggle legend"
                aria-label="Toggle legend"
            >
                <Info size={18} />
            </button>

            {/* Legend */}
            {showLegend && (
                <div className="absolute bottom-16 right-4 glass-panel p-3 rounded-lg text-sm min-w-[140px] border border-cloud/10">
                    <h4 className="font-semibold mb-2 text-white">Building Types</h4>
                    <div className="space-y-1.5">
                        <LegendItem color={BUILDING_COLORS.sun_city} label="Sun City" />
                        <LegendItem color={BUILDING_COLORS.fortress} label="Fortress" />
                        <LegendItem color={BUILDING_COLORS.stronghold} label="Stronghold" />
                        <LegendItem color={BUILDING_COLORS.engineering_station} label="Station" />
                    </div>
                    <div className="mt-3 pt-2 border-t border-cloud/10 space-y-1.5">
                        <h4 className="font-semibold mb-1 text-white text-xs">Status</h4>
                        <LegendItem color={STATUS_COLORS.protected} label="Protected" />
                        <LegendItem color={STATUS_COLORS.opening} label="Opening" />
                    </div>

                    <div className="mt-3 pt-2 border-t border-cloud/10">
                        <h4 className="font-semibold mb-1 text-white text-xs">Controls</h4>
                        <div className="text-xs text-slate-400 flex flex-col gap-1">
                            <span>🖱️ Drag to pan</span>
                            <span>⚲ Scroll to zoom</span>
                            <span>👆 Click to select</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Zoom indicator */}

            {/* Zoom indicator */}
            <div className="absolute top-4 left-4 glass-panel px-2 py-1 rounded text-xs text-gray-400">
                3D Map
            </div>
        </div>
    );
}

// Legend Item Component
function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className="w-3 h-3 rounded-sm shadow-sm"
                style={{ backgroundColor: color }}
            />
            <span className="text-gray-300 text-xs">{label}</span>
        </div>
    );
}
