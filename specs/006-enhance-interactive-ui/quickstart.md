# Quickstart: Enhance Interactive UI

This feature introduces a polished, "app-like" interactive interface for the Xray VPN Manager.

## Key Changes

- **Dashboard**: A persistent status bar at the top of the screen shows Service Status, Uptime, and User Count.
- **Navigation**: A breadcrumb bar (e.g., `Home > User Management`) helps you track where you are.
- **Visuals**: Full-screen redraws prevent clutter, and tables are used for structured data.

## How to Use

1. **Launch Interactive Mode**:
   ```bash
   xray-manager interactive
   # or simply
   xray-manager
   ```

2. **Dashboard Overview**:
   - Look at the top of the screen.
   - **Service Status**: Green (Active) or Red (Inactive).
   - **System**: Shows basic load/memory.
   - **Users**: Total count of managed users.

3. **Navigation**:
   - Use `Up`/`Down` arrows to select menu items.
   - Press `Enter` to select.
   - Watch the breadcrumb bar below the dashboard update as you enter submenus.
   - Select "Back" or "Return" to go up a level.

4. **User Management**:
   - Go to "User Management" -> "List Users".
   - View the formatted table of users.
   - If you have many users, a summary row will appear at the bottom.

## Troubleshooting

- **Display Issues**: If lines look broken, ensure your terminal supports UTF-8 (Unicode). On Windows, use Windows Terminal or PowerShell.
- **Colors**: If colors are missing, check if `NO_COLOR` env var is set or use `--color` flag.
