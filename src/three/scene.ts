import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building, BUILDING_COLORS } from '../types/Building';
import { AllianceConfig } from '../types/Alliance'; // Import AllianceConfig
import { calculateFacilityStatus, formatCountdown } from '../utils/timeCalculations';

// Constants from reference project (wos-interactive-map-lite)
const GRID_SIZE = 1200;
const EULER_ROTATION = new THREE.Euler(Math.PI / 8, -Math.PI / 8, -Math.PI / 4);
const FONT_NAME = "80px Inter";

// Alliance colors matching reference (Fallback)
const DEFAULT_ALLIANCE_COLORS: Record<string, number> = {
    unassigned: 0x6b7280,
    alliance_a: 0xef4444,
    alliance_b: 0x3b82f6,
    alliance_c: 0x10b981,
    alliance_d: 0xfbbf24,
    alliance_e: 0xa855f7,
};

export interface SceneManager {
    dispose: () => void;
    renderBuildings: (buildings: Building[], allianceConfig?: AllianceConfig) => void;
    focusOnBuilding: (id: string) => void;
    getClickedBuilding: (x: number, y: number) => string | null;
    setSelectedBuilding: (id: string | null) => void;
    resetView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    handleResize: () => void;
}

// ... global references ...
const buildingMap = new Map<THREE.Object3D, string>();
const buildingMeshes = new Map<string, THREE.Group>();
// ... timer sprites ...
interface TimerSpriteRef {
    sprite: THREE.Sprite;
    building: Building;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    texture: THREE.CanvasTexture;
}
const timerSprites: TimerSpriteRef[] = [];

// ... planes ...
let plane: THREE.Mesh;
let planeSelected: THREE.Mesh;

export function initScene(container: HTMLElement, onBuildingSelect?: (id: string) => void): SceneManager {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x335799);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.001, 10000000);
    camera.position.set(-448, -414, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.dampingFactor = 0.25;
    controls.panSpeed = 1;
    controls.rotateSpeed = 0;
    controls.screenSpacePanning = true;
    controls.enableRotate = false;
    controls.touches.ONE = THREE.TOUCH.PAN;

    initPlane(scene);

    const geometrySelected = new THREE.PlaneGeometry(1, 1);
    const materialSelected = new THREE.MeshBasicMaterial({
        color: 0x89CFF0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
    });
    planeSelected = new THREE.Mesh(geometrySelected, materialSelected);
    planeSelected.position.set(10000, 10000, 0);
    planeSelected.renderOrder = 1;
    scene.add(planeSelected);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let lastTouchDistance = 0;
    let selectedId: string | null = null;
    let currentBuildings: Building[] = [];
    let currentAllianceConfig: AllianceConfig | undefined; // Store config

    let pointerDownX = 0;
    let pointerDownY = 0;
    let isPointerDown = false;

    const textureLoader = new THREE.TextureLoader();
    const markerTextures: Record<string, THREE.Texture> = {};

    const texturePaths = {
        fortress: '/world/cannon_fortress.png',
        stronghold: '/world/stronghold.png',
        engineering_station: '/world/engineering_station.png'
    };

    Object.entries(texturePaths).forEach(([key, path]) => {
        textureLoader.load(path, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            markerTextures[key] = texture;
            if (currentBuildings.length > 0) {
                renderBuildings(currentBuildings, currentAllianceConfig); // Re-render with config
            }
        });
    });

    // ... (keep input handlers same) ...
    function getTouchDistance(touches: TouchList): number {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // ...
    function handleTouchStart(event: TouchEvent) {
        if (event.touches.length === 2) {
            lastTouchDistance = getTouchDistance(event.touches);
        }
    }
    function handleTouchMove(event: TouchEvent) {
        if (event.touches.length === 2) {
            const currentTouchDistance = getTouchDistance(event.touches);
            const zoomFactor = 0.5;
            const currentFOV = camera.fov;
            let newFOV = currentFOV - zoomFactor * (currentTouchDistance - lastTouchDistance);
            camera.fov = Math.min(Math.max(0.5, newFOV), 80);
            camera.updateProjectionMatrix();
            lastTouchDistance = currentTouchDistance;
        }
    }
    function handleTouchEnd() {
        lastTouchDistance = 0;
    }
    function handleMouseWheel(event: WheelEvent) {
        event.preventDefault();
        if (event.target !== renderer.domElement) return;
        const currentFOV = camera.fov;
        let zoomFactor = event.deltaY * 0.05;
        if (currentFOV < 2) {
            zoomFactor *= 0.01;
        } else if (currentFOV < 10) {
            zoomFactor *= 0.1;
        } else if (currentFOV < 30) {
            zoomFactor *= 0.3;
        }
        let newFOV = Math.min(Math.max(0.5, currentFOV + zoomFactor), 80);
        camera.fov = newFOV;
        camera.updateProjectionMatrix();
        controls.update();
    }
    function handlePointerDown(event: PointerEvent) {
        isPointerDown = true;
        pointerDownX = event.clientX;
        pointerDownY = event.clientY;
    }
    function handlePointerUp(event: PointerEvent) {
        if (!isPointerDown) return;
        isPointerDown = false;
        const dx = event.clientX - pointerDownX;
        const dy = event.clientY - pointerDownY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 5 && onBuildingSelect) {
            const id = getClickedBuilding(event.clientX, event.clientY);
            if (id) {
                onBuildingSelect(id);
            }
        }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    renderer.domElement.addEventListener('wheel', handleMouseWheel, { passive: false });
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    let animationId: number;
    let lastTimeUpdate = 0;

    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        camera.position.z = 1000;
        camera.rotation.copy(EULER_ROTATION);
        renderer.render(scene, camera);

        const showCoordinates = camera.fov < 30;

        buildingMeshes.forEach((group) => {
            group.children.forEach((child) => {
                if (child.userData.isCoordinate) {
                    child.visible = showCoordinates;
                }
                if (child.userData.isTimer) {
                    child.visible = showCoordinates;
                }
            });
        });

        const now = Date.now();
        if (now - lastTimeUpdate > 1000) {
            updateTimers();
            lastTimeUpdate = now;
        }
    }
    animate();

    function updateTimers() {
        if (timerSprites.length === 0) return;
        timerSprites.forEach(ref => {
            const { building, ctx, texture } = ref;
            const status = calculateFacilityStatus(building.protectionEndTime);
            ctx.clearRect(0, 0, 512, 128);
            let text = '';
            let color = '#ffffff';
            if (status.status === 'protected') {
                text = formatCountdown(status.remainingSeconds);
                color = '#60a5fa';
            } else {
                text = 'CONTESTED';
                color = '#ef4444';
            }
            ctx.font = 'bold 80px Inter';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 8;
            ctx.strokeText(text, 256, 64);
            ctx.fillText(text, 256, 64);
            texture.needsUpdate = true;
        });
    }

    function handleResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    function dispose() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        renderer.domElement.removeEventListener('wheel', handleMouseWheel);
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointerup', handlePointerUp);
        controls.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        buildingMap.clear();
        buildingMeshes.clear();
        timerSprites.length = 0;
        Object.values(markerTextures).forEach(t => t.dispose());
    }

    // UPDATED: renderBuildings now accepts allianceConfig
    function renderBuildings(buildings: Building[], allianceConfig?: AllianceConfig) {
        currentBuildings = buildings;
        currentAllianceConfig = allianceConfig; // Update stored config

        buildingMap.forEach((_, mesh) => {
            scene.remove(mesh);
            if (mesh instanceof THREE.Mesh || mesh instanceof THREE.Sprite) {
                if (mesh instanceof THREE.Mesh) mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        buildingMap.clear();
        buildingMeshes.clear();
        timerSprites.length = 0;

        buildings.forEach(building => {
            const texture = markerTextures[building.type];
            // Pass allianceConfig to createBuildingMesh
            const group = createBuildingMesh(building, texture, allianceConfig);
            scene.add(group);
            buildingMap.set(group, building.id);
            buildingMeshes.set(building.id, group);
        });

        updateTimers();
    }

    function focusOnBuilding(id: string) {
        const mesh = buildingMeshes.get(id);
        if (mesh) {
            camera.position.x = mesh.position.x - 448;
            camera.position.y = mesh.position.y - 414;
            controls.target.set(mesh.position.x, mesh.position.y, 0);
            camera.fov = 15;
            camera.updateProjectionMatrix();
        }
    }

    function getClickedBuilding(clientX: number, clientY: number): string | null {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(buildingMap.keys());
        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
            let obj: THREE.Object3D | null = intersects[0].object;
            while (obj) {
                const id = buildingMap.get(obj);
                if (id) return id;
                obj = obj.parent;
            }
        }
        return null;
    }

    function setSelectedBuilding(id: string | null) {
        if (selectedId && buildingMeshes.has(selectedId)) {
            const prev = buildingMeshes.get(selectedId);
            if (prev) prev.scale.setScalar(1);
        }
        selectedId = id;
        if (id && buildingMeshes.has(id)) {
            const mesh = buildingMeshes.get(id)!;
            mesh.scale.setScalar(1.2);
            const building = mesh.userData.building as Building;
            const size = getBuildingSize(building.type);
            planeSelected.scale.set(size.w * 1.2, size.h * 1.2, 1);
            planeSelected.position.set(mesh.position.x, mesh.position.y, -1);
        } else {
            planeSelected.position.set(10000, 10000, 0);
        }
    }

    function resetView() {
        camera.position.set(-448, -414, 1000);
        camera.fov = 75;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();
    }

    function zoomIn() {
        camera.fov = Math.max(0.5, camera.fov - 5);
        camera.updateProjectionMatrix();
    }

    function zoomOut() {
        camera.fov = Math.min(80, camera.fov + 5);
        camera.updateProjectionMatrix();
    }

    return {
        dispose,
        renderBuildings,
        focusOnBuilding,
        getClickedBuilding,
        setSelectedBuilding,
        resetView,
        zoomIn,
        zoomOut,
        handleResize,
    };
}

// ... initPlane same ...
function initPlane(scene: THREE.Scene) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '/world/map2.png',
        (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            plane = new THREE.Mesh(geometry, material);
            plane.renderOrder = 0;
            scene.add(plane);
        },
        undefined,
        () => {
            const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
            const material = new THREE.MeshBasicMaterial({
                color: 0x2a4a6a,
                side: THREE.DoubleSide,
            });
            plane = new THREE.Mesh(geometry, material);
            scene.add(plane);
        }
    );
}

// ... getBuildingSize same ...
function getBuildingSize(type: string): { w: number; h: number } {
    switch (type) {
        case 'sun_city':
            return { w: 80, h: 80 };
        case 'fortress':
            return { w: 60, h: 60 };
        case 'stronghold':
            return { w: 50, h: 50 };
        case 'engineering_station':
            return { w: 16, h: 16 };
        default:
            return { w: 10, h: 10 };
    }
}

// UPDATED: createBuildingMesh accepts allianceConfig and uses it
function createBuildingMesh(building: Building, texture?: THREE.Texture, allianceConfig?: AllianceConfig): THREE.Group {
    const group = new THREE.Group();
    const size = getBuildingSize(building.type);

    const colorHex = BUILDING_COLORS[building.type] || '#3b82f6';
    const color = new THREE.Color(colorHex);

    // Initial default or fallback
    let allianceColor = DEFAULT_ALLIANCE_COLORS[building.alliance] || 0x6b7280;
    let allianceAbbr = building.allianceName || building.alliance.slice(-1).toUpperCase();

    // Prioritize passed allianceConfig
    if (allianceConfig && building.alliance !== 'unassigned') {
        const config = allianceConfig[building.alliance];
        if (config) {
            allianceColor = parseInt(config.color.replace('#', '0x'));
            allianceAbbr = config.abbr || allianceAbbr;
        }
    } else {
        // Legacy fallback (loading direct from localStorage for quick fix if config not passed yet?)
        // ACTUALLY, if we pass config properly, we don't need this side effect anymore.
        // But for safety, we can keep it as secondary fallback or just remove it if we strictly pass props.
        // Let's rely on props.
    }

    const geometry = new THREE.PlaneGeometry(size.w, size.h);
    const isTransparent = building.type !== 'sun_city';
    const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isTransparent ? 0 : 0.9,
        depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 998;
    mesh.rotation.set(Math.PI / 16, -Math.PI / 16, 0);
    group.add(mesh);

    if (texture) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(size.w, size.h, 1);
        sprite.renderOrder = 999;
        group.add(sprite);
    }

    if (building.alliance !== 'unassigned') {
        const sprite = createTextSprite(allianceAbbr, allianceColor, "bold 150px Inter");
        let labelOffset = 1.2;
        if (building.type === 'fortress') labelOffset = 1;
        else if (building.type === 'stronghold') labelOffset = 0.9;
        else if (building.type === 'sun_city') labelOffset = 0.8;
        sprite.position.set(0, 0, -size.h * labelOffset);
        group.add(sprite);
    }

    const coordText = `(${building.coordinates.x}, ${building.coordinates.y})`;
    const coordSprite = createTextSprite(coordText, 0xffffff, "bold 90px Inter");
    coordSprite.position.set(0, 0, size.h * 0.8);
    coordSprite.scale.set(12, 6, 1);
    coordSprite.visible = false;
    coordSprite.userData = { isCoordinate: true };
    group.add(coordSprite);

    if (building.type === 'engineering_station') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const timerSprite = new THREE.Sprite(mat);
        timerSprite.position.set(0, 0, -size.h * 1.7);
        timerSprite.scale.set(12, 3, 1);
        timerSprite.renderOrder = 1000;
        timerSprite.userData = { isTimer: true };
        group.add(timerSprite);
        timerSprites.push({
            sprite: timerSprite,
            building,
            canvas,
            ctx,
            texture
        });
    }

    const x = building.coordinates.x - 600;
    const y = building.coordinates.y - 600;
    group.position.set(x, y, 0);
    group.userData = { building };
    return group;
}

// ... createTextSprite same ...
function createTextSprite(text: string, color: number, font: string = FONT_NAME): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 256;
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = font;
    context.fillStyle = '#' + color.toString(16).padStart(6, '0');
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.renderOrder = 999;
    sprite.scale.set(10, 5, 1);
    return sprite;
}
