# Release Notes for v1.3.0

## 🎉 Modernized Interactive CLI Interface

### ✨ Highlights

- **Interactive UI Overhaul**: A complete redesign of the interactive menu with a persistent dashboard and breadcrumb navigation.
- **Dashboard Widget**: Always-on status monitoring (service state, load, users, uptime) at the top of the screen.
- **Unified Theme**: A professional, standardized color palette and modern single-line borders.
- **Responsive Tables**: User lists now adapt to terminal width, showing more details on wide screens and summaries on narrow ones.
- **Screen Management**: Flicker-free experience with full-screen redraws and clean transitions.

### 📦 Key Features

#### 1. Persistent Dashboard
- Displays Service Status (Active/Inactive)
- Shows System Load & Memory Usage
- Tracks Active User Count
- Monitors Service Uptime

#### 2. Clean Navigation
- Breadcrumb bar (e.g., `Home > User Management`) keeps you oriented.
- Simplified headers without visual clutter.
- Consistent "Back" and "Exit" behavior.

#### 3. Visual Polish
- **Modern Borders**: Switched to single-line unicode box drawing characters.
- **Semantic Colors**:
  - 🔵 **Cyan/Blue**: Primary actions & headers
  - 🟢 **Green**: Success & Active states
  - 🔴 **Red**: Errors & Stops
  - ⚪ **Gray/Neutral**: Static labels & borders
- **Indicator Dots**: Replaced heavy text backgrounds with subtle status dots (●).

### 🔧 Technical Details

- **New Components**: `DashboardWidget`, `UserTable`
- **New Services**: `ScreenManager`, `NavigationManager`
- **Theme System**: Centralized `THEME` and `UI_CONSTANTS`
- **Performance**: Optimized rendering loop to prevent artifacts.

### ⬆️ Upgrade Guide

```bash
# Global installation
npm install -g xray-manager@latest

# Or update existing
npm update -g xray-manager
```

Enjoy the new look and feel!
