# WOS 建筑管理系统实现计划

## 项目概述

创建一个完整的建筑管理系统，包含左侧建筑列表（40%）和右侧互动地图（60%），支持联盟分配、时间管理（Unix时间戳）、状态追踪和双向互动。

**建筑数量**：总计 91 个建筑
- 12 个堡垒 (Fortresses)
- 4 个要塞 (Citadels)
- 74 个工程站 (Engineering Stations) - **8 种子类型**
- 1 个太阳城中心 (Sun City)

### 核心功能
1. **左右分栏布局**：建筑列表 (40%) + 地图 (60%)，**左侧面板可折叠、可缩放**
2. **建筑管理**：90 个主要建筑（12 Fortresses + 4 Citadels + 74 Engineering Stations）的分类显示、联盟分配、时间编辑、状态管理
3. **工程站子类型**：8 种（Construction 5、Gathering 8、Production 12、Tech 12、Weapons 5、Training 16、Defense 6、Expedition 10）
4. **时间系统**：使用 Unix 时间戳存储，本地时区显示
5. **双向互动**：列表 ↔ 地图点击联动、高亮、滚动定位
6. **默认语言**：**英文界面**，预留多语言支持（i18n）作为后续扩展
6. **数据持久化**：localStorage 存储所有数据

### 新增需求（基于游戏截图和说明）
6. **工程站保护盾机制**：占领后3天保护期，显示保护盾图标和倒计时
7. **堡垒/要塞管理分派**：管理层分配系统，显示奖励、固定开启时间
8. **地图缩放联盟显示**：缩小时显示联盟名称（如 "BaB"）
9. **地图控制功能**：快速回到中心点，恢复到初始位置
10. **导航栏设计**：顶部或侧边导航栏，按建筑类型分类显示
11. **时间自动排序**：建筑列表按开启时间快慢自动排序
12. **左侧面板缩放**：调整列表内容大小（字体、卡片尺寸）

---

## 用户审查事项

> [!WARNING]
> **参考项目 - 务必参考**
> 
> 参考项目：[wos-interactive-map-lite](https://github.com/Krozac/wos-interactive-map-lite)
> 
> **请务必参考此项目的实现方式**：
> - 代码结构和组件设计
> - 地图交互和控制逻辑
> - UI/UX 设计风格
> - 性能优化方案
> 
> 同时参考本项目的 `index.html`，两个页面设计应该差不多。

> [!IMPORTANT]
> **地图背景图位置**
> 
> 需求文档中提到使用 `/mnt/project/map2.png` 作为地图背景。
> 
> 请确认：
> 1. 您是否有 `map2.png` 文件？
> 2. 文件应放在哪个目录（`public/` 或 `world/`）？
> 
> 如果没有背景图，将使用深色背景 + 网格线作为替代方案。

> [!IMPORTANT]
> **技术栈选择**
> 
> 基于需求分析和参考项目，计划使用：
> - **前端框架**: React + TypeScript
> - **地图渲染**: HTML Canvas 2D（与参考项目一致）
> - **默认语言**: English (英文)
> - **国际化**: 预留 i18n 支持，后续可扩展
> - **原因**: 
>   - 需求中的 2D 顶视图、缩放、平移用 Canvas 更简单高效
>   - 标记动画（脉动、闪烁）用 CSS + Canvas 更易实现
>   - 与参考项目保持技术栈一致

---

## 提议的变更

### 核心页面文件

#### [NEW] [map.html](file:///d:/github/wos-manager/map.html)
基于 `ranks.html` 创建，包含：
- 深色主题配色（#1a1a2e 背景）
- React 和相关库的 importmap
- Tailwind CSS 配置

#### [NEW] [map.tsx](file:///d:/github/wos-manager/map.tsx)
页面入口：
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BuildingManager from './src/pages/BuildingManager';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BuildingManager />
  </StrictMode>
);
```

---

### 主页面组件

#### [NEW] [src/pages/BuildingManager.tsx](file:///d:/github/wos-manager/src/pages/BuildingManager.tsx)
主页面组件，包含左右分栏布局：

**状态管理**：
```typescript
const [buildings, setBuildings] = useState<Building[]>([]);
const [selectedBuilding, setSelectedBuilding] = useState<string|null>(null);
const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);  // 左侧面板折叠状态
const [leftPanelZoom, setLeftPanelZoom] = useState(1);  // 新增：左侧面板缩放级别 (0.75 - 1.25)
const [filter, setFilter] = useState<FilterState>({
  buildingTypes: ['fortress', 'citadel', 'engineering_station'],
  alliances: [],
  statuses: []
});
```

**布局结构**：
```tsx
<div className="flex h-screen">
  {/* 左侧面板折叠按钮 */}
  <button 
    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
    className="fixed top-4 left-4 z-50 glass-panel p-2"
  >
    {leftPanelCollapsed ? '→' : '←'}
  </button>
  
  {/* 左侧面板（可折叠） */}
  <div 
    className={`transition-all duration-300 ${
      leftPanelCollapsed ? 'w-0' : 'w-[40%]'
    }`}
  >
    {!leftPanelCollapsed && (
      <BuildingList 
        buildings={filteredBuildings}
        selectedId={selectedBuilding}
        onSelect={handleSelectFromList}
      />
    )}
  </div>
  
  {/* 右侧地图（动态宽度） */}
  <div className={`transition-all duration-300 ${
    leftPanelCollapsed ? 'w-full' : 'w-[60%]'
  }`}>
    <MapView 
      buildings={buildings}
      selectedId={selectedBuilding}
      onSelectMarker={handleSelectFromMap}
      zoom={mapZoom}
    />
  </div>
</div>
```

---

### 顶部导航栏

#### [NEW] [src/components/BuildingNavBar.tsx](file:///d:/github/wos-manager/src/components/BuildingNavBar.tsx)
Top navigation bar, categorized by building type:
- **All Tab**: Show all 90 buildings
- **Fortresses Tab** (12): All fortresses
- **Citadels Tab** (4): All citadels  
- **Engineering Stations Tab** (74): Main tab + 8 sub-type dropdown
  - Construction Facility (5)
  - Gathering Facility (8)
  - Production Facility (12)
  - Tech Facility (12)
  - Weapons Facility (5)
  - Training Facility (16)
  - Defense Facility (6)
  - Expedition Facility (10)

**Design Style**:
- Horizontal tab bar, similar to tabs design
- Engineering Stations tab shows dropdown menu on hover with 8 sub-types
- Currently selected tab highlighted
- Each tab displays count badge (e.g., "Fortresses (12)")

---

### 左侧列表组件

#### [NEW] [src/components/BuildingList.tsx](file:///d:/github/wos-manager/src/components/BuildingList.tsx)
Left panel (40% width), contains:
- Top search and filter bar
- **Zoom Controller**: Adjust list content size (75% - 125%)
- **Auto-sort Toggle**: Sort by opening time (enabled by default)
- Three collapsible category sections (Fortresses, Citadels, Engineering Stations)
- Virtual scrolling for performance optimization

**Features**:
- Search: Real-time filter by building name/ID
- **Zoom功能**:
  - Zoom range: 75% - 125%
  - Affects font size, card dimensions, spacing
  - Zoom level saved to localStorage
  - 缩放按钮：+ / - / 重置
- **自动排序**：按开启时间从近到远排序（即将开启的在前）
- 手动排序：可切换按开启时间、关闭时间、联盟排序
- 自动滚动到选中建筑

#### [NEW] [src/components/BuildingCard.tsx](file:///d:/github/wos-manager/src/components/BuildingCard.tsx)
单个建筑卡片，**根据建筑类型显示不同内容**：

**工程站卡片**：
- 建筑图标 + 名称 + 编号（ES01-ES74）
- 联盟下拉选单（可编辑）
- **保护盾状态**：
  - 保护中：显示蓝色保护盾图标 + 剩余时间倒计时
  - 开启中：显示绿色脉动
  - 时间格式：`保护中 - 剩余 2天 15小时 30分钟`
- 开启时间（保护期结束时间，可编辑）
- 备注输入框
- "定位到地图"按钮

**Fortresses/Citadels Card**:
- Building icon + Name + ID (F01-F12, C01-C04)
- **Fixed Opening Time Display** (not editable, game rules)
- **Reward Information Display**:
  - Fortress rewards (e.g., Rare Resource Box x2)
  - Citadel rewards (e.g., Epic Equipment Shard x5)
- **Alliance Assignment**: Dropdown to select alliance
- Notes input field

**卡片样式**：
- glass-panel 玻璃态效果
- 选中时黄色高亮
- 悬停时添加边框

#### [NEW] [src/components/TimeEditor.tsx](file:///d:/github/wos-manager/src/components/TimeEditor.tsx)
时间编辑组件（**仅用于工程站**）：
- 显示本地时区时间（使用 `Intl.DateTimeFormat`）
- 点击弹出日期时间选择器
- 快速调整按钮（+1h, +6h, +12h, +1d, 现在, 明天）
- 自动转换为 Unix 时间戳存储
- 验证逻辑（开启 < 关闭）

**保护盾倒计时计算**：
```typescript
export function calculateProtectionRemaining(captureTime: number): string {
  const protectionEndTime = captureTime + (3 * 24 * 3600); // 3天保护期
  const now = Math.floor(Date.now() / 1000);
  const remaining = protectionEndTime - now;
  
  if (remaining <= 0) {
    return '保护已结束';
  }
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  return `保护中 - 剩余 ${days}天 ${hours}小时 ${minutes}分钟`;
}
```



#### [NEW] [src/components/CollapsibleSection.tsx](file:///d:/github/wos-manager/src/components/CollapsibleSection.tsx)
可折叠分类区块：
- 显示标题 + 数量统计
- 点击展开/折叠
- 支持平滑动画过渡

---

### 右侧地图组件

#### [NEW] [src/components/MapView.tsx](file:///d:/github/wos-manager/src/components/MapView.tsx)
右侧地图面板（宽度 60%），包含：
- Canvas 地图渲染
- 缩放控制（50% - 200%）
- **缩放级别追踪**（传递给渲染函数）
- **重置按钮**：快速回到中心点，恢复初始位置
- 地图图例（右下角）

**核心功能**：
```typescript
- 使用 HTML Canvas 2D 渲染地图
- 支持缩放（滚轮）和平移（拖拽）
- 渲染 91 个建筑标记（不同图标和颜色）
- 点击标记触发选中事件
- 根据缩放级别调整显示内容（联盟名称显示逻辑）
- 重置视图：一键回到地图中心（600, 600），缩放恢复到 100%
```

#### [NEW] [src/hooks/useMapCanvas.ts](file:///d:/github/wos-manager/src/hooks/useMapCanvas.ts)
地图 Canvas 管理 Hook：

**功能实现**：
```typescript
export function useMapCanvas(
  canvasRef: RefObject<HTMLCanvasElement>,
  buildings: Building[],
  selectedId: string | null
) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // 渲染地图背景（map2.png 或纯色）
  useEffect(() => {
    drawMapBackground(ctx, zoom, pan);
  }, [zoom, pan]);
  
  // 渲染建筑标记
  useEffect(() => {
    buildings.forEach(building => {
      drawBuildingMarker(ctx, building, selectedId, zoom); // 传递zoom
    });
  }, [buildings, selectedId, zoom]);
  
  // 处理鼠标事件（点击、拖拽、滚轮）
  useEffect(() => {
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleZoom);
    canvas.addEventListener('mousedown', handleDragStart);
  }, []);
}
```

#### [NEW] [src/utils/mapRenderer.ts](file:///d:/github/wos-manager/src/utils/mapRenderer.ts)
地图渲染工具函数：

**建筑标记渲染**（根据缩放级别调整）：
```typescript
export function drawBuildingMarker(
  ctx: CanvasRenderingContext2D,
  building: Building,
  isSelected: boolean,
  zoom: number  // 新增：缩放级别
) {
  const { x, y } = building.coordinates;
  
  // 根据建筑类型绘制图标
  switch (building.type) {
    case 'fortress':
      drawSquare(ctx, x, y, 24, '#ef4444'); // 红色方形
      break;
    case 'citadel':
      drawHexagon(ctx, x, y, 28, '#a855f7'); // 紫色六角形
      break;
    case 'engineering_station':
      drawCircle(ctx, x, y, 20, '#3b82f6'); // 蓝色圆形
      // 工程站保护盾绘制
      if (building.protectionEndTime > Date.now() / 1000) {
        drawProtectionShield(ctx, x, y);
      }
      break;
  }
  
  // 绘制联盟边框颜色
  const allianceColor = getAllianceColor(building.alliance);
  drawBorder(ctx, x, y, allianceColor);
  
  // 绘制状态动画
  drawStatusAnimation(ctx, x, y, building.status);
  
  // 如果选中，绘制高亮圆圈
  if (isSelected) {
    drawHighlight(ctx, x, y);
  }
  
  // 缩放小于 70% 时，显示联盟名称（堡垒和要塞）
  if (zoom < 0.7 && (building.type === 'fortress' || building.type === 'citadel')) {
    if (building.alliance !== 'unassigned') {
      drawAllianceLabel(ctx, x, y, building.allianceName); // 如 "BaB"
    }
  }
}
```

**保护盾图标绘制**：
```typescript
export function drawProtectionShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  // 绘制蓝色半透明保护盾
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#3b82f6';
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  
  // 盾牌外形（简化版）
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // 中心十字标记
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + 6, y);
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 6);
  ctx.stroke();
  
  ctx.restore();
}
```

**联盟名称绘制**（缩小时显示）：
```typescript
export function drawAllianceLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  allianceName: string  // 如 "BaB"
) {
  ctx.save();
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  
  // 黑色描边
  ctx.strokeText(allianceName, x, y - 20);
  // 白色填充
  ctx.fillText(allianceName, x, y - 20);
  
  ctx.restore();
}
```

**状态动画**：
```typescript
export function drawStatusAnimation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  status: BuildingStatus
) {
  const timestamp = Date.now();
  
  switch (status) {
    case 'protected':
      // 蓝色保护中（已在 drawProtectionShield 中处理）
      break;
      
    case 'opening':
      // 绿色脉动动画
      const pulseRadius = 20 + Math.sin(timestamp / 500) * 5;
      ctx.strokeStyle = '#10b981';
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case 'soon':
      // 黄色闪烁（距开启 < 1小时）
      if (Math.floor(timestamp / 500) % 2) {
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
      }
      break;
      
    case 'closing':
      // 灰色半透明
      ctx.globalAlpha = 0.3;
      break;
      
    case 'contested':
      // 红色边框加脉动
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
  }
}
```

#### [NEW] [src/components/MapLegend.tsx](file:///d:/github/wos-manager/src/components/MapLegend.tsx)
地图图例（右下角）：
- 三种建筑类型的图标说明
- 五种联盟的颜色说明
- **新增**：保护盾状态说明
- 四种状态的视觉表示

---

### 数据管理

#### [NEW] [src/types/Building.ts](file:///d:/github/wos-manager/src/types/Building.ts)
建筑数据类型定义（**更新**）：
```typescript
export interface Building {
  id: string;                    // F01, C01, ES01
  name: string;                 // Fortress F01 or Gathering Facility ES01
  type: 'fortress' | 'citadel' | 'engineering_station';
  
  // Engineering Station subtype (Engineering Stations only)
  stationSubType?: 'construction' | 'gathering' | 'production' | 'tech' | 'weapons' | 'training' | 'defense' | 'expedition';
  
  alliance: Alliance;           // Unassigned | Alliance A-E
  allianceName?: string;        // Alliance abbreviation (e.g., "BaB")
  
  // Engineering Station specific fields
  captureTime?: number;         // Capture time (Unix timestamp)
  protectionEndTime?: number;   // Protection period end time
  openTime?: number;            // Engineering Station: opens after protection
  
  // Fortress/Citadel specific fields
  fixedOpenTime?: number;       // Fixed opening time (game rules)
  reward?: BuildingReward;      // Reward information
  
  coordinates: { x: number; y: number }; // 0-1200
  status: BuildingStatus;       // Calculated
  notes: string;                // Optional notes
}

// 工程站子类型中英文映射
export const STATION_TYPE_NAMES = {
  'construction': '建设设施',
  'gathering': '采集设施',
  'production': '生产设施',
  'tech': '科技设施',
  'weapons': '武器设施',
  'training': '训练设施',
  'defense': '防御设施',
  'expedition': '远征设施'
} as const;

export interface BuildingReward {
  type: string;                 // 奖励类型
  name: string;                 // 奖励名称
  quantity: number;             // 数量
  icon?: string;                // 图标URL（可选）
}

export type Alliance = 'unassigned' | 'allianceA' | 'allianceB' | 'allianceC' | 'allianceD' | 'allianceE';

export type BuildingStatus = 'protected' | 'opening' | 'soon' | 'closing' | 'contested';

export function calculateStatus(building: Building): BuildingStatus {
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 3600;
  
  // 工程站特殊逻辑
  if (building.type === 'engineering_station') {
    if (building.protectionEndTime && now < building.protectionEndTime) {
      return 'protected';  // 保护中
    }
    if (building.openTime) {
      if (now >= building.openTime) {
        return 'opening';  // 开启中
      }
      if (building.openTime - now <= oneHour) {
        return 'soon';  // 即将开启
      }
    }
    return 'closing';
  }
  
  // 堡垒/要塞逻辑
  if (building.fixedOpenTime) {
    if (now >= building.fixedOpenTime) {
      return 'opening';
    }
    if (building.fixedOpenTime - now <= oneHour) {
      return 'soon';
    }
  }
  
  return 'closing';
}
```

#### [NEW] [src/utils/dataGenerator.ts](file:///d:/github/wos-manager/src/utils/dataGenerator.ts)
初始数据生成器（**更新**）：
```typescript
export function generateInitialBuildings(): Building[] {
  const buildings: Building[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  // 从 world/corrected_map_data.json 加载坐标
  const worldData = loadWorldData();
  
  // 生成 12 个堡垒（固定开启时间）
  const fortressRewards = [
    { type: 'resource', name: '稀有资源箱', quantity: 2 },
    { type: 'material', name: '建筑材料包', quantity: 3 }
  ];
  
  worldData.fortresses.forEach((f, i) => {
    buildings.push({
      id: `F${String(i + 1).padStart(2, '0')}`,
      name: `堡垒 F${String(i + 1).padStart(2, '0')}`,
      type: 'fortress',
      alliance: 'unassigned',
      fixedOpenTime: getNextFortressOpenTime(),  // 游戏固定规则
      reward: fortressRewards[i % fortressRewards.length],
      coordinates: { x: f.x, y: f.y },
      status: 'closing',
      notes: ''
    });
  });
  
  // 生成 4 个要塞（固定开启时间）
  const citadelRewards = [
    { type: 'equipment', name: '史诗装备碎片', quantity: 5 },
    { type: 'hero', name: '英雄经验书', quantity: 10 }
  ];
  
  worldData.citadels.forEach((c, i) => {
    buildings.push({
      id: `C${String(i + 1).padStart(2, '0')}`,
      name: `要塞 C${String(i + 1).padStart(2, '0')}`,
      type: 'citadel',
      alliance: 'unassigned',
      fixedOpenTime: getNextCitadelOpenTime(),
      reward: citadelRewards[i % citadelRewards.length],
      coordinates: { x: c.x, y: c.y },
      status: 'closing',
      notes: ''
    });
  });
  
  // 工程站子类型映射（中文名称 -> 英文key）
  const stationTypeMap = {
    '建设设施': 'construction',
    '采集设施': 'gathering',
    '生产设施': 'production',
    '科技设施': 'tech',
    '武器设施': 'weapons',
    '训练设施': 'training',
    '防御设施': 'defense',
    '远征设施': 'expedition'
  };
  
  // 生成 74 个工程站（保护盾机制 + 子类型）
  worldData.engineering_stations.forEach((e, i) => {
    const captureTime = now - randomInt(0, 172800);  // 0-2天前占领
    const protectionEndTime = captureTime + (3 * 24 * 3600);  // 3天保护期
    
    buildings.push({
      id: `ES${String(i + 1).padStart(2, '0')}`,
      name: `工程站 ES${String(i + 1).padStart(2, '0')}`,
      type: 'engineering_station',
      alliance: 'unassigned',
      captureTime,
      protectionEndTime,
      openTime: protectionEndTime,  // 保护期结束即开启
      coordinates: { x: e.x, y: e.y },
      status: 'protected',
      notes: ''
    });
  });
  
  return buildings;
}

// 堡垒固定开启时间规则（示例：每周一、三、五 20:00）
function getNextFortressOpenTime(): number {
  // 实现游戏规则的固定时间逻辑
  // 这里需要根据实际游戏规则实现
  return Math.floor(Date.now() / 1000) + 86400;  // 示例：明天
}

// 要塞固定开启时间规则（示例：每周二、四、六 21:00）
function getNextCitadelOpenTime(): number {
  return Math.floor(Date.now() / 1000) + 86400;  // 示例：明天
}
```

#### [NEW] [src/hooks/useLocalStorage.ts](file:///d:/github/wos-manager/src/hooks/useLocalStorage.ts)
localStorage 数据持久化 Hook：
```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
```

---

### 双向互动逻辑

#### [NEW] [src/hooks/useInteraction.ts](file:///d:/github/wos-manager/src/hooks/useInteraction.ts)
双向互动管理 Hook：

**从列表到地图**：
```typescript
export function handleSelectFromList(buildingId: string) {
  // 1. 设置选中状态
  setSelectedBuilding(buildingId);
  
  // 2. 地图平移到建筑位置
  const building = buildings.find(b => b.id === buildingId);
  panMapToBuilding(building);
  
  // 3. 放大标记并添加高亮
  highlightMarker(buildingId);
  
  // 4. 降低其他标记不透明度至 30%
  dimOtherMarkers(buildingId);
  
  // 5. 显示详情浮窗，3秒后自动消失
  showBuildingPopup(building, 3000);
}
```

**从地图到列表**：
```typescript
export function handleSelectFromMap(buildingId: string) {
  // 1. 设置选中状态
  setSelectedBuilding(buildingId);
  
  // 2. 列表滚动到该建筑卡片
  scrollToCard(buildingId);
  
  // 3. 卡片背景高亮（黄色，2秒）
  highlightCard(buildingId, 2000);
  
  // 4. 如果所属分类折叠，自动展开
  expandCategory(building.type);
  
  // 5. 地图标记添加脉动效果（2秒）
  pulseMarker(buildingId, 2000);
}
```

**悬停效果**：
```typescript
export function handleHoverList(buildingId: string | null) {
  // 鼠标悬停列表卡片 → 地图标记添加白色边框
  setHoveredBuilding(buildingId);
}

export function handleHoverMap(buildingId: string | null) {
  // 鼠标悬停地图标记 → 显示工具提示（名称+编号）
  setTooltip(buildingId ? getBuildingTooltip(buildingId) : null);
}
```

---

### 样式文件

#### [NEW] [src/styles/buildingManager.css](file:///d:/github/wos-manager/src/styles/buildingManager.css)
主样式文件：

**配色方案**：
```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --accent: #00d4ff;
  
  --alliance-unassigned: #6b7280;
  --alliance-a: #ef4444;
  --alliance-b: #3b82f6;
  --alliance-c: #10b981;
  --alliance-d: #fbbf24;
  --alliance-e: #a855f7;
  
  --status-protected: #3b82f6;    /* 新增：保护中 */
  --status-opening: #10b981;
  --status-soon: #fbbf24;
  --status-closing: #6b7280;
  --status-contested: #ef4444;
}
```

**玻璃态效果**：
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

**动画**：
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes shield-glow {
  0%, 100% { box-shadow: 0 0 5px var(--status-protected); }
  50% { box-shadow: 0 0 15px var(--status-protected); }
}

.status-protected { animation: shield-glow 2s infinite; }
.status-opening { animation: pulse 2s infinite; }
.status-soon { animation: blink 1s infinite; }
```

---

### 配置更新

#### [MODIFY] [vite.config.ts](file:///d:/github/wos-manager/vite.config.ts)
添加多页面支持：
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ranks: resolve(__dirname, 'ranks.html'),
        map: resolve(__dirname, 'map.html'),
      }
    }
  }
});
```

---

## 验证计划

### 功能验证清单

**布局和显示**：
- [ ] 左侧面板占 40% 宽度
- [ ] 右侧地图占 60% 宽度
- [ ] 91 个建筑分三类显示（12+5+74）
- [ ] 每个建筑卡片显示所有必需信息

**工程站特有功能**：
- [ ] 保护盾图标正确显示
- [ ] 倒计时准确计算并实时更新
- [ ] 保护期结束自动切换状态
- [ ] 开启时间可编辑

**堡垒/要塞特有功能**：
- [ ] 固定开启时间正确显示（不可编辑）
- [ ] 奖励信息正确显示
- [ ] 管理员分配界面正常工作
- [ ] 分配历史正确记录

**地图缩放功能**：
- [ ] 缩小至 < 70% 时显示联盟名称
- [ ] 联盟名称正确显示（如 "BaB"）
- [ ] 缩放过渡平滑

**时间管理**：
- [ ] 时间以本地时区正确显示
- [ ] 点击时间弹出编辑器（仅工程站）
- [ ] 快速调整按钮正常工作
- [ ] Unix 时间戳正确存储

**地图功能**：
- [ ] 地图背景正确显示（map2.png 或纯色）
- [ ] 91 个标记位置正确
- [ ] 三种建筑图标正确区分
- [ ] 缩放功能（50%-200%）正常
- [ ] 平移功能正常

**联盟和状态**：
- [ ] 联盟下拉选单可编辑
- [ ] 联盟边框颜色正确
- [ ] 状态自动计算正确
- [ ] 状态动画正常（保护盾、脉动、闪烁）

**双向互动**：
- [ ] 列表点击 → 地图定位正确
- [ ] 地图点击 → 列表滚动正确
- [ ] 选中时高亮效果正确
- [ ] 悬停时工具提示显示
- [ ] 折叠分类自动展开

**权限管理**：
- [ ] 管理员切换按钮正常工作
- [ ] 管理员界面正确显示/隐藏
- [ ] 普通用户无法访问分配功能

**数据持久化**：
- [ ] localStorage 正确存储数据
- [ ] 页面刷新后数据恢复
- [ ] 修改后自动保存

### 性能测试
- [ ] 91 个建筑渲染流畅（60fps）
- [ ] 虚拟滚动优化列表性能
- [ ] Canvas 动画不卡顿
- [ ] 倒计时更新不影响性能

### 浏览器兼容性
- [ ] Chrome 正常运行
- [ ] Firefox 正常运行
- [ ] Safari 正常运行
- [ ] Edge 正常运行

---

## 实现顺序

### 阶段 1：基础架构（3-4小时）
1. 创建 `map.html` 和 `map.tsx`
2. 创建 `BuildingManager.tsx` 主页面
3. 定义 TypeScript 类型（`Building.ts`，包含新字段）
4. 实现数据生成器（整合 world 数据，区分建筑类型）
5. 实现 localStorage Hook

### 阶段 2：左侧列表（5-6小时）
1. 创建 `BuildingList.tsx`
2. 创建 `BuildingCard.tsx`（区分工程站和堡垒/要塞）
3. 创建 `TimeEditor.tsx`（工程站专用）
4. 创建 `AssignmentPanel.tsx`（堡垒/要塞管理）
5. 创建 `CollapsibleSection.tsx`
6. 实现搜索和排序功能
7. 应用 glass-panel 样式

### 阶段 3：右侧地图（6-7小时）
1. 创建 `MapView.tsx`
2. 实现 `useMapCanvas` Hook
3. 实现 `mapRenderer.ts` 渲染函数
4. 实现建筑标记绘制（图标、边框、动画）
5. **实现保护盾绘制**
6. **实现联盟名称显示（缩放逻辑）**
7. 实现缩放和平移交互
8. 创建 `MapLegend.tsx`

### 阶段 4：特殊功能（3-4小时）
1. 实现工程站保护盾倒计时
2. 实现堡垒/要塞固定时间逻辑
3. 实现管理员分配系统
4. 实现奖励信息显示
5. 实现权限管理

### 阶段 5：双向互动（2-3小时）
1. 实现 `useInteraction` Hook
2. 列表 → 地图联动
3. 地图 → 列表联动
4. 悬停效果
5. 高亮和动画效果

### 阶段 6：样式和优化（2小时）
1. 完善 `buildingManager.css`
2. 添加动画和过渡效果
3. 响应式调整（虽然主要针对桌面端）
4. 性能优化

### 阶段 7：测试和调试（2-3小时）
1. 功能测试（所有建筑类型）
2. 时间系统测试（倒计时、固定时间）
3. 权限测试
4. 性能测试
5. 跨浏览器测试
6. Bug 修复

---

## 技术要点

### 时间处理最佳实践
```typescript
// 获取当前 Unix 时间戳（秒）
const now = Math.floor(Date.now() / 1000);

// Unix 时间戳转 Date 对象
const date = new Date(timestamp * 1000);

// 格式化显示
const formatted = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
}).format(date);

// 倒数计时（工程站保护盾）
const remaining = protectionEndTime - now;
const days = Math.floor(remaining / 86400);
const hours = Math.floor((remaining % 86400) / 3600);
const minutes = Math.floor((remaining % 3600) / 60);
```

### Canvas 性能优化
```typescript
// 使用离屏 Canvas 缓存静态内容
const offscreenCanvas = document.createElement('canvas');
drawStaticContent(offscreenCanvas.getContext('2d'));

// 主 Canvas 只绘制动态内容
function render() {
  ctx.drawImage(offscreenCanvas, 0, 0);
  drawDynamicMarkers(ctx);
  requestAnimationFrame(render);
}
```

### 虚拟滚动实现
```typescript
// 只渲染可见区域的建筑卡片
const visibleRange = {
  start: Math.floor(scrollTop / itemHeight),
  end: Math.ceil((scrollTop + viewportHeight) / itemHeight)
};

const visibleBuildings = buildings.slice(
  visibleRange.start,
  visibleRange.end
);
```

### 固定时间规则实现
```typescript
// 堡垒固定开启时间（示例：每周一、三、五 20:00 UTC+8）
export function getNextFortressOpenTime(currentTime: number): number {
  const date = new Date(currentTime * 1000);
  const dayOfWeek = date.getDay(); // 0-6 (周日-周六)
  const targetDays = [1, 3, 5]; // 周一、三、五
  const targetHour = 20;
  
  // 计算下一个目标日期
  let daysToAdd = 0;
  for (const targetDay of targetDays) {
    if (dayOfWeek < targetDay) {
      daysToAdd = targetDay - dayOfWeek;
      break;
    }
  }
  
  if (daysToAdd === 0) {
    daysToAdd = 7 - dayOfWeek + targetDays[0];
  }
  
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  nextDate.setHours(targetHour, 0, 0, 0);
  
  return Math.floor(nextDate.getTime() / 1000);
}
```

---

## 后续扩展可能性

- 📊 **数据导入/导出**：支持 JSON 文件导入导出
- 📈 **统计面板**：显示联盟占领情况、开启统计
- 🔔 **通知提醒**：建筑即将开启时浏览器通知（Notification API）
- 🗺️ **路径规划**：计算两个建筑之间的距离
- 👥 **多用户同步**：通过后端 API 同步数据
- 📱 **移动端适配**：支持手机和平板设备
- 📜 **分配历史查看**：查看堡垒/要塞的历史分配记录
- 🎯 **自动分配建议**：基于联盟实力自动推荐分配方案
