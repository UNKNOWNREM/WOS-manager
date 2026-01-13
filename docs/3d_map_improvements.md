# 3D 地圖改進計畫

## 目標

改進 3D 地圖渲染系統，參考 [wos-interactive-map-lite](https://github.com/Krozac/wos-interactive-map-lite) 項目實現更好的視覺效果和交互體驗。

---

## 目前問題總結

### 已發現的問題

| # | 問題描述 | 嚴重程度 | 狀態 |
|---|---------|---------|------|
| 1 | Grid 輔助線太亂，影響視覺效果 | 中 | ⏳ 待修復 |
| 2 | 建築物標記大小需要調整（已放大 3x） | 中 | ⏳ 待修復 |
| 3 | 建築物 z 位置需要高於地圖平面 | 高 | ⏳ 待修復 |
| 4 | 地圖紋理路徑需要正確配置 | 高 | ⏳ 待修復 |
| 5 | 建築物顏色可能不夠明顯 | 低 | ⏳ 待驗證 |
| 6 | 選中效果需要優化 | 低 | ⏳ 待實現 |

---

## 提議的變更

### 1. 移除 Grid 輔助線

#### [MODIFY] [scene.ts](file:///d:/github/wos-manager/src/three/scene.ts)

**問題**：Grid 輔助線造成視覺混亂，影響地圖閱讀。

**解決方案**：
- 移除 `createGrid()` 函數調用
- 移除 `updateGrid()` 相關邏輯
- 清理所有 grid 相關代碼

```diff
- let gridHelper = createGrid(scene, 20);
- // 在 handleZoom 中移除 grid 更新邏輯
```

---

### 2. 建築物視覺優化

#### [MODIFY] [scene.ts](file:///d:/github/wos-manager/src/three/scene.ts)

**當前尺寸（已調整）**：
```typescript
const BUILDING_SIZES = {
    sun_city: { w: 36, h: 36 },      // 原本 12x12
    fortress: { w: 24, h: 24 },      // 原本 8x8
    citadel: { w: 18, h: 18 },       // 原本 6x6
    engineering_station: { w: 12, h: 12 },  // 原本 4x4
};
```

**建築物顏色配置**：
```typescript
const BUILDING_COLORS = {
    sun_city: 0xfbbf24,        // 金黃色
    fortress: 0xef4444,        // 紅色
    citadel: 0xa855f7,         // 紫色
    engineering_station: 0x3b82f6,  // 藍色
};
```

---

### 3. 選中效果增強

#### [MODIFY] [scene.ts](file:///d:/github/wos-manager/src/three/scene.ts)

**需實現**：
- 選中時顯示高亮邊框
- 添加脈動動畫效果
- 其他建築物降低透明度

```typescript
function setSelectedBuilding(buildingId: string | null) {
    // 1. 移除舊選中效果
    if (selectedId && buildingMeshes.has(selectedId)) {
        const oldMesh = buildingMeshes.get(selectedId);
        removeHighlight(oldMesh);
    }
    
    // 2. 添加新選中效果
    if (buildingId && buildingMeshes.has(buildingId)) {
        const mesh = buildingMeshes.get(buildingId);
        addHighlight(mesh);
        
        // 3. 降低其他建築物透明度
        buildingMeshes.forEach((m, id) => {
            if (id !== buildingId) {
                setOpacity(m, 0.3);
            }
        });
    } else {
        // 恢復所有建築物透明度
        buildingMeshes.forEach(m => setOpacity(m, 1));
    }
    
    selectedId = buildingId;
}
```

---

### 4. 相機控制優化

#### [MODIFY] [scene.ts](file:///d:/github/wos-manager/src/three/scene.ts)

**現有配置**：
- 相機固定在 z=1000
- 使用 FOV 控制縮放
- 禁用旋轉，只允許平移

**優化項目**：
- [ ] 縮放範圍限制 (FOV 30° - 75°)
- [ ] 平移邊界限制（不超出地圖範圍）
- [ ] 平滑過渡動畫

---

### 5. UI 控制項優化

#### [MODIFY] [MapView3D.tsx](file:///d:/github/wos-manager/src/components/building/MapView3D.tsx)

**現有控制項**：
- 縮放 +/- 按鈕
- 重置視圖按鈕
- 建築類型圖例

**優化項目**：
- [ ] 添加全螢幕按鈕
- [ ] 縮放級別顯示（如 "105%"）
- [ ] 建築類型篩選器

---

## 驗證計畫

### 自動化測試
```bash
# 啟動開發服務器
npm run dev

# 在瀏覽器中測試
# 1. 訪問 http://localhost:5173/map.html
# 2. 驗證地圖紋理載入
# 3. 驗證建築物顯示
# 4. 測試縮放和平移功能
# 5. 測試建築物選擇功能
```

### 手動驗證清單
- [ ] 地圖紋理正確載入
- [ ] 建築物標記清晰可見
- [ ] 無 Grid 輔助線干擾
- [ ] 縮放和平移流暢
- [ ] 選中效果正確顯示
- [ ] 控制按鈕功能正常

---

## 相關文件

| 文件 | 描述 |
|-----|------|
| [scene.ts](file:///d:/github/wos-manager/src/three/scene.ts) | Three.js 場景管理器 |
| [MapView3D.tsx](file:///d:/github/wos-manager/src/components/building/MapView3D.tsx) | 3D 地圖組件 |
| [map2.png](file:///d:/github/wos-manager/public/world/map2.png) | 地圖紋理圖片 |
| [implementation_plan.md](file:///d:/github/wos-manager/docs/implementation_plan.md) | 完整實施計畫 |

---

## 參考項目

> [!NOTE]
> **參考項目**：[Krozac/wos-interactive-map-lite](https://github.com/Krozac/wos-interactive-map-lite)
> 
> 關鍵參考文件：
> - `plane.js` - 地圖平面創建
> - `camera.js` - 相機設置和縮放控制
> - `controls.js` - 交互控制
> - `textures.js` - 紋理載入
