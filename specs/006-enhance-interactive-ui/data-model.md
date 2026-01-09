# Data Model: Enhance Interactive UI

## Entities

### DashboardState

Represents the snapshot of data displayed in the persistent dashboard.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `serviceStatus` | `ServiceStatus` | Current state of the Xray service (active, inactive, etc.) | `SystemdManager.getStatus()` |
| `uptime` | `string` | Formatted uptime string | System / Service info |
| `version` | `string` | Xray or CLI tool version | `package.json` / Binary |
| `userCount` | `number` | Total number of configured users | `UserManager.listUsers()` |
| `systemLoad` | `string` | Basic system load info (optional, e.g. "Load: 0.5, Mem: 40%") | `os.loadavg()` / `os.freemem()` |

### NavigationContext

Represents a single level in the menu hierarchy.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the menu (e.g., 'main', 'user-mgmt') |
| `label` | `string` | Display name for the breadcrumb (e.g., "Home", "User Management") |
| `parent` | `NavigationContext` (optional) | Reference to the parent context |

### TableConfig

Configuration for rendering adaptive tables.

| Field | Type | Description |
|-------|------|-------------|
| `columns` | `ColumnDefinition[]` | List of columns to display |
| `maxRows` | `number` | Maximum number of rows before summarization |
| `summaryLabel` | `string` | Text to display in the summary row (e.g., "+ 5 more") |

### ColumnDefinition

| Field | Type | Description |
|-------|------|-------------|
| `header` | `string` | Header text |
| `field` | `string` | Data field key |
| `width` | `string` | Width strategy (fixed, percent, adaptive) |
| `priority` | `number` | Priority for hiding on small screens (1=Highest) |

## State Transitions

### Navigation Flow

1. **Start**: `NavigationStack` initialized with `['Home']`.
2. **Push**: User selects "User Management" -> Stack becomes `['Home', 'User Management']`.
3. **Pop**: User selects "Back" -> Stack becomes `['Home']`.
