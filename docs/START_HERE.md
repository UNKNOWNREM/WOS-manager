# WOS Building Manager - Start Here

## 📋 Quick Start for New Chat

This is the **WOS Building Manager** project - an interactive map and building management system.

### Important Files
1. **`implementation_plan.md`** - Complete implementation plan with all features and technical details
2. **`task.md`** - Task checklist to track implementation progress
3. **`corrected_map_data.json`** (in `world/` folder) - Correct coordinate data for all buildings

### Key Information

**Building Count**: 90 buildings total
- 12 Fortresses
- 4 Citadels  
- 74 Engineering Stations (8 sub-types)

**Engineering Station Sub-types**:
- Construction Facility (5)
- Gathering Facility (8)
- Production Facility (12)
- Tech Facility (12)
- Weapons Facility (5)
- Training Facility (16)
- Defense Facility (6)
- Expedition Facility (10)

**Tech Stack**:
- React + TypeScript
- HTML Canvas 2D (not Three.js)
- Default Language: **English** (i18n support reserved for future)
- No authentication/permissions - all features open to all users

**Reference Project**: https://github.com/Krozac/wos-interactive-map-lite

### Core Features
1. **Layout**: Left panel (40%, collapsible, zoomable) + Right map (60%)
2. **Engineering Stations**: 3-day protection shield with countdown
3. **Fortresses/Citadels**: Fixed opening times, reward display, alliance assignment
4. **Map Controls**: Zoom, pan, reset to center
5. **Navigation Bar**: Building type tabs with Engineering Station sub-type dropdown
6. **Auto-sort**: Buildings by opening time
7. **Two-way Interaction**: List ↔ Map click synchronization
8. **Data Persistence**: localStorage

### Next Steps
1. Review `implementation_plan.md` for complete technical details
2. Check `task.md` for implementation checklist
3. Start with "基础架构" (Foundation) tasks
4. Reference `world/corrected_map_data.json` for building coordinates

### To Resume Implementation
Just say: "Let's continue implementing the WOS Building Manager according to the implementation plan"
