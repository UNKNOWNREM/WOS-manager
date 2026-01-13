import * as THREE from 'three';
import { Building } from '../types/Building';
import {
    BUILDING_3D_COLORS,
    ALLIANCE_3D_COLORS,
    BUILDING_SIZES,
    COORD_SCALE,
    MAP_CENTER
} from './constants';

// Store building meshes for selection/update
const buildingMeshes: Map<string, THREE.Group> = new Map();

/**
 * Convert map coordinates to 3D world position
 */
export function mapToWorld(x: number, y: number): THREE.Vector3 {
    // Center the map at origin, flip Y for 3D space
    const worldX = (x - MAP_CENTER.x) * COORD_SCALE;
    const worldZ = -(y - MAP_CENTER.y) * COORD_SCALE;
    return new THREE.Vector3(worldX, 0, worldZ);
}

/**
 * Create a 2.5D building mesh based on type
 */
export function createBuildingMesh(building: Building): THREE.Group {
    const group = new THREE.Group();
    const type = building.type;
    const size = BUILDING_SIZES[type] || BUILDING_SIZES.engineering_station;
    const baseColor = BUILDING_3D_COLORS[type] || 0x3b82f6;
    const allianceColor = ALLIANCE_3D_COLORS[building.alliance] || 0x6b7280;

    // Create building based on type
    switch (type) {
        case 'sun_city':
            createSunCityMesh(group, size, baseColor);
            break;
        case 'fortress':
            createFortressMesh(group, size, baseColor, allianceColor);
            break;
        case 'stronghold':
            createStrongholdMesh(group, size, baseColor, allianceColor);
            break;
        case 'engineering_station':
        default:
            createStationMesh(group, size, baseColor, allianceColor, building.status === 'protected');
            break;
    }

    // Add alliance label
    if (building.alliance !== 'unassigned') {
        const label = createTextLabel(building.allianceName || building.alliance.slice(-1).toUpperCase(), allianceColor);
        label.position.set(0, size.height + 1.5, 0);
        group.add(label);
    }

    // Position in world
    const pos = mapToWorld(building.coordinates.x, building.coordinates.y);
    group.position.copy(pos);

    // Store reference
    group.userData = { buildingId: building.id, building };
    buildingMeshes.set(building.id, group);

    return group;
}

/**
 * Sun City - Large golden tower with spikes
 */
function createSunCityMesh(group: THREE.Group, size: { width: number; height: number; depth: number }, color: number) {
    // Main cylinder
    const cylinderGeom = new THREE.CylinderGeometry(size.width / 2, size.width / 2.5, size.height, 8);
    const cylinderMat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100,
    });
    const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
    cylinder.position.y = size.height / 2;
    group.add(cylinder);

    // Top golden sphere (sun)
    const sphereGeom = new THREE.SphereGeometry(size.width / 3, 16, 16);
    const sphereMat = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.y = size.height + size.width / 3;
    group.add(sphere);

    // Base platform
    const baseGeom = new THREE.CylinderGeometry(size.width / 1.5, size.width / 1.3, 1, 8);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.5;
    group.add(base);
}

/**
 * Fortress - Square tower with battlements
 */
function createFortressMesh(group: THREE.Group, size: { width: number; height: number; depth: number }, color: number, allianceColor: number) {
    // Main tower
    const towerGeom = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const towerMat = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = size.height / 2;
    group.add(tower);

    // Alliance colored top
    const topGeom = new THREE.BoxGeometry(size.width + 0.5, 0.5, size.depth + 0.5);
    const topMat = new THREE.MeshPhongMaterial({ color: allianceColor });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = size.height;
    group.add(top);

    // Corner towers
    const cornerSize = 0.8;
    const positions = [
        [-size.width / 2, 0, -size.depth / 2],
        [-size.width / 2, 0, size.depth / 2],
        [size.width / 2, 0, -size.depth / 2],
        [size.width / 2, 0, size.depth / 2],
    ];
    positions.forEach(([x, _, z]) => {
        const cornerGeom = new THREE.CylinderGeometry(cornerSize, cornerSize, size.height * 1.2, 6);
        const cornerMat = new THREE.MeshPhongMaterial({ color });
        const corner = new THREE.Mesh(cornerGeom, cornerMat);
        corner.position.set(x, size.height * 0.6, z);
        group.add(corner);
    });

    // Base
    const baseGeom = new THREE.BoxGeometry(size.width * 1.3, 0.5, size.depth * 1.3);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x3d3d3d });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.25;
    group.add(base);
}

/**
 * Stronghold - Hexagonal fortress with dome
 */
function createStrongholdMesh(group: THREE.Group, size: { width: number; height: number; depth: number }, color: number, allianceColor: number) {
    // Main hexagonal body
    const hexGeom = new THREE.CylinderGeometry(size.width / 2, size.width / 2, size.height, 6);
    const hexMat = new THREE.MeshPhongMaterial({ color: 0x5a5a5a });
    const hex = new THREE.Mesh(hexGeom, hexMat);
    hex.position.y = size.height / 2;
    group.add(hex);

    // Dome top
    const domeGeom = new THREE.SphereGeometry(size.width / 2.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhongMaterial({ color });
    const dome = new THREE.Mesh(domeGeom, domeMat);
    dome.position.y = size.height;
    group.add(dome);

    // Alliance ring
    const ringGeom = new THREE.TorusGeometry(size.width / 2 + 0.3, 0.3, 8, 6);
    const ringMat = new THREE.MeshPhongMaterial({ color: allianceColor, emissive: allianceColor, emissiveIntensity: 0.3 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = size.height * 0.7;
    group.add(ring);

    // Base platform
    const baseGeom = new THREE.CylinderGeometry(size.width / 1.3, size.width / 1.2, 0.8, 6);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.4;
    group.add(base);
}

/**
 * Engineering Station - Simple cylinder with platform
 */
function createStationMesh(
    group: THREE.Group,
    size: { width: number; height: number; depth: number },
    color: number,
    allianceColor: number,
    isProtected: boolean
) {
    // Main cylinder
    const cylGeom = new THREE.CylinderGeometry(size.width / 2, size.width / 2.2, size.height, 8);
    const cylMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const cyl = new THREE.Mesh(cylGeom, cylMat);
    cyl.position.y = size.height / 2;
    group.add(cyl);

    // Top platform with building color
    const topGeom = new THREE.CylinderGeometry(size.width / 2 + 0.2, size.width / 2, 0.4, 8);
    const topMat = new THREE.MeshPhongMaterial({ color });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = size.height;
    group.add(top);

    // Alliance indicator
    const indicatorGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const indicatorMat = new THREE.MeshPhongMaterial({ color: allianceColor, emissive: allianceColor, emissiveIntensity: 0.2 });
    const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
    indicator.position.y = size.height + 0.6;
    group.add(indicator);

    // Protection shield (if protected)
    if (isProtected) {
        const shieldGeom = new THREE.SphereGeometry(size.width * 1.2, 16, 16);
        const shieldMat = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.25,
            emissive: 0x3b82f6,
            emissiveIntensity: 0.2,
        });
        const shield = new THREE.Mesh(shieldGeom, shieldMat);
        shield.position.y = size.height / 2;
        group.add(shield);
    }

    // Base platform
    const baseGeom = new THREE.CylinderGeometry(size.width / 1.5, size.width / 1.3, 0.4, 8);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x3d3d3d });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.2;
    group.add(base);
}

/**
 * Create text label sprite
 */
function createTextLabel(text: string, color: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 64;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(4, 4, 120, 56, 8);
    ctx.fill();

    // Text
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 2, 1);
    sprite.renderOrder = 999;

    return sprite;
}

/**
 * Get building mesh by ID
 */
export function getBuildingMesh(id: string): THREE.Group | undefined {
    return buildingMeshes.get(id);
}

/**
 * Clear all building meshes
 */
export function clearBuildingMeshes() {
    buildingMeshes.clear();
}

/**
 * Highlight selected building
 */
export function highlightBuilding(id: string | null, scene: THREE.Scene) {
    buildingMeshes.forEach((mesh, meshId) => {
        const isSelected = meshId === id;
        mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (isSelected) {
                    child.material = (child.material as THREE.MeshPhongMaterial).clone();
                    (child.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
                }
            }
        });
        // Scale selected building
        mesh.scale.setScalar(isSelected ? 1.15 : 1);
    });
}
