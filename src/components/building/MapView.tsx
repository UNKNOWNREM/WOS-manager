import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Info } from 'lucide-react';
import {
    Building,
    BUILDING_COLORS,
    ALLIANCE_COLORS,
    STATUS_COLORS,
} from '../../types/Building';

interface MapViewProps {
    buildings: Building[];
    selectedId: string | null;
    onSelectMarker: (id: string) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    pan: { x: number; y: number };
    onPanChange: (pan: { x: number; y: number }) => void;
    onResetView: () => void;
}

// Map constants
const MAP_SIZE = 1200;
const MAP_CENTER = { x: 597, y: 597 };
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

// Visibility threshold for smaller buildings (Engineering Stations)
const STATION_VISIBILITY_ZOOM_THRESHOLD = 0.8;

// Minimum visual size in pixels for major buildings (Fortress, Stronghold) when zoomed out
const MIN_VISUAL_SIZE = 24;

/**
 * MapView Component
 * Canvas-based map with zoom/pan and building markers
 */
export default function MapView({
    buildings,
    selectedId,
    onSelectMarker,
    zoom,
    onZoomChange,
    pan,
    onPanChange,
    onResetView,
}: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapImageRef = useRef<HTMLImageElement | null>(null);
    const markerImagesRef = useRef<Record<string, HTMLImageElement>>({});
    const [mapLoaded, setMapLoaded] = useState(false);
    const [markersLoaded, setMarkersLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(true);
    const animationFrameRef = useRef<number>();

    // Load map background image and marker images
    useEffect(() => {
        console.error('MapView: Component Mounted'); // ERROR level for visibility
        let loadedCount = 0;
        const totalImages = 4; // Map + 3 markers

        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                console.error('MapView: All images loaded');
                setMapLoaded(true);
                setMarkersLoaded(true);
            }
        };

        // Load Map
        console.error('MapView: Starting map image load...');
        const mapImg = new Image();
        mapImg.onload = () => {
            console.error('MapView: Map background loaded successfully');
            mapImageRef.current = mapImg;
            checkLoaded();
        };
        mapImg.onerror = (e) => {
            console.error('MapView: Failed to load map image: /world/map2.png', e);
            checkLoaded();
        };
        mapImg.src = '/world/map2.png';

        // Load Markers
        const markers = {
            fortress: '/world/cannon_fortress.png',
            stronghold: '/world/stronghold.png',
            engineering_station: '/world/engineering_station.png',
        };

        Object.entries(markers).forEach(([type, src]) => {
            const img = new Image();
            img.onload = () => {
                console.error(`MapView: Marker loaded successfully: ${type}`);
                markerImagesRef.current[type] = img;
                checkLoaded();
            };
            img.onerror = (e) => {
                console.error(`MapView: Failed to load marker image: ${src}`, e);
                checkLoaded();
            };
            img.src = src;
        });
    }, []);

    // Convert map coordinates to canvas coordinates
    const mapToCanvas = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
        const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;
        const centerX = canvas.width / 2 + pan.x;
        const centerY = canvas.height / 2 + pan.y;

        // Map coordinates are from bottom-left, canvas from top-left
        const canvasX = centerX + (x - MAP_CENTER.x) * scale;
        const canvasY = centerY - (y - MAP_CENTER.y) * scale; // Flip Y

        return { x: canvasX, y: canvasY, scale };
    }, [zoom, pan]);

    // Convert canvas coordinates to map coordinates
    const canvasToMap = useCallback((canvasX: number, canvasY: number, canvas: HTMLCanvasElement) => {
        const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;
        const centerX = canvas.width / 2 + pan.x;
        const centerY = canvas.height / 2 + pan.y;

        const mapX = (canvasX - centerX) / scale + MAP_CENTER.x;
        const mapY = MAP_CENTER.y - (canvasY - centerY) / scale; // Flip Y

        return { x: mapX, y: mapY };
    }, [zoom, pan]);

    // Helper to determine if a building should be visible
    const isBuildingVisible = useCallback((type: string, currentZoom: number) => {
        if (type === 'engineering_station') {
            return currentZoom > STATION_VISIBILITY_ZOOM_THRESHOLD;
        }
        return true; // Always show major buildings
    }, []);

    // Helper to calculate render size
    const getRenderSize = useCallback((type: string, baseSize: number, scale: number) => {
        const rawSize = baseSize * scale;

        // Enforce minimum size for major buildings
        if (type === 'fortress' || type === 'stronghold') {
            return Math.max(MIN_VISUAL_SIZE, rawSize);
        }

        return rawSize;
    }, []);

    // Draw the map
    const drawMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        if (mapImageRef.current) {
            // Calculate image position and size
            const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;
            const imgSize = MAP_SIZE * scale;
            const { x: centerX, y: centerY } = mapToCanvas(MAP_CENTER.x, MAP_CENTER.y, canvas);

            ctx.drawImage(
                mapImageRef.current,
                centerX - imgSize / 2,
                centerY - imgSize / 2,
                imgSize,
                imgSize
            );
        } else {
            // Fallback: dark background with grid
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;
            const gridSize = 100 * scale;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;

            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }

        // Draw buildings
        const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;

        buildings.forEach(building => {
            // Check visibility
            if (!isBuildingVisible(building.type, zoom)) return;

            const { x, y } = mapToCanvas(building.coordinates.x, building.coordinates.y, canvas);

            const isSelected = building.id === selectedId;
            const isHovered = building.id === hoveredBuilding;

            const baseSize = getMarkerSize(building.type);
            let size = getRenderSize(building.type, baseSize, scale);

            // Apply hover/selection scaling
            if (isSelected) size *= 1.3;
            else if (isHovered) size *= 1.15;

            // Draw marker
            drawMarker(
                ctx,
                x,
                y,
                size,
                building,
                isSelected,
                isHovered,
                markerImagesRef.current
            );

            // Draw alliance label when zoomed out (< 0.7) and visible
            if (zoom < 0.7 && building.alliance !== 'unassigned' &&
                (building.type === 'fortress' || building.type === 'stronghold')) {
                drawAllianceLabel(ctx, x, y - size / 2 - 5, building.allianceName || building.alliance.slice(-1).toUpperCase());
            }
        });

        // Draw selection highlight animation
        if (selectedId) {
            const selected = buildings.find(b => b.id === selectedId);
            if (selected && isBuildingVisible(selected.type, zoom)) {
                const { x, y } = mapToCanvas(selected.coordinates.x, selected.coordinates.y, canvas);
                drawSelectionRipple(ctx, x, y, scale);
            }
        }
    }, [buildings, selectedId, hoveredBuilding, zoom, pan, mapToCanvas, mapLoaded, markersLoaded, isBuildingVisible, getRenderSize]);

    // Animation loop
    useEffect(() => {
        const animate = () => {
            drawMap();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [drawMap]);

    // Resize canvas to container
    useEffect(() => {
        const handleResize = () => {
            const container = containerRef.current;
            const canvas = canvasRef.current;
            if (!container || !canvas) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle mouse wheel zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
        onZoomChange(newZoom);
    }, [zoom, onZoomChange]);

    // Attach wheel event with passive: false to allow preventDefault
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Handle mouse down for dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [pan]);

    // Handle mouse move for dragging and hover
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging) {
            onPanChange({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        } else {
            // Check for hover
            const mapPos = canvasToMap(x, y, canvas);
            const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;

            let hovered: string | null = null;
            // Iterate in reverse to catch top-most items first
            for (let i = buildings.length - 1; i >= 0; i--) {
                const building = buildings[i];

                // Skip if invisible
                if (!isBuildingVisible(building.type, zoom)) continue;

                const dist = Math.sqrt(
                    Math.pow(building.coordinates.x - mapPos.x, 2) +
                    Math.pow(building.coordinates.y - mapPos.y, 2)
                );

                // Calculate hit radius based on visual size
                const baseSize = getMarkerSize(building.type);
                const visualSize = getRenderSize(building.type, baseSize, scale);
                // Hit radius in map units
                const hitRadius = (visualSize / 2) / scale;

                if (dist < hitRadius) {
                    hovered = building.id;
                    break;
                }
            }
            setHoveredBuilding(hovered);
        }
    }, [isDragging, dragStart, buildings, zoom, canvasToMap, onPanChange, isBuildingVisible, getRenderSize]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle click on building
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isDragging) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const mapPos = canvasToMap(x, y, canvas);
        const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE * zoom;

        // Iterate in reverse to catch top-most items first
        for (let i = buildings.length - 1; i >= 0; i--) {
            const building = buildings[i];

            // Skip if invisible
            if (!isBuildingVisible(building.type, zoom)) continue;

            const dist = Math.sqrt(
                Math.pow(building.coordinates.x - mapPos.x, 2) +
                Math.pow(building.coordinates.y - mapPos.y, 2)
            );

            const baseSize = getMarkerSize(building.type);
            const visualSize = getRenderSize(building.type, baseSize, scale);
            const hitRadius = (visualSize / 2) / scale;

            if (dist < hitRadius) {
                onSelectMarker(building.id);
                return;
            }
        }
    }, [isDragging, buildings, zoom, canvasToMap, onSelectMarker, isBuildingVisible, getRenderSize]);

    return (
        <div
            ref={containerRef}
            className="relative h-full glass-panel rounded-xl overflow-hidden"
        >
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
            />

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
                    className="glass-panel p-2 rounded-lg hover:bg-white/15 transition-colors"
                    title="Zoom in"
                >
                    <ZoomIn size={18} />
                </button>
                <div className="glass-panel px-2 py-1 rounded-lg text-center text-sm">
                    {Math.round(zoom * 100)}%
                </div>
                <button
                    onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
                    className="glass-panel p-2 rounded-lg hover:bg-white/15 transition-colors"
                    title="Zoom out"
                >
                    <ZoomOut size={18} />
                </button>
                <button
                    onClick={onResetView}
                    className="glass-panel p-2 rounded-lg hover:bg-white/15 transition-colors mt-2"
                    title="Reset view"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Hover Tooltip */}
            {hoveredBuilding && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass-panel px-3 py-2 rounded-lg text-sm z-10 pointer-events-none">
                    {buildings.find(b => b.id === hoveredBuilding)?.name}
                </div>
            )}

            {/* Legend Toggle */}
            <button
                onClick={() => setShowLegend(!showLegend)}
                className="absolute bottom-4 right-4 glass-panel p-2 rounded-lg hover:bg-white/15 transition-colors"
                title="Toggle legend"
            >
                <Info size={18} />
            </button>

            {/* Legend */}
            {showLegend && (
                <div className="absolute bottom-16 right-4 glass-panel p-3 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2">Legend</h4>
                    <div className="space-y-1.5">
                        <LegendItem color={BUILDING_COLORS.fortress} shape="square" label="Fortress" />
                        <LegendItem color={BUILDING_COLORS.stronghold} shape="hexagon" label="Stronghold" />
                        <LegendItem color={BUILDING_COLORS.engineering_station} shape="circle" label="Station" />
                        <LegendItem color={BUILDING_COLORS.sun_city} shape="star" label="Sun City" />
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                        <LegendItem color={STATUS_COLORS.protected} shape="circle" label="Protected" />
                        <LegendItem color={STATUS_COLORS.opening} shape="circle" label="Open" />
                        <LegendItem color={STATUS_COLORS.soon} shape="circle" label="Soon" />
                    </div>
                </div>
            )}

            {/* Drag indicator */}
            <div className="absolute bottom-4 left-4 glass-panel px-2 py-1 rounded text-xs text-gray-400 flex items-center gap-1">
                <Move size={12} />
                Drag to pan
            </div>
        </div>
    );
}

// Legend Item Component
function LegendItem({ color, shape, label }: { color: string; shape: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-3 h-3 ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-sm' : ''}`}
                style={{ backgroundColor: color }}
            />
            <span className="text-gray-300">{label}</span>
        </div>
    );
}

// Get marker size based on building type (Base Size)
function getMarkerSize(type: string): number {
    switch (type) {
        case 'fortress': return 50; // Larger base size for icons
        case 'stronghold': return 60;
        case 'engineering_station': return 24; // Smaller for stations
        case 'sun_city': return 64;
        default: return 20;
    }
}

// Draw building marker
function drawMarker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    building: Building,
    isSelected: boolean,
    isHovered: boolean,
    images: Record<string, HTMLImageElement>
) {
    const color = BUILDING_COLORS[building.type];
    const allianceColor = ALLIANCE_COLORS[building.alliance];

    ctx.save();

    // Draw alliance border/glow (Underlay)
    if (building.alliance !== 'unassigned') {
        ctx.shadowColor = allianceColor;
        ctx.shadowBlur = isSelected ? 20 : 10;

        // Draw a circle under the icon for alliance glow
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = allianceColor;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Draw Image Marker if available
    if (images[building.type]) {
        // Center the image
        ctx.drawImage(
            images[building.type],
            x - size / 2,
            y - size / 2,
            size,
            size
        );

        // Selection border
        if (isSelected || isHovered) {
            ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0; // Reset shadow for stroke
            ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        }

    } else {
        // Fallback to geometric shapes
        ctx.fillStyle = color;
        ctx.strokeStyle = isSelected ? '#fbbf24' : isHovered ? '#ffffff' : allianceColor;
        ctx.lineWidth = isSelected ? 3 : 2;

        switch (building.type) {
            case 'sun_city':
                // Star/circle with glow
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            default:
                // Circle (fallback)
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    // Engineering Station Status Overlay (Shield)
    if (building.type === 'engineering_station' && building.status === 'protected') {
        const shieldSize = size * 0.4;
        const offset = size / 2;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x + offset / 1.4, y - offset / 1.4, shieldSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw alliance label
function drawAllianceLabel(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
    ctx.save();
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Background
    const metrics = ctx.measureText(label);
    const padding = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(
        x - metrics.width / 2 - padding,
        y - 14 - padding,
        metrics.width + padding * 2,
        14 + padding
    );

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x, y);

    ctx.restore();
}

// Draw selection ripple effect
function drawSelectionRipple(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    const time = Date.now() / 1000;
    const rippleRadius = 25 + Math.sin(time * 3) * 5;

    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, rippleRadius * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
