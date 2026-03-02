import * as THREE from 'three';

// Map constants
export const MAP_SIZE = 1200;
export const MAP_CENTER = { x: 597, y: 597 };

// Camera constants for 2.5D isometric view
export const CAMERA_SETTINGS = {
    fov: 45,
    near: 0.1,
    far: 10000,
    initialDistance: 800,
    minDistance: 200,
    maxDistance: 1500,
    // Isometric angle (approx 30 degrees from horizontal)
    angle: Math.PI / 6,
};

// Building colors
export const BUILDING_3D_COLORS = {
    sun_city: 0xfbbf24,      // Yellow/Gold
    fortress: 0xef4444,      // Red
    stronghold: 0xa855f7,       // Purple
    engineering_station: 0x3b82f6, // Blue
};

// Alliance colors
export const ALLIANCE_3D_COLORS: Record<string, number> = {
    unassigned: 0x6b7280,
    alliance_a: 0xef4444,
    alliance_b: 0x3b82f6,
    alliance_c: 0x10b981,
    alliance_d: 0xfbbf24,
    alliance_e: 0xa855f7,
};

// Building sizes (relative units)
export const BUILDING_SIZES = {
    sun_city: { width: 8, height: 6, depth: 8 },
    fortress: { width: 5, height: 4, depth: 5 },
    stronghold: { width: 6, height: 5, depth: 6 },
    engineering_station: { width: 3, height: 2, depth: 3 },
};

// Euler rotation for 2.5D isometric view
export const ISOMETRIC_ROTATION = new THREE.Euler(
    Math.PI / 16,    // X rotation (tilt forward)
    -Math.PI / 4,    // Y rotation (45 degree turn)
    0
);

// Scale factor to convert map coordinates to 3D world
export const COORD_SCALE = 1;
